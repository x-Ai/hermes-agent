/**
 * Localized reading of a raw boot-failure detail. The main process reports what it saw in English
 * ("Timed out connecting to Hermes backend after 45000ms"); the renderer raises its WebSocket URL
 * timeouts in the UI language of that moment. The overlay keeps that text under Details, so the
 * known shapes are re-rendered in the current UI language, line by line, and anything else stays
 * verbatim for whoever reads the log. Pure and table-driven, like the cause classifier beside it.
 */

import { TRANSLATIONS } from '@/i18n/catalog'
import type { RuntimeErrorsCopy } from '@/i18n/types_runtime'
import { localizeBackendTimeout } from '@/lib/backend-timeout'

// use-gateway-boot.ts's mint timeouts. The overlay can change language after one is raised, so a
// line matches in the current copy or in any bundled catalog.
const RENDERER_TIMEOUTS = ['gatewayWsUrlTimedOut', 'gatewayWsUrlRemintTimedOut'] as const

type RendererTimeout = (typeof RENDERER_TIMEOUTS)[number]

type DetailCopy = Pick<RuntimeErrorsCopy, 'backendConnectTimedOut' | RendererTimeout>

function rendererTimeout(line: string, copy: DetailCopy): RendererTimeout | null {
  const text = line.trim()
  const catalogs: DetailCopy[] = [copy, ...Object.values(TRANSLATIONS).map(translations => translations.runtimeErrors)]

  return RENDERER_TIMEOUTS.find(key => catalogs.some(catalog => catalog[key] === text)) ?? null
}

function localizeLine(line: string, copy: DetailCopy): string {
  const timeout = rendererTimeout(line, copy)

  return timeout ? copy[timeout] : localizeBackendTimeout(line, copy)
}

function mapLines(raw: null | string, map: (line: string) => string): null | string {
  return raw ? raw.split('\n').map(map).join('\n') : raw
}

export function localizeBootFailureDetail(raw: null | string, copy: DetailCopy): null | string {
  return mapLines(raw, line => localizeLine(line, copy))
}

/** `raw` with each renderer timeout back in English, the language the cause classifiers match. */
export function canonicalBootFailure(raw: null | string, copy: DetailCopy): null | string {
  return mapLines(raw, line => {
    const timeout = rendererTimeout(line, copy)

    return timeout ? TRANSLATIONS.en.runtimeErrors[timeout] : line
  })
}
