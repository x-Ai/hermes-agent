/**
 * Labels of the native application menu, the Window menu and the tray menu.
 * Electron's role items ship English labels only (the OS never localizes
 * them), so every item names its label from here in the language the renderer
 * announces over `hermes:app-locale`; languages without a table fall back to
 * English. Wording follows macOS's own menus (显示 / 顯示 for View, 結束 for
 * Quit in Traditional Chinese).
 */
export type AppMenuLocale = 'en' | 'zh' | 'zh-hant'

export interface AppMenuCopy {
  about: (appName: string) => string
  checkForUpdates: string
  services: string
  hide: (appName: string) => string
  hideOthers: string
  showAll: string
  quit: (appName: string) => string
  file: string
  newWindow: string
  openFolder: string
  close: string
  /** File › Quit on Windows and Linux; the macOS app menu carries `quit`. */
  exit: string
  edit: string
  undo: string
  redo: string
  cut: string
  copy: string
  paste: string
  pasteAndMatchStyle: string
  delete: string
  selectAll: string
  substitutions: string
  showSubstitutions: string
  textReplacement: string
  view: string
  reload: string
  forceReload: string
  toggleDevTools: string
  actualSize: string
  zoomIn: string
  zoomOut: string
  toggleFullScreen: string
  window: string
  minimize: string
  zoom: string
  bringAllToFront: string
  help: string
  trayShow: (appName: string) => string
  trayQuit: (appName: string) => string
}

// English stays byte-identical to Electron's role defaults and the former literals.
const en: AppMenuCopy = {
  about: appName => `About ${appName}`,
  checkForUpdates: 'Check for Updates…',
  services: 'Services',
  hide: appName => `Hide ${appName}`,
  hideOthers: 'Hide Others',
  showAll: 'Show All',
  quit: appName => `Quit ${appName}`,
  file: 'File',
  newWindow: 'New Window',
  openFolder: 'Open Folder…',
  close: 'Close',
  exit: 'Quit',
  edit: 'Edit',
  undo: 'Undo',
  redo: 'Redo',
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  pasteAndMatchStyle: 'Paste and Match Style',
  delete: 'Delete',
  selectAll: 'Select All',
  substitutions: 'Substitutions',
  showSubstitutions: 'Show Substitutions',
  textReplacement: 'Text Replacement',
  view: 'View',
  reload: 'Reload',
  forceReload: 'Force Reload',
  toggleDevTools: 'Toggle Developer Tools',
  actualSize: 'Actual Size',
  zoomIn: 'Zoom In',
  zoomOut: 'Zoom Out',
  toggleFullScreen: 'Toggle Full Screen',
  window: 'Window',
  minimize: 'Minimize',
  zoom: 'Zoom',
  bringAllToFront: 'Bring All to Front',
  help: 'Help',
  trayShow: appName => `Show ${appName}`,
  trayQuit: appName => `Quit ${appName}`
}

const zh: AppMenuCopy = {
  about: appName => `关于 ${appName}`,
  checkForUpdates: '检查更新…',
  services: '服务',
  hide: appName => `隐藏 ${appName}`,
  hideOthers: '隐藏其他',
  showAll: '全部显示',
  quit: appName => `退出 ${appName}`,
  file: '文件',
  newWindow: '新建窗口',
  openFolder: '打开文件夹…',
  close: '关闭',
  exit: '退出',
  edit: '编辑',
  undo: '撤销',
  redo: '重做',
  cut: '剪切',
  copy: '拷贝',
  paste: '粘贴',
  pasteAndMatchStyle: '粘贴并匹配样式',
  delete: '删除',
  selectAll: '全选',
  substitutions: '替换',
  showSubstitutions: '显示替换',
  textReplacement: '文本替换',
  view: '显示',
  reload: '重新载入',
  forceReload: '强制重新载入',
  toggleDevTools: '切换开发者工具',
  actualSize: '实际大小',
  zoomIn: '放大',
  zoomOut: '缩小',
  toggleFullScreen: '切换全屏幕',
  window: '窗口',
  minimize: '最小化',
  zoom: '缩放',
  bringAllToFront: '前置全部窗口',
  help: '帮助',
  trayShow: appName => `显示 ${appName}`,
  trayQuit: appName => `退出 ${appName}`
}

const zhHant: AppMenuCopy = {
  about: appName => `關於 ${appName}`,
  checkForUpdates: '檢查更新…',
  services: '服務',
  hide: appName => `隱藏 ${appName}`,
  hideOthers: '隱藏其他',
  showAll: '顯示全部',
  quit: appName => `結束 ${appName}`,
  file: '檔案',
  newWindow: '新增視窗',
  openFolder: '開啟檔案夾…',
  close: '關閉',
  exit: '結束',
  edit: '編輯',
  undo: '還原',
  redo: '重做',
  cut: '剪下',
  copy: '拷貝',
  paste: '貼上',
  pasteAndMatchStyle: '貼上並符合樣式',
  delete: '刪除',
  selectAll: '全選',
  substitutions: '替代',
  showSubstitutions: '顯示替代項目',
  textReplacement: '文字替代',
  view: '顯示',
  reload: '重新載入',
  forceReload: '強制重新載入',
  toggleDevTools: '切換開發者工具',
  actualSize: '實際大小',
  zoomIn: '放大',
  zoomOut: '縮小',
  toggleFullScreen: '切換全螢幕',
  window: '視窗',
  minimize: '最小化',
  zoom: '縮放',
  bringAllToFront: '將所有視窗移至最前',
  help: '輔助說明',
  trayShow: appName => `顯示 ${appName}`,
  trayQuit: appName => `結束 ${appName}`
}

export const APP_MENU_COPY: Record<AppMenuLocale, AppMenuCopy> = { en, zh, 'zh-hant': zhHant }

/** The renderer's locale id (`zh`, `zh-Hant`, `zh-TW`, `ja`, …) → the menu table that serves it. */
export function resolveAppMenuLocale(id: unknown): AppMenuLocale {
  const tag = typeof id === 'string' ? id.trim().toLowerCase() : ''

  if (!tag.startsWith('zh')) {
    return 'en'
  }

  return /^zh(?:-hant|-tw|-hk|-mo)(?:$|-)/.test(tag) ? 'zh-hant' : 'zh'
}

export function appMenuCopy(locale: AppMenuLocale): AppMenuCopy {
  return APP_MENU_COPY[locale]
}
