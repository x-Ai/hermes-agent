import { useStore } from '@nanostores/react'
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
import { cn } from '@/lib/utils'
import { confirm } from '@/store/confirm'
import { notify, notifyError } from '@/store/notifications'
import { $settingsRequestProfile } from '@/store/settings-scope'
import type {
  CustomEndpoint,
  CustomEndpointApiMode,
  CustomEndpointMaxTokensField,
  CustomEndpointModelDetail,
  CustomEndpointUpdate
} from '@/types/hermes'

import { ComboboxInput } from './combobox-input'
import { EmptyState, Pill, SectionHeading, SettingsContent, SettingsSkeleton } from './primitives'
import { SettingsProfileScope } from './profile-scope'

interface CustomEndpointsSettingsProps {
  onConfigSaved?: () => void
  onMainModelChanged?: (provider: string, model: string) => void
}

interface ModelTokenLimitForm {
  contextLength: string
  maxInputTokens: string
  maxOutputTokens: string
}

type CapabilityPin = '' | 'no' | 'yes'

interface ModelCapabilityForm {
  supportsReasoning: CapabilityPin
  supportsVision: CapabilityPin
}

interface HeaderRow {
  name: string
  value: string
}

interface EndpointForm {
  apiKey: string
  apiMode: CustomEndpointApiMode
  authScheme: string
  baseUrl: string
  catalogProvider: string
  defaultTokenLimits: ModelTokenLimitForm
  discoverModels: boolean
  extraBody: string
  extraHeaders: HeaderRow[]
  id: string
  makeDefault: boolean
  maxTokensField: CustomEndpointMaxTokensField
  model: string
  modelCapabilities: Record<string, ModelCapabilityForm>
  modelTokenLimits: Record<string, ModelTokenLimitForm>
  name: string
  userAgent: string
}

/** Opt-in preset for relays/WAFs that only accept browser-like agents. Never a default: the SDK
 * identity is the truthful one, and some endpoints key features on it (e.g. coding relays). */
export const BROWSER_USER_AGENT_PRESET =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'

// Same choices as `hermes model`'s custom-provider setup; '' = runtime auto-detect.
const API_MODE_IDS: readonly CustomEndpointApiMode[] = ['', 'chat_completions', 'codex_responses', 'anthropic_messages']
const MAX_TOKENS_FIELD_IDS: readonly CustomEndpointMaxTokensField[] = ['', 'max_tokens', 'max_completion_tokens']

const EMPTY_LIMITS: ModelTokenLimitForm = { contextLength: '', maxInputTokens: '', maxOutputTokens: '' }
const EMPTY_CAPABILITIES: ModelCapabilityForm = { supportsReasoning: '', supportsVision: '' }

const EMPTY_FORM: EndpointForm = {
  apiKey: '',
  apiMode: '',
  authScheme: '',
  baseUrl: '',
  catalogProvider: '',
  defaultTokenLimits: EMPTY_LIMITS,
  discoverModels: true,
  extraBody: '',
  extraHeaders: [],
  id: '',
  makeDefault: true,
  maxTokensField: '',
  model: '',
  modelCapabilities: {},
  modelTokenLimits: {},
  name: '',
  userAgent: ''
}

const limitsToForm = (limits?: {
  context_length?: null | number
  max_input_tokens?: null | number
  max_output_tokens?: null | number
}): ModelTokenLimitForm => ({
  contextLength: String(limits?.context_length ?? ''),
  maxInputTokens: String(limits?.max_input_tokens ?? ''),
  maxOutputTokens: String(limits?.max_output_tokens ?? '')
})

const pinToForm = (value?: boolean | null): CapabilityPin => (value === true ? 'yes' : value === false ? 'no' : '')

const positiveOrNull = (value: string | undefined): number | null => {
  const parsed = Number(value)

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

const isInvalidLimit = (value: string) => {
  if (!value.trim()) {
    return false
  }

  const parsed = Number(value)

  return !Number.isSafeInteger(parsed) || parsed <= 0
}

/** `{ value }` for '' or a JSON object, `{ error: true }` for anything else. */
export function parseExtraBody(text: string): { error?: boolean; value: Record<string, unknown> } {
  if (!text.trim()) {
    return { value: {} }
  }

  try {
    const parsed: unknown = JSON.parse(text)

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { value: parsed as Record<string, unknown> }
    }
  } catch {
    // fall through
  }

  return { error: true, value: {} }
}

function formFromEndpoint(endpoint: CustomEndpoint): EndpointForm {
  const modelIds = new Set([
    endpoint.model,
    ...endpoint.models,
    ...Object.keys(endpoint.model_token_limits ?? {}),
    ...Object.keys(endpoint.model_context_lengths ?? {}),
    ...Object.keys(endpoint.model_capabilities ?? {})
  ])

  const extraBody = endpoint.extra_body ?? {}

  return {
    apiKey: '',
    apiMode: endpoint.api_mode ?? '',
    authScheme: endpoint.auth_scheme ?? '',
    baseUrl: endpoint.base_url,
    catalogProvider: endpoint.catalog_provider ?? '',
    defaultTokenLimits: limitsToForm(endpoint.default_token_limits),
    discoverModels: endpoint.discover_models,
    extraBody: Object.keys(extraBody).length ? JSON.stringify(extraBody, null, 2) : '',
    extraHeaders: Object.entries(endpoint.extra_headers ?? {})
      .filter(([name]) => name.toLowerCase() !== 'user-agent')
      .map(([name, value]) => ({ name, value })),
    id: endpoint.id,
    makeDefault: Boolean(endpoint.is_current),
    maxTokensField: endpoint.max_tokens_field ?? '',
    model: endpoint.model,
    modelCapabilities: Object.fromEntries(
      Array.from(modelIds).map(model => {
        const pins = endpoint.model_capabilities?.[model]

        return [
          model,
          { supportsReasoning: pinToForm(pins?.supports_reasoning), supportsVision: pinToForm(pins?.supports_vision) }
        ]
      })
    ),
    modelTokenLimits: Object.fromEntries(
      Array.from(modelIds).map(model => {
        const limits = endpoint.model_token_limits?.[model]

        return [
          model,
          {
            ...limitsToForm(limits),
            contextLength: String(limits?.context_length ?? endpoint.model_context_lengths?.[model] ?? '')
          }
        ]
      })
    ),
    name: endpoint.name,
    userAgent: endpoint.user_agent ?? ''
  }
}

function toPayload(
  form: EndpointForm,
  models?: string[],
  modelDetails?: CustomEndpointModelDetail[]
): CustomEndpointUpdate {
  const modelIds = Array.from(new Set([...(models ?? []), form.model].map(model => model.trim()).filter(Boolean)))

  const limitsPayload = (values?: ModelTokenLimitForm) => ({
    context_length: positiveOrNull(values?.contextLength),
    max_input_tokens: positiveOrNull(values?.maxInputTokens),
    max_output_tokens: positiveOrNull(values?.maxOutputTokens)
  })

  const pinPayload = (pin?: CapabilityPin) => (pin === 'yes' ? true : pin === 'no' ? false : null)

  const extraHeaders: Record<string, string> = Object.fromEntries(
    form.extraHeaders
      .map(row => [row.name.trim(), row.value] as const)
      .filter(([name]) => name && name.toLowerCase() !== 'user-agent')
  )

  if (form.userAgent.trim()) {
    extraHeaders['User-Agent'] = form.userAgent.trim()
  }

  return {
    id: form.id.trim() || undefined,
    name: form.name.trim(),
    base_url: form.baseUrl.trim(),
    model: form.model.trim(),
    api_key: form.apiKey.trim() || undefined,
    api_mode: form.apiMode,
    auth_scheme: form.authScheme,
    catalog_provider: form.catalogProvider.trim(),
    default_token_limits: limitsPayload(form.defaultTokenLimits),
    discover_models: form.discoverModels,
    extra_body: parseExtraBody(form.extraBody).value,
    extra_headers: extraHeaders,
    make_default: form.makeDefault,
    max_tokens_field: form.maxTokensField,
    model_capabilities: Object.fromEntries(
      modelIds.map(model => [
        model,
        {
          supports_reasoning: pinPayload(form.modelCapabilities[model]?.supportsReasoning),
          supports_vision: pinPayload(form.modelCapabilities[model]?.supportsVision)
        }
      ])
    ),
    model_token_limits: Object.fromEntries(modelIds.map(model => [model, limitsPayload(form.modelTokenLimits[model])])),
    models: models?.length ? models : undefined,
    model_details: modelDetails?.length ? modelDetails : undefined
  }
}

export function CustomEndpointsSettings({ onConfigSaved, onMainModelChanged }: CustomEndpointsSettingsProps) {
  const { t } = useI18n()
  const ce = t.settings.customEndpoints
  const copyRef = useRef(ce)
  copyRef.current = ce

  const apiModeOptions: readonly { id: CustomEndpointApiMode; label: string }[] = API_MODE_IDS.map(id => ({
    id,
    label:
      id === ''
        ? ce.apiModeAuto
        : id === 'chat_completions'
          ? ce.apiModeChat
          : id === 'codex_responses'
            ? ce.apiModeResponses
            : ce.apiModeMessages
  }))

  // Shared settings "Applies to" scope: read/write this profile's endpoints,
  // not whichever Bot is active in the left rail. Undefined follows the
  // active profile (request-shaped — never pass null, which retargets primary).
  const scopeProfile = useStore($settingsRequestProfile)
  const mounted = useRef(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [activating, setActivating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [endpoints, setEndpoints] = useState<CustomEndpoint[]>([])
  const [form, setForm] = useState<EndpointForm>(EMPTY_FORM)
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  // Alias metadata from the last Test; the backend resolves a picked alias to its
  // canonical model + reasoning effort on Save (#93622).
  const [discoveredDetails, setDiscoveredDetails] = useState<CustomEndpointModelDetail[]>([])

  async function refresh() {
    const data = await getCustomEndpoints(scopeProfile)

    if (mounted.current) {
      setEndpoints(data.endpoints)
    }
  }

  function startNewEndpoint() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDiscoveredModels([])
    setDiscoveredDetails([])
    requestAnimationFrame(() => nameInputRef.current?.focus())
  }

  // eslint-disable-next-line no-restricted-syntax -- lifecycle guard drops stale async completions; it does not mirror an atom
  useEffect(() => {
    let cancelled = false
    mounted.current = true
    setLoading(true)
    setForm(EMPTY_FORM)
    setEditingId(null)
    setDiscoveredModels([])
    setDiscoveredDetails([])
    setEndpoints([])

    async function load() {
      try {
        const data = await getCustomEndpoints(scopeProfile)

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
        notifyError(err, copyRef.current.couldNotLoad)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      mounted.current = false
    }
  }, [scopeProfile])

  async function handleSave() {
    try {
      setSaving(true)
      const response = await saveCustomEndpoint(toPayload(form, discoveredModels, discoveredDetails), scopeProfile)

      if (!mounted.current) {
        return
      }

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
      notify({ kind: 'success', message: ce.endpointSaved })
    } catch (err) {
      if (mounted.current) {
        notifyError(err, ce.saveFailed)
      }
    } finally {
      if (mounted.current) {
        setSaving(false)
      }
    }
  }

  async function handleValidate() {
    try {
      setTesting(true)
      const response = await validateCustomEndpoint(toPayload(form), scopeProfile)

      if (!mounted.current) {
        return
      }

      setDiscoveredModels(current => Array.from(new Set([...current, ...response.models])))
      setDiscoveredDetails(response.model_details ?? [])

      if (response.ok) {
        // Persist the URL that actually served /models (e.g. "<root>/v1" when the user typed the
        // bare root): chat POSTs {base_url}/chat/completions verbatim, so saving the typed root
        // would 404 every request even though the test looked green (#65488).
        const resolvedBaseUrl = response.resolved_base_url?.trim()

        if (!form.model && response.models[0]) {
          setForm(current => ({ ...current, model: response.models[0] }))
        }

        if (resolvedBaseUrl && resolvedBaseUrl !== form.baseUrl.trim().replace(/\/+$/, '')) {
          setForm(current => ({ ...current, baseUrl: resolvedBaseUrl }))
        }

        // The backend also POSTed the transport the runtime will use; name it so an
        // auto-detected mode is visible before Save (#93622).
        const transport = apiModeOptions.find(option => option.id === response.transport_checked)?.label
        const reachable = transport ? ce.endpointReachableTransport(transport) : ce.endpointReachable
        notify({
          kind: 'success',
          message: response.models.length ? ce.endpointReachableModels(reachable, response.models.length) : reachable
        })
      } else {
        notify({
          kind: response.reachable ? 'warning' : 'error',
          message: response.message || ce.endpointValidationFailed
        })
      }
    } catch (err) {
      if (mounted.current) {
        notifyError(err, ce.validationFailed)
      }
    } finally {
      if (mounted.current) {
        setTesting(false)
      }
    }
  }

  async function handleActivate(endpoint: CustomEndpoint) {
    try {
      setActivating(endpoint.id)
      const response = await activateCustomEndpoint(endpoint.id, scopeProfile)

      if (!mounted.current) {
        return
      }

      await refresh()

      if (!mounted.current) {
        return
      }

      onConfigSaved?.()
      onMainModelChanged?.(response.provider, response.model)
      triggerHaptic('success')
    } catch (err) {
      if (mounted.current) {
        notifyError(err, ce.activationFailed)
      }
    } finally {
      if (mounted.current) {
        setActivating(null)
      }
    }
  }

  async function handleDelete(endpoint: CustomEndpoint) {
    if (!(await confirm({ destructive: true, title: ce.deleteConfirm(endpoint.name) }))) {
      return
    }

    try {
      setDeleting(endpoint.id)
      const response = await deleteCustomEndpoint(endpoint.id, scopeProfile)

      if (!mounted.current) {
        return
      }

      setEndpoints(response.endpoints)

      if (editingId === endpoint.id) {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setDiscoveredModels([])
        setDiscoveredDetails([])
      }

      onConfigSaved?.()
      triggerHaptic('success')
    } catch (err) {
      if (mounted.current) {
        notifyError(err, ce.deleteFailed)
      }
    } finally {
      if (mounted.current) {
        setDeleting(null)
      }
    }
  }

  if (loading) {
    return (
      <SettingsContent>
        <SettingsProfileScope className="mb-5" />
        <SettingsSkeleton sections={[{ heading: true, rows: 3 }]} />
      </SettingsContent>
    )
  }

  const allModelOptions = Array.from(new Set([...discoveredModels, form.model].filter(Boolean)))

  const hasInvalidTokenLimit = [form.defaultTokenLimits, ...Object.values(form.modelTokenLimits)].some(limits =>
    Object.values(limits).some(isInvalidLimit)
  )

  const extraBodyInvalid = Boolean(parseExtraBody(form.extraBody).error)

  const canSave =
    form.name.trim() && form.baseUrl.trim() && form.model.trim() && !hasInvalidTokenLimit && !extraBodyInvalid

  const showMaxTokensField = form.apiMode === '' || form.apiMode === 'chat_completions'

  const tokenLimitFields = [
    { key: 'contextLength', label: ce.contextWindowLabel },
    { key: 'maxInputTokens', label: ce.maxInputLabel },
    { key: 'maxOutputTokens', label: ce.maxOutputLabel }
  ] as const

  const capabilityFields = [
    { key: 'supportsVision', label: ce.visionLabel },
    { key: 'supportsReasoning', label: ce.reasoningLabel }
  ] as const

  const capabilityOptions: readonly { id: CapabilityPin; label: string }[] = [
    { id: '', label: ce.capabilityAuto },
    { id: 'yes', label: ce.capabilityYes },
    { id: 'no', label: ce.capabilityNo }
  ]

  const tableGrid = 'sm:grid-cols-[minmax(9rem,1fr)_repeat(3,minmax(6rem,9rem))_repeat(2,minmax(5rem,6.5rem))]'

  function updateModelTokenLimit(model: null | string, key: keyof ModelTokenLimitForm, value: string) {
    setForm(current => {
      if (model === null) {
        return { ...current, defaultTokenLimits: { ...current.defaultTokenLimits, [key]: value } }
      }

      const previous = current.modelTokenLimits[model] ?? EMPTY_LIMITS

      return { ...current, modelTokenLimits: { ...current.modelTokenLimits, [model]: { ...previous, [key]: value } } }
    })
  }

  function updateModelCapability(model: string, key: keyof ModelCapabilityForm, value: CapabilityPin) {
    setForm(current => {
      const previous = current.modelCapabilities[model] ?? EMPTY_CAPABILITIES

      return { ...current, modelCapabilities: { ...current.modelCapabilities, [model]: { ...previous, [key]: value } } }
    })
  }

  function updateHeaderRow(index: number, patch: Partial<HeaderRow>) {
    setForm(current => ({
      ...current,
      extraHeaders: current.extraHeaders.map((row, i) => (i === index ? { ...row, ...patch } : row))
    }))
  }

  function renderLimitInputs(model: null | string, values: ModelTokenLimitForm) {
    const scope = model ?? ce.defaultRowLabel

    return tokenLimitFields.map(field => (
      <label className="grid gap-1 text-[0.66rem] sm:block" key={field.key}>
        <span className="sm:sr-only">{field.label}</span>
        <Input
          aria-label={`${field.label}: ${scope}`}
          inputMode="numeric"
          min={1}
          onChange={event => updateModelTokenLimit(model, field.key, event.target.value)}
          placeholder={ce.contextAuto}
          step={1}
          type="number"
          value={values[field.key]}
        />
      </label>
    ))
  }

  return (
    <SettingsContent>
      <SettingsProfileScope className="mb-5" />
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
            page
            title={t.settings.customEndpoints.title}
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
                      setDiscoveredDetails([])
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
                        aria-label={t.settings.customEndpoints.deleteEndpoint}
                        className="hover:text-destructive"
                        disabled={deleting === endpoint.id}
                        onClick={() => void handleDelete(endpoint)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        {deleting === endpoint.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                description={t.settings.customEndpoints.emptyDescription}
                title={t.settings.customEndpoints.emptyTitle}
              />
            )}
          </div>
        </section>

        <section>
          <SectionHeading icon={Plus} title={editingId ? ce.editTitle : ce.addTitle} />
          <div className="grid gap-3 rounded-md border border-border/50 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid content-start gap-1.5 text-xs text-muted-foreground">
                {ce.fields.name}
                <Input
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  placeholder={t.settings.customEndpoints.namePlaceholder}
                  ref={nameInputRef}
                  value={form.name}
                />
              </label>
              <label className="grid content-start gap-1.5 text-xs text-muted-foreground">
                {ce.fields.providerId}
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
              {ce.fields.endpointUrl}
              <Input
                onChange={event => setForm(current => ({ ...current, baseUrl: event.target.value }))}
                placeholder="http://127.0.0.1:8081/v1"
                value={form.baseUrl}
              />
            </label>
            <fieldset className="grid min-w-0 gap-1.5 text-xs text-muted-foreground">
              <legend className="mb-1.5">{ce.apiModeLabel}</legend>
              <SegmentedControl
                className="w-full max-w-full"
                onChange={apiMode => setForm(current => ({ ...current, apiMode }))}
                options={apiModeOptions}
                value={form.apiMode}
              />
            </fieldset>
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
            {showMaxTokensField && (
              <div className="grid gap-1.5 text-xs text-muted-foreground">
                {ce.maxTokensFieldLabel}
                <SegmentedControl
                  onChange={maxTokensField => setForm(current => ({ ...current, maxTokensField }))}
                  options={MAX_TOKENS_FIELD_IDS.map(id => ({ id, label: id || ce.maxTokensFieldAuto }))}
                  value={form.maxTokensField}
                />
                <p className="text-[0.66rem] leading-4">{ce.maxTokensFieldHint}</p>
              </div>
            )}
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {ce.defaultModelLabel}
              <ComboboxInput
                onChange={model => setForm(current => ({ ...current, model }))}
                options={allModelOptions}
                placeholder="gpt-5.4"
                value={form.model}
              />
            </label>
            <div className="grid gap-1.5 text-xs text-muted-foreground">
              <span>{ce.contextLabel}</span>
              <span className="text-[0.66rem] leading-4 text-muted-foreground/80">{ce.contextHint}</span>
              <div className="max-h-72 divide-y divide-border/40 overflow-y-auto rounded-md border border-border/50">
                <div className={cn('hidden gap-2 bg-muted/20 px-2 py-1.5 text-[0.66rem] sm:grid', tableGrid)}>
                  <span>{ce.modelLabel}</span>
                  {tokenLimitFields.map(field => (
                    <span key={field.key}>{field.label}</span>
                  ))}
                  {capabilityFields.map(field => (
                    <span key={field.key}>{field.label}</span>
                  ))}
                </div>
                <div className={cn('grid items-center gap-2 bg-muted/10 p-2', tableGrid)}>
                  <span className="truncate text-[0.72rem] font-medium text-foreground">{ce.defaultRowLabel}</span>
                  {renderLimitInputs(null, form.defaultTokenLimits)}
                  <span className="hidden sm:block" />
                  <span className="hidden sm:block" />
                </div>
                {allModelOptions.map(model => (
                  <div className={cn('grid items-center gap-2 p-2', tableGrid)} key={model}>
                    <span className="truncate font-mono text-[0.72rem] text-foreground" title={model}>
                      {model}
                    </span>
                    {renderLimitInputs(model, form.modelTokenLimits[model] ?? EMPTY_LIMITS)}
                    {capabilityFields.map(field => (
                      <label className="grid gap-1 text-[0.66rem] sm:block" key={field.key}>
                        <span className="sm:sr-only">{field.label}</span>
                        <select
                          aria-label={`${field.label}: ${model}`}
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                          onChange={event =>
                            updateModelCapability(model, field.key, event.target.value as CapabilityPin)
                          }
                          value={form.modelCapabilities[model]?.[field.key] ?? ''}
                        >
                          {capabilityOptions.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {ce.fields.apiKey}
              <Input
                onChange={event => setForm(current => ({ ...current, apiKey: event.target.value }))}
                placeholder={editingId ? ce.keyKeepPlaceholder : ce.keyOptionalPlaceholder}
                type="password"
                value={form.apiKey}
              />
            </label>
            <div className="grid gap-1.5 text-xs text-muted-foreground">
              <label className="grid gap-1.5">
                {ce.userAgentLabel}
                <Input
                  onChange={event => setForm(current => ({ ...current, userAgent: event.target.value }))}
                  placeholder={BROWSER_USER_AGENT_PRESET}
                  value={form.userAgent}
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => setForm(current => ({ ...current, userAgent: BROWSER_USER_AGENT_PRESET }))}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {ce.useBrowserUserAgent}
                </Button>
                <span className="text-[0.66rem] leading-4 text-muted-foreground/80">{ce.userAgentHint}</span>
              </div>
            </div>
            <div className="grid gap-1.5 text-xs text-muted-foreground">
              <span>{ce.extraHeadersLabel}</span>
              <span className="text-[0.66rem] leading-4 text-muted-foreground/80">{ce.extraHeadersHint}</span>
              {form.extraHeaders.map((row, index) => (
                <div className="grid gap-2 sm:grid-cols-[minmax(8rem,1fr)_minmax(0,2fr)_auto]" key={index}>
                  <Input
                    aria-label={`${ce.headerNamePlaceholder} ${index + 1}`}
                    onChange={event => updateHeaderRow(index, { name: event.target.value })}
                    placeholder={ce.headerNamePlaceholder}
                    value={row.name}
                  />
                  <Input
                    aria-label={`${ce.headerValuePlaceholder} ${index + 1}`}
                    onChange={event => updateHeaderRow(index, { value: event.target.value })}
                    placeholder={ce.headerValuePlaceholder}
                    value={row.value}
                  />
                  <Button
                    aria-label={ce.removeHeader}
                    onClick={() =>
                      setForm(current => ({
                        ...current,
                        extraHeaders: current.extraHeaders.filter((_, i) => i !== index)
                      }))
                    }
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              <div>
                <Button
                  onClick={() =>
                    setForm(current => ({
                      ...current,
                      extraHeaders: [...current.extraHeaders, { name: '', value: '' }]
                    }))
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus />
                  {ce.addHeader}
                </Button>
              </div>
            </div>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {ce.extraBodyLabel}
              <textarea
                aria-invalid={extraBodyInvalid || undefined}
                className={cn(
                  'min-h-20 w-full rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs',
                  extraBodyInvalid && 'border-destructive'
                )}
                onChange={event => setForm(current => ({ ...current, extraBody: event.target.value }))}
                placeholder='{"chat_template_kwargs": {"enable_thinking": false}}'
                spellCheck={false}
                value={form.extraBody}
              />
              <span
                className={cn(
                  'text-[0.66rem] leading-4',
                  extraBodyInvalid ? 'text-destructive' : 'text-muted-foreground/80'
                )}
              >
                {extraBodyInvalid ? ce.extraBodyInvalid : ce.extraBodyHint}
              </span>
            </label>
            <label className="grid gap-1.5 text-xs text-muted-foreground">
              {ce.catalogProviderLabel}
              <Input
                onChange={event => setForm(current => ({ ...current, catalogProvider: event.target.value }))}
                placeholder="deepseek"
                value={form.catalogProvider}
              />
              <span className="text-[0.66rem] leading-4 text-muted-foreground/80">{ce.catalogProviderHint}</span>
            </label>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.makeDefault}
                  onCheckedChange={checked => setForm(current => ({ ...current, makeDefault: checked === true }))}
                />
                {ce.fields.useNewChats}
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.discoverModels}
                  onCheckedChange={checked => setForm(current => ({ ...current, discoverModels: checked === true }))}
                />
                {ce.fields.discoverModels}
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
                {ce.save}
              </Button>
              <Button className={cn(!editingId && 'hidden')} onClick={startNewEndpoint} type="button" variant="ghost">
                {ce.newEndpoint}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SettingsContent>
  )
}
