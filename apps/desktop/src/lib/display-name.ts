import type { Translations } from '@/i18n'

/** Localize Hermes-reserved entity names for display without changing the
 * stable value used by configuration, RPC payloads, and equality checks. */
export function displayEntityName(name: string, t: Translations): string {
  return name.replace(/^default(?=$|[-_\s])/i, t.common?.defaultName || 'default')
}
