'use client'

import { useStore } from '@nanostores/react'
import { useEffect, useMemo } from 'react'

import { useSessionView } from '@/app/chat/session-view'
import { CodeCardIcon } from '@/components/chat/code-card'
import { useI18n } from '@/i18n'
import type { ArtifactDetection } from '@/lib/artifact-detect'
import { codiconForLanguage } from '@/lib/markdown-code'
import { cn } from '@/lib/utils'
import { $artifactRegistry, artifactsForSession, openArtifact, upsertArtifact } from '@/store/artifacts'

interface ArtifactCardProps {
  code: string
  detection: ArtifactDetection
  streaming?: boolean
}

const KIND_ICON: Record<ArtifactDetection['kind'], string> = {
  code: 'code',
  html: 'browser',
  svg: 'symbol-color'
}

function detectionIcon(detection: ArtifactDetection): string {
  return detection.kind === 'code' ? codiconForLanguage(detection.language) : KIND_ICON[detection.kind]
}

/**
 * Transcript stand-in for a fenced block that was promoted to an artifact.
 * Replaces the wall of code with a compact, openable file-like row: icon,
 * title, version, and source line count. While the fence is still streaming
 * it shows a shimmer instead of the growing source.
 *
 * Registration is automatic on completion (so version history accumulates
 * even if the user never opens the card) but opening the rail is strictly
 * click-driven — a background stream never steals the pane.
 */
export function ArtifactCard({ code, detection, streaming = false }: ArtifactCardProps) {
  const { t } = useI18n()
  const copy = t.artifactCard
  const view = useSessionView()
  const runtimeId = useStore(view.$runtimeId)
  const storedId = useStore(view.$storedId)
  const registry = useStore($artifactRegistry)
  const sessionId = storedId || runtimeId || ''

  const trimmed = code.trim()

  // Register/version the artifact once its fence has finished streaming.
  // upsertArtifact dedupes on content hash, so re-renders and transcript
  // replays are no-ops.
  useEffect(() => {
    if (!streaming && sessionId && trimmed) {
      upsertArtifact(sessionId, detection, trimmed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- detection derives from code
  }, [detection.kind, detection.language, detection.title, sessionId, streaming, trimmed])

  const record = useMemo(() => {
    void registry

    const slugMatch = artifactsForSession(sessionId).find(
      candidate => candidate.kind === detection.kind && candidate.versions.some(v => v.content === trimmed)
    )

    return slugMatch ?? null
  }, [detection.kind, registry, sessionId, trimmed])

  const lineCount = useMemo(() => trimmed.split('\n').length, [trimmed])
  const kindLabel = copy.kind[detection.kind]
  const versionCount = record?.versions.length ?? 0
  const versionIndex = record?.versions.findIndex(version => version.content === trimmed) ?? -1
  const title = (record?.title || detection.title || kindLabel).trim() || kindLabel

  const open = () => {
    if (streaming || !sessionId || !trimmed) {
      return
    }

    // Ensure the registry row exists even if the completion effect hasn't
    // fired yet (e.g. clicked in the same frame the stream sealed).
    const result = upsertArtifact(sessionId, detection, trimmed)

    if (!result) {
      return
    }

    // An older card opens at ITS version, not silently the newest — the user
    // clicked this specific iteration.
    const versionIndex = result.record.versions.findIndex(version => version.content === trimmed)

    openArtifact(result.artifactId, versionIndex === -1 ? undefined : versionIndex)
  }

  return (
    <button
      aria-label={`${copy.open}: ${title}`}
      className={cn(
        'group/artifact my-0.5 flex w-full max-w-md items-center gap-2 overflow-hidden rounded-md px-1 py-1.5 text-left transition-colors duration-150',
        streaming
          ? 'cursor-default'
          : 'cursor-pointer hover:bg-(--ui-row-hover-background) focus-visible:bg-(--ui-row-hover-background) focus-visible:outline-none'
      )}
      data-slot="aui_artifact-card"
      disabled={streaming}
      onClick={open}
      type="button"
    >
      <span className="grid size-5 shrink-0 place-items-center text-muted-foreground/60 transition-colors group-hover/artifact:text-muted-foreground">
        <CodeCardIcon className="text-[1rem] text-inherit" name={detectionIcon(detection)} />
      </span>
      <span
        className={cn(
          'min-w-0 truncate text-[length:var(--conversation-text-font-size)] font-normal text-muted-foreground/75 transition-colors group-hover/artifact:text-foreground',
          streaming && 'shimmer'
        )}
      >
        {title}
      </span>
      {streaming ? (
        <span className="shrink-0 text-[length:var(--conversation-tool-font-size)] text-muted-foreground/55">
          {copy.generating(lineCount)}
        </span>
      ) : (
        <>
          {versionCount > 1 && versionIndex >= 0 && (
            <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-muted-foreground/45">
              {copy.versionBadge(versionIndex + 1, versionCount)}
            </span>
          )}
          <span className="shrink-0 font-mono text-[0.75rem] tabular-nums text-emerald-600 dark:text-emerald-400">
            +{lineCount}
          </span>
        </>
      )}
    </button>
  )
}
