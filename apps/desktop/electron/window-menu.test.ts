import assert from 'node:assert/strict'

import { test } from 'vitest'

import { APP_MENU_COPY } from './app-menu-copy'
import { windowMenuTemplate } from './window-menu'

test('macOS registers the native Window menu so AppKit window commands remain available', () => {
  const menu = windowMenuTemplate(true, APP_MENU_COPY.en)

  assert.equal(menu.role, 'windowMenu')
  assert.deepEqual(
    menu.submenu.map(item => item.role),
    ['minimize', 'zoom', 'front']
  )
})

test('non-macOS keeps the explicit cross-platform Window menu', () => {
  const menu = windowMenuTemplate(false, APP_MENU_COPY.en)

  assert.equal(menu.label, 'Window')
  assert.deepEqual(
    menu.submenu.map(item => item.role),
    ['minimize', undefined]
  )
  assert.equal(menu.submenu[1].label, 'Close')
})

test('the Window menu reads its labels from the announced language, roles untouched', () => {
  const menu = windowMenuTemplate(true, APP_MENU_COPY.zh)

  assert.equal(menu.label, '窗口')
  assert.deepEqual(
    menu.submenu.map(item => [item.role, item.label]),
    [
      ['minimize', '最小化'],
      ['zoom', '缩放'],
      ['front', '前置全部窗口']
    ]
  )
})
