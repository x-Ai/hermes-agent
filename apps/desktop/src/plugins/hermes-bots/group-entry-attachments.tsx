/**
 * What a room message carried: a Desktop room's pictures and file chips (`entry.images`, the data
 * URLs every responding member was shown) and a gateway-hosted room's files (`entry.attachments`):
 * pictures inline from the attachment cache, other files as a chip that saves the bytes on click.
 */

import { Button, Codicon, Tip } from '@hermes/plugin-sdk'

import { useCanonicalGroupLabels } from './canonical-group-labels'
import type { CanonicalGroupBinding } from './canonical-groups'
import { saveHostedAttachment, useHostedAttachmentImages } from './canonical-room-attachments'
import type { GroupMessage, HostedAttachment } from './types'

const CHIP =
  'flex items-center gap-1 rounded-md border border-(--ui-stroke-secondary) px-1.5 py-1 text-[0.65rem] text-(--ui-text-tertiary)'

const PICTURE = 'max-h-40 max-w-60 rounded-md border border-(--ui-stroke-secondary) object-contain'

function iconFor(kind: string): string {
  if (kind === 'pdf') {
    return 'file-pdf'
  }

  return kind === 'image' ? 'file-media' : 'file'
}

function HostedFiles({
  binding,
  entryKey,
  files
}: {
  binding: CanonicalGroupBinding
  entryKey: string
  files: HostedAttachment[]
}) {
  const labels = useCanonicalGroupLabels()
  const shown = useHostedAttachmentImages(binding, files)

  return (
    <>
      {files.map((file, index) => {
        const src = shown[file.attachment_id]
        const key = `${entryKey}:file:${index}`

        if (src) {
          return <img alt={file.name} className={PICTURE} key={key} src={src} title={file.name} />
        }

        return (
          <Tip key={key} label={labels.download}>
            <Button
              aria-label={`${labels.download}: ${file.name}`}
              className={CHIP}
              onClick={() => void saveHostedAttachment(binding, file)}
              size="inline"
              variant="text"
            >
              <Codicon className="text-[0.8rem]" name={iconFor(file.kind)} />
              <span className="max-w-48 truncate">{file.name}</span>
            </Button>
          </Tip>
        )
      })}
    </>
  )
}

export function GroupEntryAttachments({
  binding,
  entry,
  entryKey
}: {
  binding: CanonicalGroupBinding | null
  entry: GroupMessage
  entryKey: string
}) {
  const images = Array.isArray(entry.images) ? entry.images : []
  const files = binding ? entry.attachments || [] : []

  if (!images.length && !files.length) {
    return null
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {images.map((img, index) =>
        img.kind === 'pdf' || img.kind === 'file' ? (
          <div className={CHIP} key={`${entryKey}:img:${index}`} title={img.name || 'attached file'}>
            <Codicon className="text-[0.8rem]" name={iconFor(img.kind)} />
            <span className="max-w-48 truncate">{img.name || 'attached file'}</span>
          </div>
        ) : (
          <img
            alt={img.name || 'attached image'}
            className={PICTURE}
            key={`${entryKey}:img:${index}`}
            src={img.data}
            title={img.name || 'attached image'}
          />
        )
      )}
      {binding && files.length ? <HostedFiles binding={binding} entryKey={entryKey} files={files} /> : null}
    </div>
  )
}
