import { isExpectedTransition } from './crash-forensics'

// Format an api-request failure for desktop.log. The renderer only ever sees
// the invoke rejection; the real stack lives here in main, so persist it
// before rethrowing. Clamp: paths and error detail must not bloat the log.
//
// A request that lost the race with app quit is rejected on purpose: the
// backend lifecycle aborts in-flight work with an expected-transition sentinel
// (#119409), so that case is one line, never a crash-shaped stack — error-shaped
// entries in desktop.log keep meaning "something died".
export function formatApiRequestFailure(
  request: { method?: string; path?: string } | null | undefined,
  error: unknown
): string {
  const method = String(request?.method ?? 'GET').toUpperCase()
  const path = String(request?.path ?? '(no path)').slice(0, 500)

  const detail = isExpectedTransition(error)
    ? `expected shutdown transition — ${error.message}`
    : error instanceof Error
      ? (error.stack ?? error.message)
      : String(error)

  return `[hermes:api ${method} ${path}] ${detail}`.slice(0, 6000)
}
