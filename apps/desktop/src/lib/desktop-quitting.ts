import type { RuntimeErrorsCopy } from '@/i18n/types_runtime'

/**
 * Once quit begins, the main process stops each local backend start (electron/local-backend-lifecycle.ts)
 * and refuses each new SSH bootstrap (electron/ssh-bootstrap-coordinator.ts) with a fixed English
 * sentence, and the window stays up through the teardown, so a request or reconnect in that window
 * fails with one. Crash forensics and the API failure log keep that English; a surface that shows it
 * to the user reads it in the UI language. Each arrives bare (main's boot progress) or at the end of
 * ipcRenderer.invoke's "Error invoking remote method '…': Error: " wrap.
 */
const QUIT_ABORTS = [
  [/(?:^|:\s+)Hermes Desktop is quitting\.?$/, 'desktopQuitting'],
  [/(?:^|:\s+)SSH bootstrap was cancelled because Desktop is quitting\.?$/, 'sshBootstrapCancelledByQuit']
] as const

export type QuitAbortKey = (typeof QUIT_ABORTS)[number][1]

function quitAbort(text: string): QuitAbortKey | null {
  const trimmed = text.trim()

  return QUIT_ABORTS.find(([pattern]) => pattern.test(trimmed))?.[1] ?? null
}

export function isDesktopQuitting(text: string): boolean {
  return quitAbort(text) !== null
}

/** `text` in the UI language when it is one of those sentences; any other text verbatim. */
export function localizeDesktopQuitting(text: string, copy: Pick<RuntimeErrorsCopy, QuitAbortKey>): string {
  const key = quitAbort(text)

  return key ? copy[key] : text
}
