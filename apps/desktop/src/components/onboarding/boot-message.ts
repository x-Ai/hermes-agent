import type { Translations } from '@/i18n'

type BootStepKey = keyof Translations['boot']['steps']

const BOOT_PHASE_COPY = {
  'backend.ready': 'backendReady',
  'backend.remote': 'connectingRemoteBackend',
  'backend.resolve': 'resolvingBackend',
  'backend.runtime': 'resolvingRuntime',
  'backend.spawn': 'startingBackend',
  'backend.update-restart': 'restartingAfterUpdate',
  'backend.update-wait': 'waitingForUpdate',
  'backend.port': 'waitingBackendLaunch',
  'backend.wait': 'waitingBackendReady',
  'renderer.boot': 'startingDesktopConnection',
  'renderer.config': 'loadingSettings',
  'renderer.gateway.connect': 'connectingGateway',
  'renderer.init': 'startingHermesDesktop',
  'runtime.external': 'usingRuntime',
  'runtime.ready': 'runtimeReady'
} as const satisfies Record<string, BootStepKey>

export function localizedBootMessage(phase: string, fallback: string, steps: Translations['boot']['steps']): string {
  const key = BOOT_PHASE_COPY[phase as keyof typeof BOOT_PHASE_COPY]

  return key ? steps[key] : fallback
}
