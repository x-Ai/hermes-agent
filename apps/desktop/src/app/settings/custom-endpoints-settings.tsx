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
  CustomEndpointModelDetail,
  CustomEndpointUpdate
} from '@/types/hermes'

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

interface EndpointForm {
  apiKey: string
  apiMode: CustomEndpointApiMode
  authScheme: string
  baseUrl: string
  discoverModels: boolean
  id: string
  makeDefault: boolean
  model: string
  modelTokenLimits: Record<string, ModelTokenLimitForm>
  name: string
  userAgent: string
}

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'

// Same choices as `hermes model`'s custom-provider setup; '' = runtime auto-detect.
const API_MODE_IDS: readonly CustomEndpointApiMode[] = ['', 'chat_completions', 'codex_responses', 'anthropic_messages']

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
    userAgent: endpoint.user_agent ?? ''
  }
}

function toPayload(
  form: EndpointForm,
  models?: string[],
  modelDetails?: CustomEndpointModelDetail[]
): CustomEndpointUpdate {
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
    api_mode: form.apiMode,
    auth_scheme: form.apiMode === 'anthropic_messages' ? form.authScheme : '',
    discover_models: form.discoverModels,
    make_default: form.makeDefault,
    model_token_limits: modelTokenLimits,
    models: models?.length ? models : undefined,
    model_details: modelDetails?.length ? modelDetails : undefined,
    user_agent: form.userAgent.trim()
  }
}

export function CustomEndpointsSettings({ onConfigSaved, onMainModelChanged }: CustomEndpointsSettingsProps) {
  const { t } = useI18n()
  const ce = t.settings.customEndpoints

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
  // Alias metadata from the last Test; the backend resolves a picked alias to its
  // canonical model + reasoning effort on Save (#93622).
  const [discoveredDetails, setDiscoveredDetails] = useState<CustomEndpointModelDetail[]>([])

  async function refresh() {
    const data = await getCustomEndpoints(scopeProfile)

    if (mounted.current) {
      setEndpoints(data.endpoints)
    }
  }

  // eslint-disable-next-line no-restricted-syntax -- lifecycle guard drops stale async completions; it does not mirror an atom
  useEffect(() => {
    let cancelled = false
    mounted.current = true
    setLoading(true)
    setForm(EMPTY_FORM)
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
        const reachable = transport ? ce.reachableVia(transport) : ce.reachable
        notify({
          kind: 'success',
          message: response.models.length ? `${reachable} Found ${response.models.length} models.` : reachable
        })
      } else {
        notify({
          kind: response.reachable ? 'warning' : 'error',
          message: response.message || ce.validationFailed
        })
      }
    } catch (err) {
      if (mounted.current) {
        notifyError(err, ce.validationError)
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
    // This panel is not internationalized at all — keep the literal it had.
    if (!(await confirm({ destructive: true, title: `Delete ${endpoint.name}?` }))) {
      return
    }

    try {
      setDeleting(endpoint.id)
      const response = await deleteCustomEndpoint(endpoint.id, scopeProfile)

      if (!mounted.current) {
        return
      }

      setEndpoints(response.endpoints)

      if (form.id === endpoint.id) {
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
          [model]: { ...previous, [key]: value }
        }
      }
    })
  }

  return (
    <SettingsContent>
      <SettingsProfileScope className="mb-5" />
      <div className="space-y-6">
        <section>
          <SectionHeading icon={Globe} meta={`${endpoints.length}`} page title={ce.title} />
          <div className="divide-y divide-border/40 rounded-md border border-border/50">
            {endpoints.length ? (
              endpoints.map(endpoint => (
                <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={endpoint.id}>
                  <button
                    className="min-w-0 text-left"
                    onClick={() => {
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
                        aria-label={ce.deleteEndpoint}
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
              <EmptyState description={ce.emptyDescription} title={ce.emptyTitle} />
            )}
          </div>
        </section>

        <section>
          <SectionHeading icon={Plus} title={form.id ? ce.editTitle : ce.addTitle} />
          <div className="grid gap-3 rounded-md border border-border/50 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                {ce.nameLabel}
                <Input
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  placeholder={ce.namePlaceholder}
                  value={form.name}
                />
              </label>
              <label className="grid gap-1.5 text-xs text-muted-foreground">
                {ce.providerIdLabel}
                <Input
                  onChange={event => setForm(current => ({ ...current, id: event.target.value }))}
                  placeholder="axet-proxy"
                  value={form.id}
                />
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
            <fieldset className="grid min-w-0 gap-1.5 text-xs text-muted-foreground">
              <legend className="mb-1.5">{ce.apiModeLabel}</legend>
              <SegmentedControl
                className="w-full max-w-full"
                onChange={apiMode =>
                  setForm(current => ({
                    ...current,
                    apiMode,
                    authScheme: apiMode === 'anthropic_messages' ? current.authScheme : ''
                  }))
                }
                options={apiModeOptions}
                value={form.apiMode}
              />
            </fieldset>
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
                placeholder={form.id ? ce.keyKeepPlaceholder : ce.keyOptionalPlaceholder}
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
                className={cn(!form.id && 'hidden')}
                onClick={() => {
                  setForm(EMPTY_FORM)
                  setDiscoveredModels([])
                  setDiscoveredDetails([])
                }}
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
