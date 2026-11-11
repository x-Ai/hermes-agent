import type { PluginUpdateAllTranslations } from './types_plugin_update'

/** Plugins tab: "Update all" and the auto-update switch. */
export const zhHantPluginUpdateAll: PluginUpdateAllTranslations = {
  updateAll: '全部更新',
  updatingAll: '正在更新…',
  updateAllTip: '檢查所有已安裝的外掛程式，並套用無需審查的更新',
  updateAllDone: (updated: number, review: number, failed: number) =>
    `已更新 ${updated} 個` + (review ? `，${review} 個需要審查` : '') + (failed ? `，${failed} 個失敗` : ''),
  updateAllNone: '所有外掛程式皆已是最新版本',
  updateAllFailed: '無法更新外掛程式',
  autoUpdate: '自動更新',
  autoUpdateTip: (hours: number) =>
    `閘道檢查時（每 ${hours} 小時）自動套用外掛程式更新。更新後的程式碼會在新工作階段中載入。`,
  autoUpdateFailed: '無法變更外掛程式自動更新設定'
}
