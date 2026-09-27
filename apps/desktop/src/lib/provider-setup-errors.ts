import { translateNow } from '@/i18n'

// Mirrors the backend's `auth.no_provider_configured` copy (locales/*.yaml) in
// every locale the gateway may already have localized it to, plus the older
// English wordings still emitted by setup and session.info.
const PROVIDER_SETUP_ERROR_RE =
  /No (?:inference|Hermes) provider(?: is)? configured|Hermes is not connected to any AI provider|no_provider_configured|set an API key|尚未连接任何 AI 提供方|尚未連接任何 AI 提供方|AI プロバイダーにも接続されていません/i

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
