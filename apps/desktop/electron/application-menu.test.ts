import type { MenuItemConstructorOptions } from 'electron'
import { describe, expect, it, vi } from 'vitest'

import { APP_MENU_COPY } from './app-menu-copy'
import { type ApplicationMenuDeps, applicationMenuTemplate } from './application-menu'

function deps(locale: 'en' | 'zh' | 'zh-hant', isMac = true): ApplicationMenuDeps {
  return {
    appName: 'Hermes',
    isMac,
    copy: APP_MENU_COPY[locale],
    showAbout: vi.fn(),
    openUpdates: vi.fn(),
    newWindow: vi.fn(),
    openFolder: vi.fn(),
    closePreview: vi.fn(),
    reloadPreview: vi.fn(),
    toggleDevTools: vi.fn(),
    zoom: { reset: vi.fn(), in: vi.fn(), out: vi.fn() }
  }
}

const labels = (items: MenuItemConstructorOptions[] = []) => items.map(item => item.label ?? item.type)
const submenu = (item: MenuItemConstructorOptions) => item.submenu as MenuItemConstructorOptions[]

describe('application menu template', () => {
  it('names every top-level menu and item in the announced language while keeping the roles', () => {
    const template = applicationMenuTemplate(deps('zh'))

    expect(labels(template)).toEqual(['Hermes', '文件', '编辑', '显示', '窗口', '帮助'])
    expect(labels(submenu(template[0]))).toEqual([
      '关于 Hermes',
      '检查更新…',
      'separator',
      '服务',
      'separator',
      '隐藏 Hermes',
      '隐藏其他',
      '全部显示',
      'separator',
      '退出 Hermes'
    ])
    expect(submenu(template[0]).map(item => item.role)).toEqual([
      undefined,
      undefined,
      undefined,
      'services',
      undefined,
      'hide',
      'hideOthers',
      'unhide',
      undefined,
      'quit'
    ])
    expect(labels(submenu(template[2]))).toContain('粘贴并匹配样式')
    expect(labels(submenu(template[3]))).toEqual([
      '重新载入',
      '强制重新载入',
      '切换开发者工具',
      'separator',
      '实际大小',
      '放大',
      '缩小',
      'separator',
      '切换全屏幕'
    ])
    expect(labels(submenu(template[5]))).toEqual(['检查更新…'])
  })

  it('keeps the English menu byte-identical to the former literals', () => {
    const template = applicationMenuTemplate(deps('en'))

    expect(labels(template)).toEqual(['Hermes', 'File', 'Edit', 'View', 'Window', 'Help'])
    expect(labels(submenu(template[1]))).toEqual(['New Window', 'Open Folder…', 'separator', 'Close'])
    expect(labels(submenu(template[3]))[2]).toBe('Toggle Developer Tools')
  })

  it('routes clicks to the renderer requests main hands in', () => {
    const d = deps('zh')
    const template = applicationMenuTemplate(d)
    const file = submenu(template[1])
    const view = submenu(template[3])

    file[0].click?.(undefined as never, undefined, undefined as never)
    file[1].click?.(undefined as never, undefined, undefined as never)
    file[3].click?.(undefined as never, undefined, undefined as never)
    view[0].click?.(undefined as never, undefined, undefined as never)
    view[4].click?.(undefined as never, undefined, undefined as never)
    submenu(template[0])[0].click?.(undefined as never, undefined, undefined as never)

    expect(d.newWindow).toHaveBeenCalledOnce()
    expect(d.openFolder).toHaveBeenCalledOnce()
    expect(d.closePreview).toHaveBeenCalledOnce()
    expect(d.reloadPreview).toHaveBeenCalledOnce()
    expect(d.zoom.reset).toHaveBeenCalledOnce()
    expect(d.showAbout).toHaveBeenCalledOnce()
  })

  it('offers Quit under File off macOS instead of the app menu', () => {
    const template = applicationMenuTemplate(deps('zh-hant', false))

    expect(labels(template)).toEqual(['檔案', '編輯', '顯示', '視窗', '輔助說明'])
    expect(submenu(template[0]).at(-1)).toMatchObject({ label: '結束', role: 'quit' })
  })
})
