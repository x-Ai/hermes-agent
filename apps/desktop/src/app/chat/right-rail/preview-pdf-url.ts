import { useEffect, useState } from 'react'

function dataUrlToBlob(dataUrl: string) {
  const comma = dataUrl.indexOf(',')

  if (comma < 0 || !dataUrl.startsWith('data:')) {
    throw new Error('Invalid PDF data URL')
  }

  const metadata = dataUrl
    .slice(5, comma)
    .split(';')
    .map(part => part.trim().toLowerCase())

  const payload = dataUrl.slice(comma + 1)

  if (metadata[0] !== 'application/pdf' || !metadata.slice(1).includes('base64')) {
    throw new Error('Invalid PDF data URL type')
  }

  let binary: string

  try {
    binary = atob(decodeURIComponent(payload))
  } catch {
    throw new Error('Invalid PDF data URL payload')
  }

  if (!binary.startsWith('%PDF-')) {
    throw new Error('Invalid PDF file header')
  }

  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: 'application/pdf' })
}

/** The PDF pane's blob URL: Chromium's viewer is blank for large data: URLs in an iframe, so the
 *  bytes go through a blob URL that is revoked when the target or the loaded bytes change. */
export function usePdfObjectUrl(isPdf: boolean, dataUrl: string | undefined) {
  const [pdfError, setPdfError] = useState<string>()
  const [pdfUrl, setPdfUrl] = useState<string>()
  useEffect(() => {
    setPdfUrl(undefined)
    setPdfError(undefined)

    if (!isPdf || !dataUrl) {
      return
    }

    // Chromium's PDF viewer is blank for large data: URLs in an iframe. Use a
    // blob URL instead, and revoke it when the target or loaded bytes change.
    if (typeof URL.createObjectURL !== 'function') {
      setPdfError('PDF preview requires object URL support')

      return
    }

    let objectUrl: string

    try {
      objectUrl = URL.createObjectURL(dataUrlToBlob(dataUrl))
      setPdfUrl(objectUrl)
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : String(error))

      return
    }

    return () => URL.revokeObjectURL(objectUrl)
  }, [isPdf, dataUrl])

  return { pdfError, pdfUrl }
}
