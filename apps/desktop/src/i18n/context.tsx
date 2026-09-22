import { applyDocumentLocale, isRecord } from '@hermes/shared/i18n'
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { getHermesConfigRecord, type HermesConfigRecord, retainConfigReadOrigin, saveHermesConfig } from '@/hermes'

import { TRANSLATIONS } from './catalog'
import {
  DEFAULT_LOCALE,
  isSupportedLocaleValue,
  localeConfigValue,
  normalizeLocale,
  resolvePreferredLocale,
  writeStoredLocale
} from './languages'
import { setRuntimeI18nLocale } from './runtime'
import type { Locale, Translations } from './types'

export { LOCALE_META } from './languages'

export interface I18nConfigClient {
  getConfig: () => Promise<HermesConfigRecord>
  saveConfig: (config: HermesConfigRecord) => Promise<{ ok: boolean }>
}

const defaultConfigClient: I18nConfigClient = {
  getConfig: () => {
    if (typeof window === 'undefined' || !window.hermesDesktop?.api) {
      return Promise.resolve({})
    }

    // Merged defaults make an unset language indistinguishable from saved English.
    // Older backends ignore the option and keep returning English as before.
    return getHermesConfigRecord(undefined, { includeDefaults: false })
  },
  saveConfig: config => {
    if (typeof window === 'undefined' || !window.hermesDesktop?.api) {
      return Promise.resolve({ ok: true })
    }

    // No explicit scope: saveHermesConfig resolves the record's captured read
    // origin itself (resolveConfigWriteScope), and withConfigDisplayLanguage
    // retains that origin onto the derived record.
    return saveHermesConfig(config, undefined, { preserveLanguage: true })
  }
}

export function getConfigDisplayLanguage(config: HermesConfigRecord): unknown {
  return isRecord(config.display) ? config.display.language : undefined
}

export function withConfigDisplayLanguage(config: HermesConfigRecord, locale: Locale): HermesConfigRecord {
  const display = isRecord(config.display) ? config.display : {}

  return retainConfigReadOrigin(
    {
      ...config,
      display: {
        ...display,
        language: localeConfigValue(locale)
      }
    },
    config
  )
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export interface I18nContextValue {
  configLoadError: Error | null
  isLoadingConfig: boolean
  isSavingLocale: boolean
  locale: Locale
  saveError: Error | null
  setLocale: (next: Locale) => Promise<void>
  t: Translations
}

const I18nContext = createContext<I18nContextValue>({
  configLoadError: null,
  isLoadingConfig: false,
  isSavingLocale: false,
  locale: DEFAULT_LOCALE,
  saveError: null,
  setLocale: async () => {},
  t: TRANSLATIONS[DEFAULT_LOCALE]
})

export interface I18nProviderProps {
  children: ReactNode
  configClient?: I18nConfigClient | null
  initialLocale?: unknown
}

export function I18nProvider({ children, configClient = defaultConfigClient, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => resolvePreferredLocale(initialLocale))
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [isSavingLocale, setIsSavingLocale] = useState(false)
  const [configLoadError, setConfigLoadError] = useState<Error | null>(null)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const localeRef = useRef(locale)
  // Set once the user picks a language through setLocale: a startup read that
  // resolves (or fails) after that must never overwrite an explicit choice.
  const userLocaleRef = useRef(false)
  const hasPersistedLanguageRef = useRef(false)

  // eslint-disable-next-line no-restricted-syntax -- legitimate non-atom ref write (see eslint rule comment)
  useEffect(() => {
    localeRef.current = locale
    writeStoredLocale(locale)
    setRuntimeI18nLocale(locale)
    applyDocumentLocale(locale)
  }, [locale])

  // eslint-disable-next-line no-restricted-syntax -- backend ownership is non-render state used by the save callback
  useEffect(() => {
    if (!configClient) {
      return
    }

    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let retryCount = 0

    // The desktop races its own backend at startup: the renderer mounts before
    // the backend is ready, so the first /api/config call can time out. We keep
    // a rejected config load leaves the system/local first-paint locale usable,
    // while bounded retries recover transient startup failures and apply the
    // persisted display.language once the backend comes up.
    const MAX_LOCALE_RETRIES = 10
    const LOCALE_RETRY_DELAY_MS = 3_000

    const loadLocale = () => {
      setIsLoadingConfig(true)
      setConfigLoadError(null)

      return configClient
        .getConfig()
        .then(async config => {
          if (cancelled || userLocaleRef.current) {
            return
          }

          const saved = getConfigDisplayLanguage(config)

          // A saved choice needs no machine probe and always takes precedence.
          if (isSupportedLocaleValue(saved)) {
            hasPersistedLanguageRef.current = true
            setLocaleState(normalizeLocale(saved))

            return
          }

          hasPersistedLanguageRef.current = false

          if (saved != null && saved !== '') {
            setLocaleState(DEFAULT_LOCALE)

            return
          }

          // Keep backend config untouched until the user explicitly chooses a
          // language; the desktop-local preference owns pre-backend surfaces.
          const machineProfile = await window.hermesDesktop?.getMachineProfile?.().catch(() => null)

          if (!cancelled && !userLocaleRef.current) {
            setLocaleState(resolvePreferredLocale(undefined, [machineProfile?.locale]))
          }
        })
        .catch(error => {
          if (cancelled || userLocaleRef.current) {
            return
          }

          hasPersistedLanguageRef.current = false
          setConfigLoadError(toError(error))

          if (retryCount < MAX_LOCALE_RETRIES) {
            retryCount += 1
            retryTimer = setTimeout(() => {
              loadLocale()
            }, LOCALE_RETRY_DELAY_MS)
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoadingConfig(false)
          }
        })
    }

    loadLocale()

    return () => {
      cancelled = true

      if (retryTimer) {
        clearTimeout(retryTimer)
      }
    }
  }, [configClient, initialLocale])

  const setLocale = useCallback(
    async (next: Locale) => {
      const previousLocale = localeRef.current

      userLocaleRef.current = true
      setSaveError(null)
      setLocaleState(next)

      if (!configClient) {
        return
      }

      setIsSavingLocale(true)

      try {
        const latestConfig = await configClient.getConfig()
        const result = await configClient.saveConfig(withConfigDisplayLanguage(latestConfig, next))

        if (!result.ok) {
          throw new Error('Failed to save language')
        }

        hasPersistedLanguageRef.current = true
      } catch (error) {
        const nextError = toError(error)

        setSaveError(nextError)

        // During first-run the backend does not exist yet. Keep the local
        // selection so setup and recovery stay readable; a previously saved
        // backend preference still retains rollback semantics.
        if (hasPersistedLanguageRef.current) {
          setLocaleState(previousLocale)
          writeStoredLocale(previousLocale)

          throw nextError
        }
      } finally {
        setIsSavingLocale(false)
      }
    },
    [configClient]
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      configLoadError,
      isLoadingConfig,
      isSavingLocale,
      locale,
      saveError,
      setLocale,
      t: TRANSLATIONS[locale]
    }),
    [configLoadError, isLoadingConfig, isSavingLocale, locale, saveError, setLocale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}
