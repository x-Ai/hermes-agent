import type { BaseWindow, MenuItemConstructorOptions } from 'electron'

import type { AppMenuCopy } from './app-menu-copy'
import { windowMenuTemplate } from './window-menu'

/** What the application menu needs from main: identity, the announced
 *  language's labels, and the renderer requests its items trigger. */
export interface ApplicationMenuDeps {
  appName: string
  isMac: boolean
  copy: AppMenuCopy
  showAbout: () => void
  openUpdates: () => void
  newWindow: () => void
  openFolder: () => void
  closePreview: () => void
  reloadPreview: () => void
  /** The focused window per Electron's click callback; main substitutes its primary window. */
  toggleDevTools: (window: BaseWindow | undefined) => void
  zoom: { reset: () => void; in: () => void; out: () => void }
}

/** The macOS application menu (the other platforms ship without one); every
 *  item carries its label from `copy`, because Electron's role items are
 *  English only and the OS does not localize them. */
export function applicationMenuTemplate(deps: ApplicationMenuDeps): MenuItemConstructorOptions[] {
  const { appName, copy: m, isMac } = deps
  const template: MenuItemConstructorOptions[] = []

  const checkForUpdatesItem = {
    label: m.checkForUpdates,
    click: () => deps.openUpdates()
  }

  if (isMac) {
    template.push({
      label: appName,
      submenu: [
        { label: m.about(appName), click: () => deps.showAbout() },
        checkForUpdatesItem,
        { type: 'separator' },
        { label: m.services, role: 'services' },
        { type: 'separator' },
        { label: m.hide(appName), role: 'hide' },
        { label: m.hideOthers, role: 'hideOthers' },
        { label: m.showAll, role: 'unhide' },
        { type: 'separator' },
        { label: m.quit(appName), role: 'quit' }
      ]
    })
  }

  template.push({
    label: m.file,
    submenu: [
      // No accelerator: ⌘⇧N is a rebindable renderer keybind (session.newWindow);
      // a menu accelerator would fight the rebind panel and (on macOS) be
      // swallowed before the renderer sees it. Here purely for discoverability.
      { click: () => deps.newWindow(), label: m.newWindow },
      // Same no-accelerator rationale: ⌘O is the rebindable renderer keybind
      // (workspace.openFolder). Clicking runs the same open-folder-as-project
      // flow through the renderer.
      { click: () => deps.openFolder(), label: m.openFolder },
      { type: 'separator' },
      isMac
        ? {
            // NO accelerator: on macOS a registered ⌘W is consumed by the OS
            // menu before the web contents ever sees it (and registerAccelerator
            // false is a no-op on mac — electron#18295). Leaving it off lets
            // main's `before-input-event` handler intercept ⌘W and route it to
            // the renderer's close-active-tab. Clicking the item still closes
            // the tab (or window) via the same request.
            click: () => deps.closePreview(),
            label: m.close
          }
        : { label: m.exit, role: 'quit' }
    ]
  })
  template.push({
    label: m.edit,
    submenu: [
      { label: m.undo, role: 'undo' },
      { label: m.redo, role: 'redo' },
      { type: 'separator' },
      { label: m.cut, role: 'cut' },
      { label: m.copy, role: 'copy' },
      { label: m.paste, role: 'paste' },
      // ⌘⇧V is only wired up by this item existing: an accelerator with no menu
      // entry is never translated into an editor command, so the chord was a
      // no-op in every input in the app. The composer inserts plain text on
      // every paste anyway, so this is the same result as ⌘V there — it's the
      // terminal, preview, and other editable surfaces that need the strip.
      { label: m.pasteAndMatchStyle, role: 'pasteAndMatchStyle' },
      { label: m.delete, role: 'delete' },
      { label: m.selectAll, role: 'selectAll' },
      ...(isMac
        ? ([
            { type: 'separator' },
            {
              label: m.substitutions,
              submenu: [
                { label: m.showSubstitutions, role: 'showSubstitutions' },
                { type: 'separator' },
                { label: m.textReplacement, role: 'toggleTextReplacement' }
              ]
            }
          ] satisfies MenuItemConstructorOptions[])
        : [])
    ]
  })
  template.push({
    label: m.view,
    submenu: [
      // Not `role: 'reload'`: that hard-reloads the RENDERER (every pane, the
      // whole shell) and a focused in-app browser needs ⌘R to mean "reload
      // this page", the way it does in every other browser. ⇧⌘R
      // (`forceReload`) below stays the unconditional escape hatch.
      //
      // No accelerator: ⌘R is claimed in `installPreviewShortcut`, which works
      // on every platform (this menu exists only on macOS). Declaring it here
      // too would fire the item and the input hook for one keypress.
      { click: () => deps.reloadPreview(), label: m.reload },
      { label: m.forceReload, role: 'forceReload' },
      {
        label: m.toggleDevTools,
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
        click: (_menuItem, browserWindow) => deps.toggleDevTools(browserWindow)
      },
      { type: 'separator' },
      { label: m.actualSize, accelerator: 'CommandOrControl+0', click: () => deps.zoom.reset() },
      { label: m.zoomIn, accelerator: 'CommandOrControl+Plus', click: () => deps.zoom.in() },
      { label: m.zoomOut, accelerator: 'CommandOrControl+-', click: () => deps.zoom.out() },
      { type: 'separator' },
      { label: m.toggleFullScreen, role: 'togglefullscreen' }
    ]
  })
  template.push(windowMenuTemplate(isMac, m))
  template.push({
    label: m.help,
    role: 'help',
    submenu: [checkForUpdatesItem]
  })

  return template
}
