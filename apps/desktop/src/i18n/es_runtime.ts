import type { TranslationOverrides } from './define-locale'

// The renderer's runtime errors this overlay translates; the older ones still fall back to English
// (overlay-gaps.json lists them), every key added since lands translated here.
export const esRuntime = {
  runtimeErrors: {
    desktopQuitting: 'Hermes Desktop se está cerrando.',
    imageCopyNoDimensions: 'La imagen no tiene dimensiones y no se puede copiar',
    imageCopyCanvasUnavailable: 'El contexto Canvas 2D no está disponible',
    imageCopyEncodeFailed: 'No se pudo codificar la imagen como PNG',
    imageCopyDecodeFailed: 'No se pudo decodificar la imagen para copiarla al portapapeles',
    imageCopyFetchFailed: (status: number) => `No se pudo obtener la imagen (${status})`,
    imageCopyNeedsSecureContext: 'Copiar imágenes al portapapeles requiere un contexto seguro (HTTPS)'
  }
} satisfies Pick<TranslationOverrides, 'runtimeErrors'>
