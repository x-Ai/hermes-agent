import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { host, saved } = vi.hoisted(() => ({
  host: {
    notify: vi.fn(),
    onEvent: () => () => undefined,
    request: vi.fn(),
    requestProfile: vi.fn(),
    state: {} as Record<string, unknown>
  },
  saved: vi.fn()
}))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})
vi.mock('./canonical-attachment-download', () => ({ downloadCanonicalAttachment: saved }))

import {
  _resetHostedAttachmentsForTests,
  loadHostedAttachmentImage,
  saveHostedAttachment,
  splitDataUrl,
  uploadCanonicalAttachments
} from './canonical-room-attachments'

const binding = { connectionId: 'local', profile: 'default', roomId: 'r1' }
const ID = 'att_' + 'a'.repeat(32)

beforeEach(() => {
  host.requestProfile.mockReset()
  saved.mockReset()
  _resetHostedAttachmentsForTests()
})

afterEach(() => {
  _resetHostedAttachmentsForTests()
})

describe('splitDataUrl', () => {
  it('takes the media type and the payload apart, and refuses anything that is not a data URL', () => {
    expect(splitDataUrl('data:image/png;base64,AAAA')).toEqual({ base64: 'AAAA', mime: 'image/png' })
    expect(splitDataUrl('data:;base64,QQ==')).toEqual({ base64: 'QQ==', mime: 'application/octet-stream' })
    expect(splitDataUrl('data:text/plain;charset=utf-8;base64,QQ==\n')).toEqual({ base64: 'QQ==', mime: 'text/plain' })
    expect(splitDataUrl('/tmp/a.png')).toBeNull()
  })
})

describe('uploadCanonicalAttachments', () => {
  it('uploads each file with its own upload id and returns the manifest a send binds', async () => {
    const calls: Array<Record<string, unknown>> = []
    host.requestProfile.mockImplementation(async (_route: unknown, method: string, params: Record<string, unknown>) => {
      expect(method).toBe('groups.attachment.upload')
      calls.push(params)

      return {
        attachment_id: `att_${String(calls.length).repeat(32)}`,
        kind: params.kind,
        mime: params.mime,
        name: params.name,
        size: 3,
        sha256: 'x',
        state: 'uncommitted'
      }
    })

    const manifest = await uploadCanonicalAttachments(binding, [
      { data: 'data:image/png;base64,AAAA', kind: 'image', name: 'a.png' },
      { data: 'data:application/pdf;base64,JVBERi0=', kind: 'pdf', name: 'b.pdf' }
    ])

    expect(manifest).toEqual([
      { attachment_id: `att_${'1'.repeat(32)}`, kind: 'image', mime: 'image/png', name: 'a.png', size: 3 },
      { attachment_id: `att_${'2'.repeat(32)}`, kind: 'pdf', mime: 'application/pdf', name: 'b.pdf', size: 3 }
    ])
    expect(calls.map(params => params.data_base64)).toEqual(['AAAA', 'JVBERi0='])
    expect(new Set(calls.map(params => params.upload_id)).size).toBe(2)
    // The picture the sender attached is shown from its own bytes, before any download.
    expect(
      await loadHostedAttachmentImage(binding, {
        attachment_id: `att_${'1'.repeat(32)}`,
        kind: 'image',
        mime: 'image/png',
        name: 'a.png'
      })
    ).toBe('data:image/png;base64,AAAA')
    expect(host.requestProfile).toHaveBeenCalledTimes(2)
  })
})

describe('loadHostedAttachmentImage', () => {
  it('downloads a picture once per window and answers null when the gateway refuses', async () => {
    host.requestProfile
      .mockResolvedValueOnce({ data_base64: 'QUJD', mime: 'image/png', name: 'shot.png' })
      .mockRejectedValueOnce(new Error('gone'))
    const file = { attachment_id: ID, event_id: 'user:1', kind: 'image', mime: 'image/png', name: 'shot.png' }

    const [first, second] = await Promise.all([
      loadHostedAttachmentImage(binding, file),
      loadHostedAttachmentImage(binding, file)
    ])

    expect(first).toBe('data:image/png;base64,QUJD')
    expect(second).toBe(first)
    expect(await loadHostedAttachmentImage(binding, file)).toBe(first)
    expect(host.requestProfile).toHaveBeenCalledTimes(1)
    expect(host.requestProfile.mock.calls[0][2]).toMatchObject({ attachment_id: ID, event_id: 'user:1', room_id: 'r1' })

    expect(await loadHostedAttachmentImage(binding, { ...file, attachment_id: 'att_' + 'b'.repeat(32) })).toBeNull()
    expect(
      await loadHostedAttachmentImage(binding, { ...file, attachment_id: 'att_' + 'c'.repeat(32), event_id: undefined })
    ).toBeNull()
  })
})

describe('saveHostedAttachment', () => {
  it('hands the downloaded bytes to the browser download path under the stored name', async () => {
    host.requestProfile.mockResolvedValue({ data_base64: 'QUJD', mime: 'text/plain', name: 'note.txt' })

    await saveHostedAttachment(binding, {
      attachment_id: ID,
      event_id: 'user:1',
      kind: 'file',
      mime: 'text/plain',
      name: 'draft.txt'
    })

    expect(saved).toHaveBeenCalledTimes(1)
    const [bytes, name, mime] = saved.mock.calls[0]
    expect(Array.from(bytes as Uint8Array)).toEqual([65, 66, 67])
    expect([name, mime]).toEqual(['note.txt', 'text/plain'])
  })
})
