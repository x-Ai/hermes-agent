import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import {
  activateCustomEndpoint,
  deleteCustomEndpoint,
  getCustomEndpoints,
  saveCustomEndpoint,
  validateCustomEndpoint
} from '@/hermes'
import { useI18n } from '@/i18n'
import { triggerHaptic } from '@/lib/haptics'
import { Check, Globe, Loader2, Plus, Save, Trash2, Zap } from '@/lib/icons'
import { notify, notifyError } from '@/store/notifications'
import type { CustomEndpoint, CustomEndpointUpdate, CustomEndpointValidationResponse } from '@/types/hermes'

import { EmptyState, Pill, SectionHeading, SettingsContent, SettingsSkeleton } from './primitives'

interface CustomEndpointsSettingsProps {
  onConfigSaved?: () => void
  onMainModelChanged?: (provider: string, model: string) => void
}

interface EndpointForm {
  apiKey: string
  /** '' = OpenAI-compatible (the default wire). */
  apiMode: string
  /** '' = auto-detect; only sent meaningfully with the Anthropic wire. */
  authScheme: string
  baseUrl: string
  contextLength: string
  discoverModels: boolean
  id: string
  makeDefault: boolean
  model: string
  name: string
}

const EMPTY_FORM: EndpointForm = {
  apiKey: '',
  apiMode: '',
  authScheme: '',
  baseUrl: '',
  contextLength: '',
  discoverModels: true,
  id: '',
  makeDefault: true,
  model: '',
  name: ''
}

// The wires the editor knows ('' = Auto: leave protocol detection to the
// runtime). Hand-written modes outside this list still round-trip: the editor
// shows them as an extra segment and OMITS api_mode from the save payload, so
// the backend preserves the entry untouched (unknown values are rejected 422).
const KNOWN_API_MODES = ['', 'chat_completions', 'codex_responses', 'anthropic_messages'] as const

const isKnownApiMode = (mode: string): boolean => (KNOWN_API_MODES as readonly string[]).includes(mode)

function formFromEndpoint(endpoint: CustomEndpoint): EndpointForm {
  return {
    apiKey: '',
    apiMode: endpoint.api_mode ?? '',
    authScheme: endpoint.auth_scheme ?? '',
    baseUrl: endpoint.base_url,
    contextLength: endpoint.context_length ? String(endpoint.context_length) : '',
    discoverModels: endpoint.discover_models,
    id: endpoint.id,
    makeDefault: Boolean(endpoint.is_current),
    model: endpoint.model,
    name: endpoint.name
  }
}

function toPayload(form: EndpointForm): CustomEndpointUpdate {
  const contextLength = Number.parseInt(form.contextLength, 10)

  return {
    id: form.id.trim() || undefined,
    name: form.name.trim(),
    base_url: form.baseUrl.trim(),
    model: form.model.trim(),
    api_key: form.apiKey.trim() || undefined,
    // Omitted (not '') for hand-written modes the editor doesn't know — the
    // backend preserves omitted fields but rejects unknown values.
    api_mode: isKnownApiMode(form.apiMode) ? form.apiMode : undefined,
    auth_scheme: isKnownApiMode(form.apiMode)
      ? form.apiMode === 'anthropic_messages'
        ? form.authScheme
        : ''
      : undefined,
    context_length: Number.isFinite(contextLength) && contextLength > 0 ? contextLength : undefined,
    discover_models: form.discoverModels,
    make_default: form.makeDefault
  }
}

export function CustomEndpointsSettings({ onConfigSaved, onMainModelChanged }: CustomEndpointsSettingsProps) {
  const { t } = useI18n()
  const ce = t.settings.customEndpoints
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [activating, setActivating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [endpoints, setEndpoints] = useState<CustomEndpoint[]>([])
  const [form, setForm] = useState<EndpointForm>(EMPTY_FORM)
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([])
  // Which existing endpoint the form is editing (null = "add" mode). Kept
  // separate from form.id: the backend upserts by id, so an edited id would
  // silently CREATE a second endpoint instead of renaming — in edit mode the
  // id field is therefore locked, and this flag (not a typed-in id) is what
  // decides edit-vs-add.
  const [editingId, setEditingId] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  async function refresh() {
    const data = await getCustomEndpoints()
    setEndpoints(data.endpoints)
  }

  // Reset the editor into "add" mode and put the cursor in the name field —
  // focus also scrolls the form into view when the list above is long.
  function startNewEndpoint() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDiscoveredModels([])
    requestAnimationFrame(() => nameInputRef.current?.focus())
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await getCustomEndpoints()

        if (cancelled) {
          return
        }

        setEndpoints(data.endpoints)
        const current = data.endpoints.find(endpoint => endpoint.is_current) ?? data.endpoints[0]

        if (current) {
          setEditingId(current.id)
          setForm(formFromEndpoint(current))
          setDiscoveredModels(current.models)
        }
      } catch (err) {
        notifyError(err, ce.loadFailed)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave() {
    try {
      setSaving(true)
      const response = await saveCustomEndpoint(toPayload(form))
      setEndpoints(response.endpoints)
      const saved = response.endpoints.find(endpoint => endpoint.id === response.id)

      if (saved) {
        setEditingId(saved.id)
        setForm(formFromEndpoint(saved))
        setDiscoveredModels(saved.models)
      }

      if (saved && saved.is_current) {
        onMainModelChanged?.(saved.id, saved.model)
      }

      triggerHaptic('success')
      onConfigSaved?.()
      notify({ kind: 'success', message: ce.saved })
    } catch (err) {
      notifyError(err, ce.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  // Prefer the backend's stable message_code (localizable); the English
  // `message` text remains the fallback for older backends without codes.
  function validationFailureMessage(response: CustomEndpointValidationResponse): string {
    switch (response.message_code) {
      case 'missing_url':
        return ce.enterUrlFirst
      case 'unreachable':
        return ce.unreachable(form.baseUrl.trim())
      case 'auth_rejected':
        return ce.authRejected
      case 'http_error':
        return ce.httpError(response.http_status ?? '?')
      default:
        return response.message || ce.validationFailed
    }
  }

  async function handleValidate() {
    try {
      setTesting(true)
      const response = await validateCustomEndpoint(toPayload(form))
      setDiscoveredModels(response.models)

      if (response.ok) {
        if (!form.model && response.models[0]) {
          setForm(current => ({ ...current, model: response.models[0] }))
        }

        notify({
          kind: 'success',
          message:
            response.message_code === 'no_model_catalog'
              ? ce.noModelCatalog
              : response.models.length
                ? ce.reachableWithModels(response.models.length)
                : ce.reachable
        })
      } else {
        notify({
          kind: response.reachable ? 'warning' : 'error',
          message: validationFailureMessage(response)
        })
      }
    } catch (err) {
      notifyError(err, ce.validationError)
    } finally {
      setTesting(false)
    }
  }

  async function handleActivate(endpoint: CustomEndpoint) {
    try {
      setActivating(endpoint.id)
      const response = await activateCustomEndpoint(endpoint.id)
      await refresh()
      onConfigSaved?.()
      onMainModelChanged?.(response.provider, response.model)
      triggerHaptic('success')
    } catch (err) {
      notifyError(err, ce.activationFailed)
    } finally {
      setActivating(null)
    }
  }

  async function handleDelete(endpoint: CustomEndpoint) {
    if (!window.confirm(ce.deleteConfirm(endpoint.name))) {
      return
    }

    try {
      setDeleting(endpoint.id)
      const response = await deleteCustomEndpoint(endpoint.id)
      setEndpoints(response.endpoints)

      if (editingId === endpoint.id) {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setDiscoveredModels([])
      }

      onConfigSaved?.()
      triggerHaptic('success')
    } catch (err) {
      notifyError(err, ce.deleteFailed)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return <SettingsSkeleton sections={[{ heading: true, rows: 3 }]} />
  }

  const allModelOptions = Array.from(new Set([...discoveredModels, form.model].filter(Boolean)))
  const canSave = form.name.trim() && form.baseUrl.trim() && form.model.trim()

  return (
    <SettingsContent>
      <div className="space-y-6">
        <section>
          <SectionHeading
            aside={
              <Button onClick={startNewEndpoint} size="sm" type="button" variant="outline">
                <Plus />
                {ce.newEndpoint}
              </Button>
            }
            icon={Globe}
            meta={`${endpoints.length}`}
            title={ce.title}
          />
          <div className="divide-y divide-border/40 rounded-md border border-border/50">
            {endpoints.length ? (
              endpoints.map(endpoint => (
                <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={endpoint.id}>
                  <button
                    className="min-w-0 text-left"
                    onClick={() => {
                      setEditingId(endpoint.id)
                      setForm(formFromEndpoint(endpoint))
                      setDiscoveredModels(endpoint.models)
                    }}
                    type="button"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium">{endpoint.name}</span>
                      {endpoint.is_current && (
                        <Pill tone="primary">
                          <Check className="size-3" />
                          {ce.active}
                        </Pill>
                      )}
                      {endpoint.source === 'direct-config' && <Pill>config.yaml</Pill>}
                    </div>
                    <div className="mt-1 truncate font-mono text-[0.7rem] text-muted-foreground">
                      {endpoint.base_url}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{endpoint.model}</span>
                      {endpoint.has_api_key && <span>{endpoint.api_key_preview ?? ce.apiKeySet}</span>}
                    </div>
                  </button>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <Button
                      disabled={endpoint.is_current || activating === endpoint.id}
                      onClick={() => void handleActivate(endpoint)}
                      size="sm"
                      variant="outline"
                    >
                      {activating === endpoint.id ? <Loader2 className="animate-spin" /> : <Zap />}
                      {ce.use}
                    </Button>
                    {endpoint.source !== 'direct-config' && (
                      <Button
                        className="hover:text-destructive"
                        disabled={deleting === endpoint.id}
                        onClick={() => void handleDelete(endpoint)}
                        size="icon-sm"
                        title={ce.deleteEndpoint}
                        variant="ghost"
                      >
                        {deleting === endpoint.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState description={ce.emptyDesc} title={ce.emptyTitle} />
            )}
          </div>
        </section>

        <section>
          <SectionHeading icon={Plus} title={editingId ? ce.editTitle : ce.addTitle} />
          <div className="grid gap-3 rounded-md border border-border/50 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                {ce.nameLabel}
                <Input
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  placeholder="Axet Proxy"
                  ref={nameInputRef}
                  value={form.name}
                />
              </label>
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                {ce.providerIdLabel}
                <Input
                  disabled={Boolean(editingId)}
                  onChange={event => setForm(current => ({ ...current, id: event.target.value }))}
                  placeholder="axet-proxy"
                  value={form.id}
                />
                <span className="text-[0.66rem] leading-4 text-muted-foreground/80">{ce.providerIdHint}</span>
              </label>
            </div>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {ce.urlLabel}
              <Input
                onChange={event => setForm(current => ({ ...current, baseUrl: event.target.value }))}
                placeholder="http://127.0.0.1:8081/v1"
                value={form.baseUrl}
              />
            </label>
            <div className="grid gap-1.5 text-xs text-muted-foreground">
              {ce.apiModeLabel}
              <SegmentedControl
                onChange={value =>
                  setForm(current => ({
                    ...current,
                    apiMode: value,
                    // The auth pin only means something on the Anthropic
                    // wire; leaving it set would silently re-apply if the
                    // user later switched back.
                    authScheme: value === 'anthropic_messages' ? current.authScheme : ''
                  }))
                }
                options={[
                  { id: '', label: ce.apiModeAuto },
                  { id: 'chat_completions', label: ce.apiModeChat },
                  { id: 'codex_responses', label: ce.apiModeResponses },
                  { id: 'anthropic_messages', label: ce.apiModeMessages },
                  // A hand-written mode outside the known set stays visible;
                  // saving with it selected omits api_mode so it round-trips.
                  ...(isKnownApiMode(form.apiMode) ? [] : [{ id: form.apiMode, label: form.apiMode }])
                ]}
                value={form.apiMode}
              />
            </div>
            {form.apiMode === 'anthropic_messages' && (
              <div className="grid gap-1.5 text-xs text-muted-foreground">
                {ce.authSchemeLabel}
                <SegmentedControl
                  onChange={value =>
                    setForm(current => ({ ...current, authScheme: value === 'auto' ? '' : value }))
                  }
                  options={[
                    { id: 'auto', label: ce.authSchemeAuto },
                    { id: 'bearer', label: 'Authorization: Bearer' },
                    { id: 'x-api-key', label: 'x-api-key' }
                  ]}
                  value={form.authScheme || 'auto'}
                />
                <p className="text-[0.66rem] leading-4">{ce.authSchemeHint}</p>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                {ce.defaultModelLabel}
                <Input
                  list="custom-endpoint-models"
                  onChange={event => setForm(current => ({ ...current, model: event.target.value }))}
                  placeholder="gpt-5.4"
                  value={form.model}
                />
                <datalist id="custom-endpoint-models">
                  {allModelOptions.map(model => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
              </label>
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                {ce.contextLabel}
                <Input
                  inputMode="numeric"
                  onChange={event => setForm(current => ({ ...current, contextLength: event.target.value }))}
                  placeholder={ce.contextAuto}
                  value={form.contextLength}
                />
              </label>
            </div>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {ce.apiKeyLabel}
              <Input
                onChange={event => setForm(current => ({ ...current, apiKey: event.target.value }))}
                placeholder={editingId ? ce.keyKeepPlaceholder : ce.keyOptionalPlaceholder}
                type="password"
                value={form.apiKey}
              />
            </label>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.makeDefault}
                  onCheckedChange={checked => setForm(current => ({ ...current, makeDefault: checked === true }))}
                />
                {ce.useForNewChats}
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.discoverModels}
                  onCheckedChange={checked => setForm(current => ({ ...current, discoverModels: checked === true }))}
                />
                {ce.discoverModels}
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={testing || !form.baseUrl.trim()}
                onClick={() => void handleValidate()}
                variant="outline"
              >
                {testing ? <Loader2 className="animate-spin" /> : <Zap />}
                {ce.test}
              </Button>
              <Button disabled={saving || !canSave} onClick={() => void handleSave()}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                {t.common.save}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SettingsContent>
  )
}
