import type { Locale } from './types'

/**
 * OAuth provider display names, keyed by the provider id `/api/providers/oauth`
 * returns. The backend names are product copy ("ChatGPT or Codex Subscription",
 * "Anthropic OAuth: Required Extra Usage Credits to Use Subscription"), not
 * identifiers, so a Chinese UI shows the Chinese name and keeps the id intact.
 * Follows Desktop's `zh_onboarding.ts` `providerTitles` naming.
 */
const ZH_PROVIDER_NAMES: Record<string, string> = {
  nous: 'Nous Portal',
  'openai-codex': 'ChatGPT 或 Codex 订阅',
  'qwen-oauth': 'Qwen（通过 Qwen CLI）',
  'minimax-oauth': 'MiniMax（OAuth）',
  'xai-oauth': 'xAI Grok OAuth（SuperGrok / Premium+）',
  anthropic: 'Anthropic 账号',
  'claude-code': 'Anthropic OAuth：需额外用量额度才能使用订阅'
}

/** Localize a provider's display name; an unknown id keeps the backend's own name. */
export function localizeOAuthProviderName(id: string, fallback: string, locale: Locale): string {
  if (locale !== 'zh') return fallback
  return ZH_PROVIDER_NAMES[id] ?? fallback
}
