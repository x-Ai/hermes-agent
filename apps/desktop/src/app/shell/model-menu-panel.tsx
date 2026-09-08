import { useStore } from '@nanostores/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { useSessionView } from '@/app/chat/session-view'
import { Codicon } from '@/components/ui/codicon'
import { DropdownMenuItem, dropdownMenuRow } from '@/components/ui/dropdown-menu'
import type { HermesGateway } from '@/hermes'
import { useI18n } from '@/i18n'
import { modelOptionsQueryKey, reconcileSelectionAfterCatalogRefresh, requestModelOptions } from '@/lib/model-options'
import { currentPickerSelection } from '@/lib/model-status-label'
import { cn } from '@/lib/utils'
import { $modelPresets, applyModelPreset, modelPresetKey, setModelPreset } from '@/store/model-presets'
import { notifyError } from '@/store/notifications'
import { markComposerSelectionManual, setCurrentFastMode, setCurrentReasoningEffort } from '@/store/session'
import { sessionTileDelegate } from '@/store/session-states'
import type { ModelOptionsResponse } from '@/types/hermes'

import { ModelCatalogMenu, type ModelMenuController } from './model-catalog-menu'

export { ModelMenuCloseContext } from './model-catalog-menu'

export interface ModelSelection {
  model: string
  provider: string
  /** Runtime id of the surface that opened the menu. When set, the switch
   *  targets that session (a tile) instead of the primary `$activeSessionId`. */
  sessionId?: null | string
}

interface ModelMenuPanelProps {
  gateway?: HermesGateway
  ownerConnectionId?: string
  onSelectModel: (selection: ModelSelection) => Promise<boolean> | void
  profile?: string
  requestGateway: <T>(method: string, params?: Record<string, unknown>) => Promise<T>
}

/**
 * The composer's model menu: `ModelCatalogMenu` (the shared renderer) plus the
 * controller that gives a selection its meaning HERE — write through to this
 * surface's session, remember the pick as a global preset, keep the optimistic
 * stores honest, and roll back on a failed gateway write.
 */
export function ModelMenuPanel({
  gateway,
  onSelectModel,
  ownerConnectionId,
  profile = 'default',
  requestGateway
}: ModelMenuPanelProps) {
  const { t } = useI18n()
  const copy = t.shell.modelMenu
  const [refreshing, setRefreshing] = useState(false)
  const queryClient = useQueryClient()
  // Bind to THIS surface's SessionView (primary or tile) so each pane's menu
  // shows/switches its own model — not the primary-only globals.
  const view = useSessionView()
  const activeSessionId = useStore(view.$runtimeId)
  const currentFastMode = useStore(view.$fast)
  const currentModel = useStore(view.$model)
  const currentProvider = useStore(view.$provider)
  const currentReasoningEffort = useStore(view.$reasoningEffort)
  const modelPresets = useStore($modelPresets)
  const touchesPrimary = view.kind === 'primary'

  const [contextSelection, setContextSelection] = useState<{
    key: string
    value: number | null
  } | null>(null)

  // Subscribe to the SAME query the menu runs (identical key ⇒ React Query
  // dedupes, no second fetch). It must be a live subscription, not a cache
  // peek: with no model in the session store yet, currentPickerSelection falls
  // back to the catalog's reported current, and a non-reactive read would
  // never repaint that fallback once the catalog resolved.
  const modelOptions = useQuery({
    queryKey: modelOptionsQueryKey(profile, activeSessionId, ownerConnectionId),
    queryFn: (): Promise<ModelOptionsResponse> =>
      requestModelOptions({ gateway, profile, request: requestGateway, sessionId: activeSessionId })
  })

  const { model: optionsModel, provider: optionsProvider } = currentPickerSelection(
    { model: currentModel, provider: currentProvider },
    modelOptions.data
  )

  const optionsPresetModel = optionsModel.replace(/-fast$/i, '').replace(/-900k$/i, '')
  const contextKey = `${activeSessionId ?? 'draft'}\u0000${optionsProvider}\u0000${optionsPresetModel}`
  const currentPreset = modelPresets[modelPresetKey(optionsProvider, optionsPresetModel)]

  const currentContextLength =
    contextSelection?.key === contextKey
      ? contextSelection.value
      : activeSessionId
        ? modelOptions.data?.context_length
        : currentPreset?.contextLength

  // Explicit "Refresh Models": re-fetch the catalog with refresh:true so the
  // backend busts its 1h provider-model disk cache and re-pulls each provider's
  // live list. Fixes live-only models (e.g. OpenCode Zen free tier) vanishing
  // when the cache expires and falls back to the curated static list.
  const refreshModels = async () => {
    if (refreshing) {
      return
    }

    setRefreshing(true)

    try {
      const queryKey = modelOptionsQueryKey(profile, activeSessionId, ownerConnectionId)

      const next = await requestModelOptions({
        gateway,
        profile,
        refresh: true,
        request: requestGateway,
        sessionId: activeSessionId
      })

      queryClient.setQueryData<ModelOptionsResponse>(queryKey, next)

      // Group / credential swaps can return a catalog that no longer contains
      // the session's current model. The store + currentPickerSelection would
      // otherwise keep painting the stale id (it is not in the new list).
      const switchTo = reconcileSelectionAfterCatalogRefresh(optionsModel, next.providers)

      if (switchTo) {
        await onSelectModel({ ...switchTo, sessionId: activeSessionId || null })
      }
    } catch {
      // Network/backend hiccup — fall back to a plain invalidate so the next
      // open re-fetches (still cached, but no worse than before).
      void queryClient.invalidateQueries({ queryKey: ['model-options'] })
    } finally {
      setRefreshing(false)
    }
  }

  // Push a reasoning change onto the session that owns it, with rollback.
  const patchReasoning = async (next: string, previous: string, provider: string, model: string) => {
    if (touchesPrimary) {
      markComposerSelectionManual()
      setCurrentReasoningEffort(next)
    } else if (activeSessionId) {
      sessionTileDelegate()?.updateSession(activeSessionId, state => ({ ...state, reasoningEffort: next }))
    }

    // Preset-only without a session: the gateway's `config.set` falls back to
    // global config when none matches — so don't reach it (preset + optimistic
    // store are the whole effect).
    if (!activeSessionId) {
      return
    }

    try {
      await requestGateway('config.set', { key: 'reasoning', session_id: activeSessionId, value: next })
    } catch (err) {
      if (touchesPrimary) {
        setCurrentReasoningEffort(previous)
      } else {
        sessionTileDelegate()?.updateSession(activeSessionId, state => ({ ...state, reasoningEffort: previous }))
      }

      setModelPreset(provider, model, { effort: previous })
      notifyError(err, t.shell.modelOptions.updateFailed)
    }
  }

  const patchFast = async (enabled: boolean, provider: string, model: string) => {
    if (touchesPrimary) {
      markComposerSelectionManual()
      setCurrentFastMode(enabled)
    } else if (activeSessionId) {
      sessionTileDelegate()?.updateSession(activeSessionId, state => ({ ...state, fast: enabled }))
    }

    if (!activeSessionId) {
      return
    }

    try {
      await requestGateway('config.set', {
        key: 'fast',
        session_id: activeSessionId,
        value: enabled ? 'fast' : 'normal'
      })
    } catch (err) {
      if (touchesPrimary) {
        setCurrentFastMode(!enabled)
      } else {
        sessionTileDelegate()?.updateSession(activeSessionId, state => ({ ...state, fast: !enabled }))
      }

      setModelPreset(provider, model, { fast: !enabled })
      notifyError(err, t.shell.modelOptions.fastFailed)
    }
  }

  const patchContextLength = async (
    next: number,
    previous: number | null | undefined,
    provider: string,
    model: string
  ) => {
    const key = `${activeSessionId ?? 'draft'}\u0000${provider}\u0000${model}`
    setContextSelection({ key, value: next })

    if (touchesPrimary) {
      // A context tier belongs to a concrete model. Pin the currently shown
      // model so a fresh session can carry this draft-only choice.
      markComposerSelectionManual()
    }

    if (!activeSessionId) {
      return
    }

    try {
      await requestGateway('config.set', { key: 'context_length', session_id: activeSessionId, value: next })
      queryClient.setQueryData<ModelOptionsResponse>(
        modelOptionsQueryKey(profile, activeSessionId, ownerConnectionId),
        current => (current ? { ...current, context_length: next } : current)
      )
    } catch (err) {
      setContextSelection({ key, value: previous ?? null })
      setModelPreset(provider, model, { contextLength: previous ?? null })
      notifyError(err, t.shell.modelOptions.updateFailed)
    }
  }

  const controller: ModelMenuController = {
    // Selecting a model row restores that model's remembered preset onto the
    // session (effort/fast). applyModelPreset owns the batched gateway write.
    applyPreset: (preset, row) => {
      setModelPreset(row.provider, row.model, preset)
      setContextSelection({
        key: `${activeSessionId ?? 'draft'}\u0000${row.provider}\u0000${row.model}`,
        value: preset.contextLength ?? null
      })

      void applyModelPreset(preset, {
        failMessage: t.shell.modelOptions.updateFailed,
        primary: touchesPrimary,
        request: requestGateway,
        sessionId: activeSessionId
      })
    },

    current: {
      contextLength: currentContextLength,
      effort: currentReasoningEffort,
      fast: currentFastMode,
      model: optionsModel,
      provider: optionsProvider
    },

    presetFor: (provider, model) => modelPresets[modelPresetKey(provider, model)] ?? {},

    // The composer picker never persists the profile default. With a session it
    // scopes the switch to that session; with none it's UI state shipped on the
    // next session.create. Always stamp sessionId from this surface so a tile
    // switch never hits the primary (busy) session by accident.
    select: (model, provider) => onSelectModel({ model, provider, sessionId: activeSessionId || null }),

    setOptions: (patch, row) => {
      // Editing always records the model's global preset (keyed by
      // provider::model, not per-surface — a tile edit re-applies to that model
      // everywhere); the active model also gets it pushed onto its OWN session.
      // Non-active edits stay preset-only — no model switch, no session write.
      if (patch.contextLength !== undefined || patch.effort !== undefined || patch.fast !== undefined) {
        setModelPreset(row.provider, row.model, patch)
      }

      if (!row.isActive) {
        return
      }

      if (patch.effort !== undefined) {
        void patchReasoning(patch.effort, currentReasoningEffort, row.provider, row.model)
      }

      if (patch.fast !== undefined) {
        void patchFast(patch.fast, row.provider, row.model)
      }

      if (patch.contextLength !== undefined) {
        void patchContextLength(patch.contextLength, currentContextLength, row.provider, row.model)
      }
    },

    supportsContextOptions: true
  }

  return (
    <ModelCatalogMenu
      controller={controller}
      footer={
        <DropdownMenuItem
          className={cn(dropdownMenuRow, 'text-(--ui-text-tertiary)')}
          disabled={refreshing}
          onSelect={event => {
            event.preventDefault()
            void refreshModels()
          }}
        >
          <Codicon className={cn(refreshing && 'animate-spin')} name="sync" size="0.75rem" />
          {copy.refreshModels}
        </DropdownMenuItem>
      }
      gateway={gateway}
      includeMoa
      ownerConnectionId={ownerConnectionId}
      profile={profile}
      request={requestGateway}
      sessionId={activeSessionId}
    />
  )
}
