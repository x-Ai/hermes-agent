import type { TranslationOverrides } from './define-locale'

// The renderer's runtime errors this overlay translates; the older ones still fall back to English
// (overlay-gaps.json lists them), every key added since lands translated here.
export const frRuntime = {
  runtimeErrors: {
    desktopQuitting: 'Hermes Desktop est en cours de fermeture.',
    sshBootstrapCancelledByQuit:
      'La préparation de la connexion SSH a été annulée, car Hermes Desktop est en cours de fermeture.',
    imageCopyNoDimensions: 'L’image n’a pas de dimensions et ne peut pas être copiée',
    imageCopyCanvasUnavailable: 'Le contexte Canvas 2D n’est pas disponible',
    imageCopyEncodeFailed: 'Impossible d’encoder l’image en PNG',
    imageCopyDecodeFailed: 'Impossible de décoder l’image pour la copier dans le presse-papiers',
    imageCopyFetchFailed: (status: number) => `Impossible de récupérer l’image (${status})`,
    imageCopyNeedsSecureContext: 'Copier des images dans le presse-papiers nécessite un contexte sécurisé (HTTPS)'
  }
} satisfies Pick<TranslationOverrides, 'runtimeErrors'>
