import { translateNow } from '@/i18n'

// Fallback for gateways that send no `code` on the error event. Every alternative here is a
// sentence the backend actually produces today: `agent_init` raises "No LLM provider configured"
// on a blank install and `missing_provider_credentials_message()` the "is set in config.yaml
// but …" form, and both arrive wrapped in `agent_init_failed_message()`. Matching is by the
// noun phrase, never the surrounding wording, and deliberately NOT by "provider configured"
// alone: the auxiliary-model warning says "No auxiliary LLM provider configured" and is not a
// provider-setup failure. The tail mirrors the backend's `auth.no_provider_configured` copy
// (locales/*.yaml) in every locale the gateway may already have localized it to.
const PROVIDER_SETUP_ERROR_RE =
  /No (?:inference|Hermes|LLM) provider(?: is)? configured|Hermes is not connected to any AI provider|no_provider_configured|set an API key|is set in config\.yaml but no (?:API key|credentials)|尚未连接任何 AI 提供方|尚未連接任何 AI 提供方|AI プロバイダーにも接続されていません/i

const SESSION_INFO_CREDENTIAL_WARNING_RE = /^No API key configured for provider '[^']*'\. First message will fail\.$/

export function localizeProviderErrorMessage(message: string): string {
  const unknownProvider =
    /^(agent init failed:\s*)?Unknown provider '([^']+)'\.\s+Check 'hermes\s+model' for available providers,\s+or run 'hermes\s+doctor' to diagnose config issues\.$/i.exec(
      message.trim()
    )

  if (!unknownProvider) {
    return message
  }

  return translateNow(
    unknownProvider[1] ? 'notifications.errors.agentInitUnknownProvider' : 'notifications.errors.unknownProvider',
    unknownProvider[2]
  )
}

/** True when the gateway named this failure itself: preferred over reading the sentence. */
export function isProviderSetupErrorCode(code: null | string | undefined): boolean {
  return code === 'provider_not_configured'
}

export function isProviderSetupErrorMessage(message: null | string | undefined): boolean {
  const text = message?.trim()

  if (!text) {
    return false
  }

  return PROVIDER_SETUP_ERROR_RE.test(text) || SESSION_INFO_CREDENTIAL_WARNING_RE.test(text)
}
