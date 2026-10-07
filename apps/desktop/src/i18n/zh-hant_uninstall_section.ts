import type { TranslationOverride } from '@hermes/shared/i18n'

import type { UninstallSectionTranslations } from './types_uninstall_section'

// 設定 › 關於 › 解除安裝；zh-hant_settings.ts 以 `settings.uninstallSection` 組入（檔案行數上限的拆分）。
export const zhHantUninstallSection: TranslationOverride<UninstallSectionTranslations> = {
  dangerZone: '危險操作',
  checkingInstalled: '正在檢查已安裝內容…',
  uninstallHermes: '解除安裝 Hermes',
  chooseHowMuch: '選擇要移除的內容。應用程式會關閉以完成作業；隨時重新開啟安裝程式即可返回。',
  confirmUninstall: '確認解除安裝',
  confirmBody: what => `這將移除${what}。此操作無法復原。`,
  appLabel: '應用程式：',
  couldNotStart: '無法開始解除安裝。',
  uninstalling: '正在解除安裝…',
  yesUninstall: '是，解除安裝',
  options: {
    gui: {
      title: '僅解除安裝聊天 GUI',
      description: '移除此桌面應用程式。Hermes 代理、你的設定和聊天記錄都會保留。',
      consequence: '桌面聊天 GUI（此應用程式及其資料）'
    },
    lite: {
      title: '解除安裝 GUI 與代理，保留資料',
      description: '移除應用程式和 Hermes 代理，但保留設定、聊天記錄和機密，以便日後重新安裝。',
      consequence: '聊天 GUI 和 Hermes 代理（設定、聊天記錄和機密會保留）'
    },
    full: {
      title: '解除安裝全部',
      description: '移除應用程式、代理和所有使用者資料——設定、聊天記錄、排程工作、機密和日誌。',
      consequence: '全部內容——聊天 GUI、Hermes 代理，以及你的所有設定、聊天記錄、機密和日誌'
    }
  },
  managedBody: '此安裝由系統管理，Hermes 無法自行移除。',
  dataKept: path => `你的設定、對話與密鑰保存在 ${path}。移除應用程式不會刪除它們。`,
  openAppsSettings: '開啟「應用程式」設定'
}
