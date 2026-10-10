/**
 * Composer attachments on an `@<group>` draft. The main composer's chips are
 * references to THIS machine's disk (a path plus a bounded thumbnail), while
 * a room forwards data URLs to every member's gateway. This turns the one
 * into the other under the room's own limits — the picker's size cap and
 * image downscale (`group-attachments.ts`) — and renders the chips that are
 * not files (a terminal selection, a folder or url reference) the way the
 * 1:1 chat's prompt does: as text ahead of the message.
 *
 * Bytes come through the plugin SDK's `host.readFileDataUrl` (the composer's
 * attach-sized bridge read). An older desktop without that door routes no
 * attachment at all; the route then keeps the draft with a notice.
 */

import { host } from '@hermes/plugin-sdk'

import { normalizeGroupAttachment } from './group-attachments'
import type { Attachment, AttachmentKind } from './types'

/** The room picker's cap: these payloads persist in the room log. */
export const GROUP_ROUTED_ATTACHMENT_MAX_BYTES = 15_000_000

/** What the conversion needs from the host. */
export interface RoutedAttachmentDeps {
  /** A LOCAL file as a data URL; null when it cannot be read. */
  read: (path: string) => Promise<null | string>
  /** Image downscale — the room's own unless a test injects one (no canvas decodes under jsdom). */
  normalizeImage?: (dataUrl: string) => Promise<string>
}

/** The host's file door, or null on a desktop whose SDK predates it. */
export function composerAttachmentDeps(): null | RoutedAttachmentDeps {
  return typeof host.readFileDataUrl === 'function' ? { read: path => host.readFileDataUrl(path) } : null
}

export interface RoutedAttachments {
  /** Chips that could not become payloads (unreadable, over the cap, a kind the room cannot carry), by label. */
  failed: string[]
  images: Attachment[]
  /** Text the non-file chips contribute, in chip order. */
  refs: string[]
}

/** The composer chip fields the route reads. All optional: the middleware
 *  draft types its attachments as `unknown[]`. */
interface ComposerChip {
  detail?: unknown
  kind?: unknown
  label?: unknown
  path?: unknown
  previewUrl?: unknown
  refText?: unknown
  thumbnailUrl?: unknown
}

const str = (value: unknown): string => (typeof value === 'string' ? value : '')

/** Decoded size of a base64 data URL, close enough for a cap check. */
const dataUrlBytes = (dataUrl: string): number => Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75)

function chipName(chip: ComposerChip, kind: AttachmentKind): string {
  const leaf = str(chip.path).split(/[\\/]/).filter(Boolean).pop()

  return str(chip.label) || leaf || (kind === 'image' ? 'image.png' : 'attachment')
}

function chipKind(chip: ComposerChip): AttachmentKind {
  if (chip.kind === 'image') {
    return 'image'
  }

  return [chip.path, chip.label].some(value => /\.pdf$/i.test(str(value))) ? 'pdf' : 'file'
}

/** The chip's bytes: the file on disk first (the full-resolution source), else
 *  an inline data URL a pasted image may still carry. */
async function chipDataUrl(chip: ComposerChip, read: RoutedAttachmentDeps['read']): Promise<null | string> {
  const path = str(chip.path)

  if (path) {
    return read(path)
  }

  return [chip.previewUrl, chip.thumbnailUrl].map(str).find(inline => inline.startsWith('data:')) || null
}

export async function routedGroupAttachments(raw: unknown[], deps: RoutedAttachmentDeps): Promise<RoutedAttachments> {
  const normalize = deps.normalizeImage ?? normalizeGroupAttachment
  const out: RoutedAttachments = { failed: [], images: [], refs: [] }

  for (const entry of raw) {
    // Session switches leave holes in the composer's attachment array.
    if (!entry || typeof entry !== 'object') {
      continue
    }

    const chip = entry as ComposerChip

    // A terminal selection and a folder/url reference are prompt text in the
    // 1:1 chat too (`attachmentDisplayText`); the room gets the same lines.
    if (chip.kind === 'terminal' && str(chip.detail).trim()) {
      out.refs.push(`\`\`\`terminal\n${str(chip.detail).trim()}\n\`\`\``)

      continue
    }

    if (chip.kind === 'folder' || chip.kind === 'url') {
      if (str(chip.refText)) {
        out.refs.push(str(chip.refText))
      } else {
        out.failed.push(chipName(chip, 'file'))
      }

      continue
    }

    if (chip.kind !== 'image' && chip.kind !== 'file') {
      out.failed.push(chipName(chip, 'file'))

      continue
    }

    const kind = chipKind(chip)
    const name = chipName(chip, kind)
    const data = await chipDataUrl(chip, deps.read).catch(() => null)

    if (!data || dataUrlBytes(data) > GROUP_ROUTED_ATTACHMENT_MAX_BYTES) {
      out.failed.push(name)

      continue
    }

    out.images.push({ data: kind === 'image' ? await normalize(data) : data, kind, name })
  }

  return out
}
