/**
 * Working-directory controls for a group chat: the room folder field shared by
 * the create and settings dialogs, the per-member own-folder row, and the
 * settings dialog's draft (validate against the gateways, then apply).
 *
 * Validation goes to the gateway that will run the member: `config.get project`
 * answers with the folder when that host can see it, so a path typed for a
 * member on another machine is checked THERE, and the room folder is checked
 * on this window's gateway. Nothing is written until every changed folder
 * passed, and a failure keeps the dialog open with the offending path named.
 */

import { Button, Codicon, host, Input, Tip, useValue } from '@hermes/plugin-sdk'
import { useEffect, useState } from 'react'

import { $groupChats } from './group-chat'
import { groupMemberKey } from './group-membership'
import {
  type GroupWorkspaceSource,
  memberFollowsRoomWorkspace,
  normalizeGroupWorkspacePath,
  probeGroupWorkspace,
  resolveGroupMemberWorkspace,
  sameGroupWorkspace,
  setGroupChatWorkspace,
  setGroupMemberWorkspace
} from './group-workspace'
import { useBots } from './i18n'
import type { GroupMember } from './types'

/** The last path segment, for chips; the full path rides the tooltip. */
export function workspaceLeaf(path: string): string {
  const parts = String(path || '')
    .split(/[\\/]+/)
    .filter(Boolean)

  return parts[parts.length - 1] || path
}

async function pickFolder(current: string): Promise<null | string> {
  if (typeof host.selectPaths !== 'function') {
    return null
  }

  const picked = await host.selectPaths({
    directories: true,
    multiple: false,
    ...(current.trim() ? { defaultPath: current.trim() } : {})
  })

  return picked?.[0] || null
}

interface GroupWorkspaceFieldProps {
  onChange: (value: string) => void
  value: string
}

/** The room folder: a path field with the native picker beside it. Controlled;
 *  the owner decides when (and whether) the value is validated and saved. */
export function GroupWorkspaceField({ onChange, value }: GroupWorkspaceFieldProps) {
  const b = useBots()
  const canPick = typeof host.selectPaths === 'function'

  return (
    <div className="grid gap-1" data-testid="group-workspace-field">
      <div className="text-xs font-medium text-(--ui-text-secondary)">{b.group.workspaceLabel}</div>
      <div className="flex items-center gap-1.5">
        <Input
          aria-label={b.group.workspaceLabel}
          className="min-w-0 flex-1"
          onChange={event => onChange(event.target.value)}
          placeholder={b.group.workspacePlaceholder}
          spellCheck={false}
          value={value}
        />
        {canPick ? (
          <Tip label={b.group.workspacePick}>
            <Button
              aria-label={b.group.workspacePick}
              onClick={() => void pickFolder(value).then(picked => picked && onChange(picked))}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Codicon name="folder-opened" />
            </Button>
          </Tip>
        ) : null}
        {value.trim() ? (
          <Tip label={b.group.workspaceClear}>
            <Button
              aria-label={b.group.workspaceClear}
              onClick={() => onChange('')}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Codicon name="close" />
            </Button>
          </Tip>
        ) : null}
      </div>
      <div className="text-[0.625rem] text-(--ui-text-quaternary)">{b.group.workspaceHint}</div>
    </div>
  )
}

interface GroupMemberWorkspaceFieldProps {
  effective: { cwd: null | string; source: GroupWorkspaceSource | null }
  member: GroupMember
  onChange: (value: string) => void
  value: string
}

/** One member's own folder, with the folder the ladder resolves for it today. */
export function GroupMemberWorkspaceField({ effective, member, onChange, value }: GroupMemberWorkspaceFieldProps) {
  const b = useBots()
  const remote = !memberFollowsRoomWorkspace(member)
  const canPick = !remote && typeof host.selectPaths === 'function'
  const source = effective.source ?? 'profile'

  return (
    <div className="grid gap-0.5" data-testid="group-member-workspace">
      <div className="flex items-center gap-1.5">
        <Input
          aria-label={`${b.group.workspaceLabel}: ${member.name}`}
          className="h-7 min-w-0 flex-1 text-xs"
          onChange={event => onChange(event.target.value)}
          placeholder={remote ? b.group.memberWorkspaceRemotePlaceholder : b.group.memberWorkspacePlaceholder}
          spellCheck={false}
          value={value}
        />
        {canPick ? (
          <Button
            aria-label={b.group.workspacePick}
            onClick={() => void pickFolder(value).then(picked => picked && onChange(picked))}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Codicon name="folder-opened" />
          </Button>
        ) : null}
      </div>
      <Tip label={effective.cwd || b.group.workspacePlaceholder}>
        <div className="truncate text-[0.625rem] text-(--ui-text-quaternary)">
          <Codicon className="mr-1" name="folder" />
          {effective.cwd ? `${workspaceLeaf(effective.cwd)} · ` : ''}
          {b.group.workspaceSource(source)}
        </div>
      </Tip>
    </div>
  )
}

export interface GroupWorkspaceDraft {
  /** The ladder's answer for a member under the DRAFT values. */
  effectiveFor: (member: GroupMember) => { cwd: null | string; source: GroupWorkspaceSource | null }
  memberWorkspaces: Record<string, string>
  setMemberWorkspace: (member: GroupMember, value: string) => void
  setWorkspace: (value: string) => void
  workspace: string
  /** Probe every changed folder on the gateway that will use it; false (with a
   *  notice) when one is unreachable there. Normalizes accepted paths. */
  validate: () => Promise<boolean>
  /** Persist the changed folders onto the room (after a rename, under its new name). */
  apply: (group: string) => void
}

export function useGroupWorkspaceDraft(group: string, members: GroupMember[], open: boolean): GroupWorkspaceDraft {
  const b = useBots()
  const rooms = useValue($groupChats)
  const room = rooms[group]
  const currentWorkspace = room?.workspace || ''
  const currentMembers = room?.memberWorkspaces || {}
  const [workspace, setWorkspace] = useState(currentWorkspace)
  const [memberWorkspaces, setMemberWorkspaces] = useState<Record<string, string>>({ ...currentMembers })

  useEffect(() => {
    if (open) {
      setWorkspace(currentWorkspace)
      setMemberWorkspaces({ ...currentMembers })
    }
    // Reset per open only; the live room must not clobber an in-progress edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group])

  const setMemberWorkspace = (member: GroupMember, value: string) =>
    setMemberWorkspaces(previous => ({ ...previous, [groupMemberKey(member)]: value }))

  const effectiveFor = (member: GroupMember) =>
    resolveGroupMemberWorkspace({ memberWorkspaces, workspace }, member)

  const changedMembers = () =>
    members.filter(member => {
      const key = groupMemberKey(member)

      return !sameGroupWorkspace(memberWorkspaces[key], currentMembers[key])
    })

  const validate = async () => {
    const checks: Array<{ apply: (resolved: string) => void; member: GroupMember | null; path: string }> = []

    if (!sameGroupWorkspace(workspace, currentWorkspace) && normalizeGroupWorkspacePath(workspace)) {
      checks.push({ apply: setWorkspace, member: null, path: workspace })
    }

    for (const member of changedMembers()) {
      const path = memberWorkspaces[groupMemberKey(member)]

      if (normalizeGroupWorkspacePath(path)) {
        checks.push({ apply: resolved => setMemberWorkspace(member, resolved), member, path })
      }
    }

    for (const check of checks) {
      const resolved = await probeGroupWorkspace(check.member, check.path).catch(() => null)

      if (!resolved) {
        host.notify({ kind: 'error', message: b.group.workspaceInvalid(check.path.trim()) })

        return false
      }

      check.apply(resolved)
    }

    return true
  }

  const apply = (target: string) => {
    if (!sameGroupWorkspace(workspace, currentWorkspace)) {
      setGroupChatWorkspace(target, workspace)
    }

    for (const member of changedMembers()) {
      setGroupMemberWorkspace(target, member, memberWorkspaces[groupMemberKey(member)])
    }
  }

  return { apply, effectiveFor, memberWorkspaces, setMemberWorkspace, setWorkspace, validate, workspace }
}
