export interface HermesConfigRecord {
  [key: string]: unknown
}

interface CustomEndpointEntry {
  id: string
  models: string[]
  name: string
}

function asText(value: unknown): string {
  return value === undefined || value === null ? '' : String(value)
}

function nestedValue(record: HermesConfigRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined
    }

    return (value as HermesConfigRecord)[key]
  }, record)
}

// Mirrors the runtime's _normalize_custom_provider_name so a provider typed as
// "My Relay" still matches the endpoint whose id is "my-relay".
function normalizeProviderName(value: string): string {
  return value.trim().toLowerCase().replace(/ /g, '-')
}

// A providers.<id> entry is a usable custom endpoint when it carries a base
// URL and is not disabled. Model ordering mirrors the custom-endpoint API:
// configured default first, then the discovered catalog.
function customEndpointEntries(config: HermesConfigRecord): CustomEndpointEntry[] {
  const providers = config.providers

  if (!providers || typeof providers !== 'object' || Array.isArray(providers)) {
    return []
  }

  const entries: CustomEndpointEntry[] = []

  for (const [id, raw] of Object.entries(providers as HermesConfigRecord)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      continue
    }

    const entry = raw as HermesConfigRecord
    const baseUrl = asText(entry.base_url ?? entry.url ?? entry.api).trim()

    if (!baseUrl || entry.enabled === false) {
      continue
    }

    const models: string[] = []

    if (Array.isArray(entry.models)) {
      models.push(...entry.models.map(asText))
    } else if (entry.models && typeof entry.models === 'object') {
      models.push(...Object.keys(entry.models))
    }

    const defaultModel = asText(entry.model ?? entry.default_model).trim()

    if (defaultModel) {
      models.unshift(defaultModel)
    }

    entries.push({
      id,
      models: [...new Set(models.map(model => model.trim()).filter(Boolean))],
      name: asText(entry.name).trim()
    })
  }

  return entries
}

export function delegationCustomEndpointsEnabled(config: HermesConfigRecord): boolean {
  return nestedValue(config, 'delegation.use_custom_endpoints') === true
}

/** Open-world suggestions for delegation.provider. Built-in provider names
 * remain typeable; enabling the setting only adds configured endpoint ids. */
export function delegationProviderOptions(config: HermesConfigRecord): string[] | undefined {
  if (!delegationCustomEndpointsEnabled(config)) {
    return undefined
  }

  const ids = customEndpointEntries(config).map(entry => entry.id)

  return ids.length > 0 ? ids : undefined
}

/** Model suggestions for the custom endpoint selected by delegation.provider.
 * Matching accepts its id, display name, and runtime custom:<name> spelling. */
export function delegationModelOptions(config: HermesConfigRecord): string[] | undefined {
  if (!delegationCustomEndpointsEnabled(config)) {
    return undefined
  }

  const requested = normalizeProviderName(asText(nestedValue(config, 'delegation.provider')))

  if (!requested) {
    return undefined
  }

  for (const entry of customEndpointEntries(config)) {
    const id = normalizeProviderName(entry.id)
    const name = normalizeProviderName(entry.name)
    const candidates = new Set([id, name, id && `custom:${id}`, name && `custom:${name}`].filter(Boolean))

    if (candidates.has(requested)) {
      return entry.models.length > 0 ? entry.models : undefined
    }
  }

  return undefined
}
