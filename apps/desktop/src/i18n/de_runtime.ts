import type { TranslationOverrides } from './define-locale'

// The renderer's runtime errors this overlay translates; the older ones still fall back to English
// (overlay-gaps.json lists them), every key added since lands translated here.
export const deRuntime = {
  runtimeErrors: {
    desktopQuitting: 'Hermes Desktop wird beendet.',
    sshBootstrapCancelledByQuit: 'Der Aufbau der SSH-Verbindung wurde abgebrochen, weil Hermes Desktop beendet wird.',
    imageCopyNoDimensions: 'Das Bild hat keine Abmessungen und kann nicht kopiert werden',
    imageCopyCanvasUnavailable: 'Der Canvas-2D-Kontext ist nicht verfügbar',
    imageCopyEncodeFailed: 'Das Bild konnte nicht als PNG codiert werden',
    imageCopyDecodeFailed: 'Das Bild konnte für die Zwischenablage nicht decodiert werden',
    imageCopyFetchFailed: (status: number) => `Bild konnte nicht abgerufen werden (${status})`,
    imageCopyNeedsSecureContext:
      'Zum Kopieren von Bildern in die Zwischenablage ist ein sicherer Kontext (HTTPS) erforderlich'
  }
} satisfies Pick<TranslationOverrides, 'runtimeErrors'>
