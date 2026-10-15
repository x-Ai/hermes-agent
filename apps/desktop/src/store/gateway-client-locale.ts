import { announceRuntimeLocale } from '@/i18n/backend-packs'

import { liveGateways } from './gateway'

/** The UI language changed: re-announce it to every open socket. Each socket announces
 *  itself on open (`HermesGateway`); this covers a switch made while they are up. */
export function announceClientLocaleToOpenGateways(): void {
  for (const gateway of liveGateways()) {
    if (gateway.connectionState === 'open') {
      announceRuntimeLocale((method, params) => gateway.request(method, params))
    }
  }
}
