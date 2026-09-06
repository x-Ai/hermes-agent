import { translateNow } from '@/i18n'

const PROVIDER_SETUP_ERROR_RE =
  /No (?:inference|Hermes) provider(?: is)? configured|no_provider_configured|set an API key/i

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

export function isProviderSetupErrorMessage(message: null | string | undefined): boolean {
  const text = message?.trim()

  if (!text) {
    return false
  }

  return PROVIDER_SETUP_ERROR_RE.test(text) || SESSION_INFO_CREDENTIAL_WARNING_RE.test(text)
}
