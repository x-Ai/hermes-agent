/**
 * Files in a gateway-hosted room. A send uploads each composer attachment to the room's gateway
 * (`groups.attachment.upload`) and binds the returned manifest to the message; the gateway commits
 * the files for the room's members with the event, and a member turn resolves its own bytes from that
 * store before it submits (`session_hosted_attachments.bound_submission_payload`). Reading back goes through
 * `groups.attachment.download` with the event the file belongs to: pictures are shown inline from a
 * window-local cache, other files are saved through the browser download path upstream's room view
 * uses. A gateway advertises the member route's file support as `room_attachments`.
 */

import { randomUuid } from '@hermes/plugin-sdk'
import { useEffect, useState } from 'react'

import { downloadCanonicalAttachment } from './canonical-attachment-download'
import { type CanonicalGroupBinding, canonicalGroupRequest } from './canonical-groups'
import type { Attachment, HostedAttachment } from './types'

/** `groups.capabilities.features` entry of a gateway whose member route carries a message's files. */
export const ROOM_ATTACHMENTS_FEATURE = 'room_attachments'

interface DownloadedAttachment {
  data_base64: string
  mime?: string
  name?: string
}

/** `data:<mime>;base64,<payload>` → its parts; null for anything else. */
export function splitDataUrl(data: string): { base64: string; mime: string } | null {
  const match = /^data:([^;,]*)(?:;[^;,=]+=[^;,]*)*;base64,(.*)$/is.exec(String(data || '').trim())

  return match ? { base64: match[2].replace(/\s+/g, ''), mime: match[1] || 'application/octet-stream' } : null
}

// Pictures by attachment id: seeded by the upload that sent them, filled by the first download.
const pictures = new Map<string, string>()
const loading = new Map<string, Promise<null | string>>()

/** Upload the composer's attachments to the room; the manifest a `groups.send` payload binds. */
export async function uploadCanonicalAttachments(
  binding: CanonicalGroupBinding,
  attachments: Attachment[]
): Promise<HostedAttachment[]> {
  const manifest: HostedAttachment[] = []

  for (const item of attachments) {
    const parts = splitDataUrl(item.data)

    if (!parts) {
      throw new Error(`${item.name}: not a data URL`)
    }

    const saved = await canonicalGroupRequest<HostedAttachment>(binding, 'groups.attachment.upload', {
      data_base64: parts.base64,
      kind: item.kind,
      mime: parts.mime,
      name: item.name,
      room_id: binding.roomId,
      upload_id: randomUuid()
    })

    // Upload receipts carry storage metadata beside the manifest; the send accepts the manifest only.
    const { attachment_id, kind, mime, name, size } = saved
    manifest.push({ attachment_id, kind, mime, name, ...(typeof size === 'number' ? { size } : {}) })

    if (item.kind === 'image') {
      pictures.set(attachment_id, item.data)
    }
  }

  return manifest
}

function fetchAttachment(binding: CanonicalGroupBinding, attachment: HostedAttachment): Promise<DownloadedAttachment> {
  return canonicalGroupRequest<DownloadedAttachment>(binding, 'groups.attachment.download', {
    attachment_id: attachment.attachment_id,
    event_id: attachment.event_id,
    room_id: binding.roomId
  })
}

/** A picture as a data URL, read once per window; null when it cannot be read (the chip shows instead). */
export function loadHostedAttachmentImage(
  binding: CanonicalGroupBinding,
  attachment: HostedAttachment
): Promise<null | string> {
  const cached = pictures.get(attachment.attachment_id)

  if (cached) {
    return Promise.resolve(cached)
  }

  if (!attachment.event_id) {
    return Promise.resolve(null)
  }

  let inflight = loading.get(attachment.attachment_id)

  if (!inflight) {
    inflight = fetchAttachment(binding, attachment)
      .then(result => {
        const url = `data:${result.mime || attachment.mime};base64,${result.data_base64}`
        pictures.set(attachment.attachment_id, url)

        return url
      })
      .catch(() => null)
      .finally(() => {
        loading.delete(attachment.attachment_id)
      })
    loading.set(attachment.attachment_id, inflight)
  }

  return inflight
}

/** Save a file through the browser download path (upstream's `downloadCanonicalAttachment`). */
export async function saveHostedAttachment(
  binding: CanonicalGroupBinding,
  attachment: HostedAttachment
): Promise<void> {
  if (!attachment.event_id) {
    return
  }

  const result = await fetchAttachment(binding, attachment)
  const bytes = Uint8Array.from(atob(result.data_base64), char => char.charCodeAt(0))
  downloadCanonicalAttachment(bytes, result.name || attachment.name, result.mime || attachment.mime)
}

function cachedPictures(files: HostedAttachment[]): Record<string, string> {
  const out: Record<string, string> = {}

  for (const file of files) {
    const url = pictures.get(file.attachment_id)

    if (url) {
      out[file.attachment_id] = url
    }
  }

  return out
}

/** The pictures among an entry's hosted files, by attachment id, loaded on first render. */
export function useHostedAttachmentImages(
  binding: CanonicalGroupBinding | null,
  attachments: HostedAttachment[] | undefined
): Record<string, string> {
  const wanted = (attachments || []).filter(file => file.kind === 'image')
  const key = wanted.map(file => file.attachment_id).join('\n')
  const [resolved, setResolved] = useState<Record<string, string>>(() => cachedPictures(wanted))

  useEffect(() => {
    if (!binding || !wanted.length) {
      return undefined
    }

    let cancelled = false

    void Promise.all(
      wanted.map(async file => [file.attachment_id, await loadHostedAttachmentImage(binding, file)] as const)
    ).then(pairs => {
      if (!cancelled) {
        setResolved(Object.fromEntries(pairs.filter((pair): pair is readonly [string, string] => Boolean(pair[1]))))
      }
    })

    return () => {
      cancelled = true
    }
    // The file list is compared by id: its array identity changes on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binding?.roomId, key])

  return resolved
}

export function _resetHostedAttachmentsForTests(): void {
  pictures.clear()
  loading.clear()
}
