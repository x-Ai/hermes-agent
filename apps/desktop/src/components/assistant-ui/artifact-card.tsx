'use client'

import { useStore } from '@nanostores/react'
import { useEffect, useMemo } from 'react'

import { useSessionView } from '@/app/chat/session-view'
import { CodeCardIcon } from '@/components/chat/code-card'
import { SCAFFOLD_GLYPH_CLASS, SCAFFOLD_LABEL_CLASS, SCAFFOLD_META_CLASS } from '@/components/chat/scaffold-row'
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
        'group/artifact flex h-(--conversation-line-height) w-fit max-w-full items-center gap-1.5 overflow-hidden rounded-sm text-left transition-colors duration-150',
        streaming
          ? 'cursor-default'
          : 'cursor-pointer hover:text-foreground focus-visible:text-foreground focus-visible:outline-none'
      )}
      data-conversation-scaffold=""
      data-slot="aui_artifact-card"
      disabled={streaming}
      onClick={open}
      type="button"
    >
      <span
        className={cn(
          SCAFFOLD_GLYPH_CLASS,
          'text-muted-foreground/60 transition-colors group-hover/artifact:text-muted-foreground'
        )}
        data-slot="aui_artifact-card-glyph"
      >
        <CodeCardIcon className="text-inherit" name={detectionIcon(detection)} />
      </span>
      <span
        className={cn(
          SCAFFOLD_LABEL_CLASS,
          'min-w-0 truncate font-normal transition-colors group-hover/artifact:text-foreground',
          streaming && 'shimmer'
        )}
        data-slot="aui_artifact-card-title"
      >
        {title}
      </span>
      {streaming ? (
        <span className={cn(SCAFFOLD_META_CLASS, 'font-mono')} data-slot="aui_artifact-card-meta">
          {copy.generating(lineCount)}
        </span>
      ) : (
        <>
          {versionCount > 1 && versionIndex >= 0 && (
            <span className={cn(SCAFFOLD_META_CLASS, 'font-mono')} data-slot="aui_artifact-card-version">
              {copy.versionBadge(versionIndex + 1, versionCount)}
            </span>
          )}
          <span
            className={cn(
              SCAFFOLD_LABEL_CLASS,
              'shrink-0 font-mono tabular-nums text-emerald-600 dark:text-emerald-400'
            )}
            data-slot="aui_artifact-card-lines"
          >
            +{lineCount}
          </span>
        </>
      )}
    </button>
  )
}
