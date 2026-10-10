import { describe, expect, it, vi } from 'vitest'

// The converter reaches the SDK only to detect `host.readFileDataUrl`; the
// room harness mock supplies a host without it, so "no door" is the default
// and the read path is injected per test.
const { host } = vi.hoisted(() => ({ host: {} as Record<string, unknown> }))

vi.mock('@hermes/plugin-sdk', async () => {
  const { pluginSdkMock } = await import('./group-test-utils')

  return pluginSdkMock(host)
})

import {
  composerAttachmentDeps,
  GROUP_ROUTED_ATTACHMENT_MAX_BYTES,
  routedGroupAttachments
} from './group-route-attachments'

const PNG = 'data:image/png;base64,iVBORw0KGgo='
const PDF = 'data:application/pdf;base64,JVBERi0='
const TXT = 'data:text/plain;base64,aGk='
const identity = async (dataUrl: string) => dataUrl

function deps(files: Record<string, string>) {
  const reads: string[] = []

  return {
    normalizeImage: identity,
    read: async (path: string) => {
      reads.push(path)

      return files[path] ?? null
    },
    reads
  }
}

describe('composerAttachmentDeps', () => {
  it('is null on a desktop whose SDK has no file door', () => {
    delete host.readFileDataUrl

    expect(composerAttachmentDeps()).toBeNull()
  })

  it('reads through host.readFileDataUrl when the door exists', async () => {
    host.readFileDataUrl = vi.fn(async () => PNG)

    expect(await composerAttachmentDeps()?.read('/shots/a.png')).toBe(PNG)
    expect(host.readFileDataUrl).toHaveBeenCalledWith('/shots/a.png')
  })
})

describe('routedGroupAttachments', () => {
  it('reads image and file chips from disk and keeps their names, kinds and order', async () => {
    const d = deps({ '/shots/a.png': PNG, '/docs/spec.pdf': PDF, '/notes/todo.txt': TXT })

    const out = await routedGroupAttachments(
      [
        { kind: 'image', label: 'a.png', path: '/shots/a.png' },
        { kind: 'file', label: 'spec.pdf', path: '/docs/spec.pdf' },
        { kind: 'file', label: 'todo.txt', path: '/notes/todo.txt' }
      ],
      d
    )

    expect(out.failed).toEqual([])
    expect(out.refs).toEqual([])
    expect(out.images).toEqual([
      { data: PNG, kind: 'image', name: 'a.png' },
      { data: PDF, kind: 'pdf', name: 'spec.pdf' },
      { data: TXT, kind: 'file', name: 'todo.txt' }
    ])
    expect(d.reads).toEqual(['/shots/a.png', '/docs/spec.pdf', '/notes/todo.txt'])
  })

  it('downscales images through the room normalizer, never files', async () => {
    const normalizeImage = vi.fn(async () => 'data:image/png;base64,c21hbGw=')

    const out = await routedGroupAttachments(
      [
        { kind: 'image', label: 'big.png', path: '/big.png' },
        { kind: 'file', label: 'x.bin', path: '/x.bin' }
      ],
      { ...deps({ '/big.png': PNG, '/x.bin': PDF }), normalizeImage }
    )

    expect(normalizeImage).toHaveBeenCalledTimes(1)
    expect(out.images.map(img => img.data)).toEqual(['data:image/png;base64,c21hbGw=', PDF])
  })

  it('falls back to an inline data URL for a pasted image without a path', async () => {
    const out = await routedGroupAttachments([{ kind: 'image', label: 'pasted', thumbnailUrl: PNG }], deps({}))

    expect(out.images).toEqual([{ data: PNG, kind: 'image', name: 'pasted' }])
  })

  it('names an unreadable or oversized chip in failed instead of sending it', async () => {
    const huge = `data:application/octet-stream;base64,${'A'.repeat(Math.ceil((GROUP_ROUTED_ATTACHMENT_MAX_BYTES + 4) / 3) * 4)}`

    const out = await routedGroupAttachments(
      [
        { kind: 'image', label: 'gone.png', path: '/gone.png' },
        { kind: 'file', label: 'huge.bin', path: '/huge.bin' },
        { kind: 'file', label: 'ok.pdf', path: '/ok.pdf' }
      ],
      deps({ '/huge.bin': huge, '/ok.pdf': PDF })
    )

    expect(out.failed).toEqual(['gone.png', 'huge.bin'])
    expect(out.images.map(img => img.name)).toEqual(['ok.pdf'])
  })

  it('renders terminal, folder and url chips as leading prompt text, like the 1:1 chat', async () => {
    const out = await routedGroupAttachments(
      [
        { kind: 'terminal', label: 'tab 1', detail: '$ make\nok\n' },
        { kind: 'folder', label: 'src', refText: '@folder:src' },
        { kind: 'url', label: 'docs', refText: '@url:https://example.test' },
        null
      ],
      deps({})
    )

    expect(out.images).toEqual([])
    expect(out.failed).toEqual([])
    expect(out.refs).toEqual(['```terminal\n$ make\nok\n```', '@folder:src', '@url:https://example.test'])
  })

  it('refuses a chip of a kind the room cannot carry', async () => {
    const out = await routedGroupAttachments([{ kind: 'mystery', label: 'thing' }], deps({}))

    expect(out.failed).toEqual(['thing'])
  })
})
