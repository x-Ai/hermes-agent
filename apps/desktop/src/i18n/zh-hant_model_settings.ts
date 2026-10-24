import type { TranslationOverride } from '@hermes/shared/i18n'

import type { ModelSettingsTranslations } from './types_model_settings'
import { zhHantDelegationRouting } from './zh-hant_delegation_routing'

export const zhHantModelSettings: TranslationOverride<ModelSettingsTranslations> = {
  setupProviderFallback: '提供方',
  setUpProvider: name => `設定 ${name}`,
  staleAuxBefore: (count, names) => `${count} 個輔助任務（${names}）仍由 `,
  staleAuxAfter: ' 執行，而非主要模型。',
  staleAuxOtherProviders: '其他提供方',
  moaEnabled: '啟用',
  moaSetDefault: '設為預設',
  moaNewPresetPlaceholder: '新預設',
  moaAddPreset: '新增預設',
  customModel: '自訂模型…',
  customModelPlaceholder: '模型 ID',
  chooseFromList: '從清單中選擇',
  moaDefault: '預設：',
  moaReferenceToggle: (enabled, index) => `${enabled ? '停用' : '啟用'}參考 ${index}`,
  moaReferenceTitle: index => `參考 ${index}`,
  moaAddReference: '新增參考模型',
  loading: '正在載入模型設定...',
  appliesDesc: '套用至新工作階段。可在輸入框的模型選擇器中臨時切換目前對話。',
  provider: '提供方',
  model: '模型',
  applying: '套用中...',
  mainAppliedTitle: '主模型已更新',
  mainAppliedMessage: model => `新工作階段將使用 ${model}`,
  defaultsLabel: '預設值',
  reasoning: '推理',
  reasoningOff: '關閉',
  speed: '速度',
  speedStandard: '標準',
  defaultsFailed: '無法儲存模型預設值',
  loadFailed: '無法載入模型',
  restartRequired: '更新後此後端仍在執行舊程式碼。請重新啟動以載入新程式碼。',
  restartBackend: '重新啟動後端',
  restartingBackend: '正在重新啟動後端...',
  restartFailed: '無法重新啟動後端',
  auxiliaryTitle: '輔助模型',
  resetAllToMain: '全部重設為主要模型',
  staleAuxDismiss: '不再顯示',
  auxiliaryDesc: '輔助任務預設使用主要模型。您可以為任何任務指定專用模型。',
  setToMain: '設為主要模型',
  change: '變更',
  autoUseMain: '自動 · 使用主要模型',
  inheritMainEffort: '繼承 · 主要模型推理強度',
  inheritsFrom: task => `繼承 ${task}`,
  followTask: task => `跟隨 ${task}`,
  providerDefault: '(提供方預設)',
  fallbackAdd: '新增後備',
  fallbackEmpty: '無後備模型－除非失敗，否則將使用預設模型。',
  notInCatalog: '不在該提供者的型號清單中 — 通話可能會退回到備份。',
  staleAuxPrefix: (count, names) => `${count} 個輔助任務（${names}）仍執行於 `,
  staleAuxSuffix: ' 上，而非你的主要模型。',
  pasteKeyPlaceholder: keyEnv => `貼上 ${keyEnv}`,
  activate: '啟用',
  activating: '啟用中...',
  needsApiKeyHint: name => `${name} 需要 API 金鑰 — 完成設定後才能選擇模型。`,
  oauthHint: name => `${name} 透過瀏覽器登入 — Hermes 會為你完成整個流程。`,
  moa: {
    title: '混合智慧體 (MOA)',
    shortTitle: 'MoA',
    presetsTitle: 'MoA 預設組',
    description: '設定以模型形式出現在「混合智慧體」提供方下的命名預設組。聚合模型是實際應答的模型。',
    presetPlaceholder: '預設組',
    enabled: '啟用',
    setDefault: '設為預設',
    deletePreset: '刪除',
    newPresetPlaceholder: '新預設組名稱',
    addPreset: '新增預設組',
    defaultLabel: '預設：',
    referenceTitle: index => `參考模型 ${index}`,
    toggleReference: (index, enabled) => `${enabled ? '停用' : '啟用'}參考模型 ${index}`,
    removeReference: '移除',
    addReference: '新增參考模型',
    aggregatorTitle: '聚合模型'
  },
  tasks: {
    vision: {
      label: '視覺',
      hint: '圖片分析'
    },
    compression: {
      label: '壓縮',
      hint: '上下文壓縮'
    },
    skills_hub: {
      label: '技能中心',
      hint: '技能搜尋'
    },
    approval: {
      label: '核准',
      hint: '智慧自動核准'
    },
    mcp: {
      label: 'MCP',
      hint: 'MCP 工具路由'
    },
    title_generation: {
      label: '標題生成',
      hint: '工作階段標題'
    },
    review: { label: '評審', hint: '/review 評審子代理' },
    voice_chat: { label: '語音聊天', hint: '語音模式回覆' },
    curator: {
      label: '策展器',
      hint: '技能使用審查'
    },
    triage_specifier: { label: '分診規格', hint: '看板規格細化' },
    kanban_decomposer: {
      label: '看板分解器',
      hint: '任務分解'
    },
    profile_describer: {
      label: '個人檔案描述器',
      hint: '自動個人資料描述'
    }
  },
  moaTitle: '混合劑',
  moaPreset: '預設',
  moaDescription:
    '配置命名預設，這些預設將作為模型出現在多代理提供者下。聚合器是運行模型——它在工具循環的每一步運行，且幾乎所有運行成本都記入其提供者。參考資料默認情況下每個用戶回合僅提供一次建議。',
  moaAggregator: '聚合器',
  moaAggregatorBilled: '表演模特 · 按場次計費',
  moaReferenceHint: '默認情況下，每回合建議一次',
  subagents: {
    inherit: '繼承主代理設定',
    modelOnly: '自訂模型（沿用主代理憑證）',
    providerLabel: '子代理提供方',
    modelLabel: '子代理模型',
    direct: '直接端點覆寫',
    customProvider: '自訂提供方...',
    customProviderLabel: '自訂子代理提供方',
    customEndpoints: '自訂端點',
    customEndpointsHidden: '開啟"子代理建議自訂端點"後，這裡會列出你的自訂端點。',
    parentModel: '使用主代理模型',
    parentModelWarning:
      '所選提供方必須支援主代理模型。模型不相容時，僅指定提供方的路由可能失敗。若該提供方設定了自己的預設模型，子代理會改用該模型。',
    directActive: '直接端點已啟用，優先於已儲存的提供方。選擇此模式時會保留其端點與憑證。',
    directClear: '套用此路由會清除直接端點及其儲存的金鑰。其他請求設定維持不變。',
    catalogFailed: '模型目錄無法使用。請手動輸入提供方與模型，或重試。',
    draftHint: '套用前，變更只保留在本機。',
    routing: zhHantDelegationRouting
  }
}
