// Custom-endpoint model rows, limits and capability shapes (the fork's limits table); `CustomEndpoint`
// itself stays in ./hermes with the other API payloads.

/** One `/v1/models` row; a gateway may advertise a reasoning alias
 * (`gpt-5.6-sol-high` → `gpt-5.6-sol` @ `high`) that the bare id list flattens. */
export interface CustomEndpointModelDetail {
  canonical_model?: null | string
  id: string
  reasoning_effort?: null | string
  /** Resolved by the backend for the limits table: the value a blank cell resolves to today
   * (`sources[field]` = `endpoint` | `catalog_provider`) or a catalog suggestion the runtime
   * never applies on its own (`catalog`). Absent = unknown. */
  catalog_ref?: null | string
  context_length?: null | number
  max_input_tokens?: null | number
  max_output_tokens?: null | number
  sources?: null | Record<string, CustomEndpointModelDetailSource>
  supported_efforts?: null | string[]
  supports_reasoning?: boolean | null
  supports_vision?: boolean | null
}

export type CustomEndpointModelDetailSource = 'catalog' | 'catalog_provider' | 'endpoint'

export type CustomEndpointMaxTokensField = '' | 'max_completion_tokens' | 'max_tokens'

export interface CustomEndpointModelCapabilities {
  supports_reasoning?: boolean | null
  supports_vision?: boolean | null
}

export interface CustomEndpointModelTokenLimits {
  context_length?: number
  max_input_tokens?: number
  max_output_tokens?: number
}
