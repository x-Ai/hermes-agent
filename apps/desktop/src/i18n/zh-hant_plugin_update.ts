import type { TranslationOverride } from '@hermes/shared/i18n'

import type { PluginUpdateTranslations } from './types_plugin_update'

/** 更新已安裝外掛的文案（外掛頁）：目錄重新固定的授權與安全掃描覆寫。 */
export const zhHantPluginUpdate: TranslationOverride<PluginUpdateTranslations> = {
  updateToPin: (sha: string) => `更新至 ${sha}`,
  updateFailed: (name: string) => `無法更新 ${name}`,
  updated: (name: string) => `${name} 已更新至目前的目錄固定提交。請重新啟動閘道以套用。`,
  updateConsentTitle: (name: string) => `${name} 要求更多權限`,
  updateConsentBody: (name: string, sha: string) =>
    `${name} 的新目錄固定提交（${sha}）新增了已安裝版本沒有的功能面。只有在你信任它們時才套用：`,
  updateConsentConfirm: '套用更新',
  updateScanTitle: (name: string) => `安全掃描標記了 ${name}`,
  updateScanBody: (name: string, count: number) =>
    `${name} 的更新得到了謹慎判定（${count} 個發現）。每次更新都會掃描。只有在你信任來源時才套用：`,
  updateScanMore: (count: number) => `+ 還有 ${count} 個`,
  updateScanConfirm: '仍然更新',
  updateScanBlocked: (name: string) => `安全掃描封鎖了 ${name} 的更新（危險判定），無法覆寫。`,
  updatedGit: (name: string) => `${name} 已更新至最新提交。`
}
