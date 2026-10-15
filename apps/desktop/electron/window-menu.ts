import type { MenuItemConstructorOptions } from 'electron'

import type { AppMenuCopy } from './app-menu-copy'

interface WindowMenuItem extends MenuItemConstructorOptions {
  submenu: MenuItemConstructorOptions[]
}

type WindowMenuCopy = Pick<AppMenuCopy, 'bringAllToFront' | 'close' | 'minimize' | 'window' | 'zoom'>

function windowMenuTemplate(isMac: boolean, copy: WindowMenuCopy): WindowMenuItem {
  return {
    label: copy.window,
    // Mark the macOS menu as AppKit's standard Window menu. Without this role,
    // macOS still exposes tiling from the green button but does not attach its
    // Move & Resize commands (and their keyboard shortcuts) to the app menu.
    ...(isMac ? { role: 'windowMenu' } : {}),
    submenu: isMac
      ? [
          { label: copy.minimize, role: 'minimize' },
          { label: copy.zoom, role: 'zoom' },
          { label: copy.bringAllToFront, role: 'front' }
        ]
      : // Click-only Close: the `close` role would register its default
        // CommandOrControl+W accelerator, claiming the chord before the
        // before-input-event run that routes a terminal-focused Ctrl+W to the
        // shell's word erase (#65457). The menu item still closes the focused
        // window when clicked.
        [
          { label: copy.minimize, role: 'minimize' },
          {
            click: (_menuItem, window) => window?.close(),
            label: copy.close,
            registerAccelerator: false
          }
        ]
  }
}

export { windowMenuTemplate }
