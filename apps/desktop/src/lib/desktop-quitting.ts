import type { RuntimeErrorsCopy } from '@/i18n/types_runtime'

/**
 * Once quit begins, the main process aborts every local backend start with one English sentence,
 * "Hermes Desktop is quitting." (electron/local-backend-lifecycle.ts), and the window stays up
 * through the teardown, so a request or reconnect in that window fails with it. Crash forensics and
 * the API failure log keep that English; a surface that shows it to the user reads it in the UI
 * language. It arrives bare (main's boot progress) or at the end of ipcRenderer.invoke's
 * "Error invoking remote method '…': Error: " wrap.
 */
const DESKTOP_QUITTING = /(?:^|:\s+)Hermes Desktop is quitting\.?$/

export function isDesktopQuitting(text: string): boolean {
  return DESKTOP_QUITTING.test(text.trim())
}

/** `text` in the UI language when it is that sentence; any other text verbatim. */
export function localizeDesktopQuitting(text: string, copy: Pick<RuntimeErrorsCopy, 'desktopQuitting'>): string {
  return isDesktopQuitting(text) ? copy.desktopQuitting : text
}
