import { act, cleanup, renderHook } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useComposerActions } from '@/app/chat/hooks/use-composer-actions'
import { I18nProvider, setRuntimeI18nLocale, TRANSLATIONS } from '@/i18n'
import { $notifications, clearNotifications } from '@/store/notifications'
import { $connection } from '@/store/session'
import { clearWebappSession, seedWebappSession } from '@/test/webapp-session'

import { installBrowserDesktopBridge } from './browser-desktop-bridge'
import { BROWSER_UPLOAD_MAX_BYTES } from './browser-uploads'

// The browser build refuses some attachments itself: a folder dropped with no host path, a file or
// an image over its upload limit, an SVG, an upload the server or a proxy turned away without a
// detail. Those reasons are our own copy, so they read in the UI language. Outside English a drop
// warning's line used to lose its reason (readableError swaps a message it doesn't know for the
// fallback, and the warning's is empty), and a toast put the English reason under the fallback.

afterEach(() => {
  cleanup()
  clearNotifications()
  clearWebappSession()
  Reflect.deleteProperty(window, 'hermesDesktop')
  $connection.set(null)
  setRuntimeI18nLocale('en')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const LIMIT_MIB = String(BROWSER_UPLOAD_MAX_BYTES / (1024 * 1024))
const tooLarge = (name: string, type = '') => new File([new Uint8Array(BROWSER_UPLOAD_MAX_BYTES + 1)], name, { type })
const NGINX_413 = '<html><head><title>413 Request Entity Too Large</title></head><body>nginx</body></html>'

/** Latin words left once the unit and the image formats the copy names are taken out: English. */
const englishWords = (text: string) => text.replace(/MiB|SVG|ICO|PNG|JPEG|GIF|WebP|BMP/g, '').match(/[A-Za-z]+/g) ?? []

// Names without Latin letters, so any Latin word in a line comes from its copy.
const NAMES = {
  ar: { folder: 'تصاميم', huge: 'تقرير', proxied: 'ملاحظات', unreachable: 'سجل' },
  zh: { folder: '设计稿', huge: '报告', proxied: '笔记', unreachable: '日志' }
} as const

async function renderWebComposer(locale: keyof typeof NAMES) {
  seedWebappSession('served-token')

  // The upload route answers by file: nginx's HTML 413 for one, a proxy's 502 for the rest.
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const file = (init?.body as FormData).get('file') as File

    return file.name === NAMES[locale].proxied
      ? new Response(NGINX_413, { status: 413 })
      : new Response('<html><body><h1>502 Bad Gateway</h1></body></html>', { status: 502 })
  })

  vi.stubGlobal('fetch', fetchMock)
  expect(installBrowserDesktopBridge()).toBe(true)
  $connection.set(await window.hermesDesktop.getConnection('owner'))

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(I18nProvider, { children, configClient: null, initialLocale: locale })

  const { result } = renderHook(
    () => useComposerActions({ activeSessionId: null, currentCwd: '/workspace', requestGateway: vi.fn() }),
    { wrapper }
  )

  return result
}

describe.each(['zh', 'ar'] as const)('browser attach refusals in %s', locale => {
  const t = TRANSLATIONS[locale]
  const names = NAMES[locale]

  it('gives every refused drop its reason in that language', async () => {
    const result = await renderWebComposer(locale)

    await act(async () => {
      await result.current.attachDroppedItems([
        { file: new File([], names.folder), isDirectory: true, path: '' },
        { file: tooLarge(names.huge), path: '' },
        { file: new File(['x'], names.proxied), path: '' },
        { file: new File(['x'], names.unreachable), path: '' }
      ])
    })

    const warning = $notifications.get().find(notice => notice.kind === 'warning')
    const lines = warning?.detail?.split('\n') ?? []

    expect(warning?.title).toBe(t.desktop.dropFiles)
    expect(lines).toHaveLength(4)

    const reasons = Object.fromEntries(
      Object.entries(names).map(([item, name], index) => {
        const label = `${t.desktop.dropFailedItem(name)}: `

        return [item, lines[index]?.startsWith(label) ? lines[index].slice(label.length) : '']
      })
    )

    // The folder's reason names the way that works: the composer's own Attach menu, and its Folder item.
    const arrow = locale === 'ar' ? '←' : '→'

    expect(reasons.folder).toContain(`${t.composer.attachLabel} ${arrow} ${t.composer.folder}`)
    expect(reasons.huge).toContain(LIMIT_MIB)
    expect(reasons.proxied).toContain('413')
    expect(reasons.unreachable).toContain('502')

    for (const line of lines) {
      expect(englishWords(line), line).toEqual([])
    }
  })

  it('says why a pick or a paste was refused in that language, with no English line under it', async () => {
    const result = await renderWebComposer(locale)

    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
      Object.defineProperty(this, 'files', { configurable: true, value: [tooLarge(names.huge)] })
      this.dispatchEvent(new Event('change'))
    })

    const hugeImage = new Blob([new Uint8Array(BROWSER_UPLOAD_MAX_BYTES + 1)], { type: 'image/png' })
    const svg = new Blob(['<svg xmlns="http://www.w3.org/2000/svg"/>'], { type: 'image/svg+xml' })

    const attempts = [
      () => result.current.pickContextPaths('file'),
      () => result.current.attachImageBlob(hugeImage),
      () => result.current.attachImageBlob(svg)
    ]

    const toasts = []

    for (const attempt of attempts) {
      await act(async () => {
        await attempt()
      })
      // The store keeps the newest toast first.
      toasts.push($notifications.get()[0])
    }

    const [pick, image, vector] = toasts

    expect(pick).toMatchObject({ kind: 'error', title: t.desktop.attachFailed })
    expect(image).toMatchObject({ kind: 'error', title: t.desktop.imageAttachFailed })
    expect(vector).toMatchObject({ kind: 'error', title: t.desktop.imageAttachFailed })
    expect(pick.message).toContain(LIMIT_MIB)
    expect(image.message).toContain(LIMIT_MIB)
    expect(vector.message).toContain('SVG')

    for (const notice of [pick, image, vector]) {
      expect(englishWords(notice.message), notice.message).toEqual([])
      expect(notice.detail).toBeUndefined()
    }
  })
})
