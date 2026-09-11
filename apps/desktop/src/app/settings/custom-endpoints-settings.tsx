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
import { confirm } from '@/store/confirm'
import { notify, notifyError } from '@/store/notifications'
import type { CustomEndpoint, CustomEndpointUpdate, CustomEndpointValidationResponse } from '@/types/hermes'

import { EmptyState, Pill, SectionHeading, SettingsContent, SettingsSkeleton } from './primitives'

interface CustomEndpointsSettingsProps {
  onConfigSaved?: () => void
  onMainModelChanged?: (provider: string, model: string) => void
}

interface ModelTokenLimitForm {
  contextLength: string
  maxInputTokens: string
  maxOutputTokens: string
}

interface EndpointForm {
  apiKey: string
  /** '' = OpenAI-compatible (the default wire). */
  apiMode: string
  /** '' = auto-detect; only sent meaningfully with the Anthropic wire. */
  authScheme: string
  baseUrl: string
  discoverModels: boolean
  id: string
  makeDefault: boolean
  model: string
  /** Three independent editable values per exact model id; '' means automatic discovery. */
  modelTokenLimits: Record<string, ModelTokenLimitForm>
  name: string
  /** '' = no override (SDK default). New endpoints prefill DEFAULT_USER_AGENT. */
  userAgent: string
}

// A mainstream desktop-Chrome User-Agent. Custom relays / WAFs routinely 403
// the OpenAI SDK's default agent (e.g. "OpenAI/Python …" or "python-httpx");
// a standard browser agent is the safe, non-fingerprinted default. Users can
// override it per endpoint, or clear it to fall back to the SDK default.
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'

const EMPTY_FORM: EndpointForm = {
  apiKey: '',
  apiMode: '',
  authScheme: '',
  baseUrl: '',
  discoverModels: true,
  id: '',
  makeDefault: true,
  model: '',
  modelTokenLimits: {},
  name: '',
  userAgent: DEFAULT_USER_AGENT
}

// The wires the editor knows ('' = Auto: leave protocol detection to the
// runtime). Hand-written modes outside this list still round-trip: the editor
// shows them as an extra segment and OMITS api_mode from the save payload, so
// the backend preserves the entry untouched (unknown values are rejected 422).
const KNOWN_API_MODES = ['', 'chat_completions', 'codex_responses', 'anthropic_messages'] as const

const isKnownApiMode = (mode: string): boolean => (KNOWN_API_MODES as readonly string[]).includes(mode)

function formFromEndpoint(endpoint: CustomEndpoint): EndpointForm {
  const modelIds = new Set([
    endpoint.model,
    ...endpoint.models,
    ...Object.keys(endpoint.model_token_limits ?? {}),
    ...Object.keys(endpoint.model_context_lengths ?? {})
  ])

  return {
    apiKey: '',
    apiMode: endpoint.api_mode ?? '',
    authScheme: endpoint.auth_scheme ?? '',
    baseUrl: endpoint.base_url,
    discoverModels: endpoint.discover_models,
    id: endpoint.id,
    makeDefault: Boolean(endpoint.is_current),
    model: endpoint.model,
    modelTokenLimits: Object.fromEntries(
      Array.from(modelIds).map(model => {
        const limits = endpoint.model_token_limits?.[model]

        return [
          model,
          {
            contextLength: String(limits?.context_length ?? endpoint.model_context_lengths?.[model] ?? ''),
            maxInputTokens: String(limits?.max_input_tokens ?? ''),
            maxOutputTokens: String(limits?.max_output_tokens ?? endpoint.max_output_tokens ?? '')
          }
        ]
      })
    ),
    name: endpoint.name,
    // Show exactly what's stored — '' means "no override", not "reset to
    // default" — so an intentional clear round-trips instead of being
    // silently re-filled with DEFAULT_USER_AGENT on the next edit.
    userAgent: endpoint.user_agent ?? ''
  }
}

function toPayload(form: EndpointForm, models?: string[]): CustomEndpointUpdate {
  const modelIds = Array.from(new Set([...(models ?? []), form.model].map(model => model.trim()).filter(Boolean)))

  const modelTokenLimits = Object.fromEntries(
    modelIds.map(model => {
      const values = form.modelTokenLimits[model]

      const positiveOrNull = (value: string | undefined): number | null => {
        const parsed = Number(value)

        return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
      }

      return [
        model,
        {
          context_length: positiveOrNull(values?.contextLength),
          max_input_tokens: positiveOrNull(values?.maxInputTokens),
          max_output_tokens: positiveOrNull(values?.maxOutputTokens)
        }
      ]
    })
  )

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
    discover_models: form.discoverModels,
    make_default: form.makeDefault,
    model_token_limits: modelTokenLimits,
    // Always sent as a string: non-empty pins the agent, '' clears any
    // override back to the SDK default.
    user_agent: form.userAgent.trim(),
    models: models?.length ? models : undefined
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
      const response = await saveCustomEndpoint(toPayload(form, discoveredModels))
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
      setDiscoveredModels(current => Array.from(new Set([...current, ...response.models])))

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
    if (!(await confirm({ destructive: true, title: ce.deleteConfirm(endpoint.name) }))) {
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

  const hasInvalidTokenLimit = Object.values(form.modelTokenLimits).some(limits =>
    Object.values(limits).some(value => {
      if (!value.trim()) {
        return false
      }

      const parsed = Number(value)

      return !Number.isSafeInteger(parsed) || parsed <= 0
    })
  )

  const canSave = form.name.trim() && form.baseUrl.trim() && form.model.trim() && !hasInvalidTokenLimit

  const tokenLimitFields = [
    { key: 'contextLength', label: ce.contextWindowLabel },
    { key: 'maxInputTokens', label: ce.maxInputLabel },
    { key: 'maxOutputTokens', label: ce.maxOutputLabel }
  ] as const

  function updateModelTokenLimit(model: string, key: keyof ModelTokenLimitForm, value: string) {
    setForm(current => {
      const previous = current.modelTokenLimits[model] ?? {
        contextLength: '',
        maxInputTokens: '',
        maxOutputTokens: ''
      }

      return {
        ...current,
        modelTokenLimits: {
          ...current.modelTokenLimits,
          [model]: {
            ...previous,
            [key]: value
          }
        }
      }
    })
  }

  return (
    <SettingsContent>
      <div className="space-y-6">
        <section>
          <SectionHeading icon={Globe} meta={`${endpoints.length}`} title={ce.title} />
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
            <div className="grid items-start gap-3 sm:grid-cols-2">
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
                  onChange={value => setForm(current => ({ ...current, authScheme: value === 'auto' ? '' : value }))}
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
            <div className="grid gap-1.5 text-xs text-muted-foreground">
              <span>{ce.contextLabel}</span>
              <span className="text-[0.66rem] leading-4 text-muted-foreground/80">{ce.contextHint}</span>
              {allModelOptions.length > 0 && (
                <div className="max-h-64 divide-y divide-border/40 overflow-y-auto rounded-md border border-border/50">
                  <div className="hidden gap-2 bg-muted/20 px-2 py-1.5 text-[0.66rem] sm:grid sm:grid-cols-[minmax(10rem,1fr)_repeat(3,minmax(7.5rem,12rem))]">
                    <span>{ce.modelLabel}</span>
                    {tokenLimitFields.map(field => (
                      <span key={field.key}>{field.label}</span>
                    ))}
                  </div>
                  {allModelOptions.map(model => (
                    <div
                      className="grid items-center gap-2 p-2 sm:grid-cols-[minmax(10rem,1fr)_repeat(3,minmax(7.5rem,12rem))]"
                      key={model}
                    >
                      <span className="truncate font-mono text-[0.72rem] text-foreground" title={model}>
                        {model}
                      </span>
                      {tokenLimitFields.map(field => (
                        <label className="grid gap-1 text-[0.66rem] sm:block" key={field.key}>
                          <span className="sm:sr-only">{field.label}</span>
                          <Input
                            aria-label={`${field.label}: ${model}`}
                            inputMode="numeric"
                            min={1}
                            onChange={event => updateModelTokenLimit(model, field.key, event.target.value)}
                            placeholder={ce.contextAuto}
                            step={1}
                            type="number"
                            value={form.modelTokenLimits[model]?.[field.key] ?? ''}
                          />
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
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
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {ce.userAgentLabel}
              <Input
                onChange={event => setForm(current => ({ ...current, userAgent: event.target.value }))}
                placeholder={DEFAULT_USER_AGENT}
                value={form.userAgent}
              />
              <span className="text-[0.66rem] leading-4 text-muted-foreground/80">{ce.userAgentHint}</span>
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
              <Button
                className={!editingId ? 'hidden' : undefined}
                onClick={startNewEndpoint}
                type="button"
                variant="ghost"
              >
                {ce.newEndpoint}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SettingsContent>
  )
}
