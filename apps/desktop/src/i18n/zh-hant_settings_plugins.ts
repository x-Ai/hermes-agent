import type { TranslationOverrides } from './define-locale'

/** 設定 ▸ 外掛（桌面外掛頁、安裝對話框）的文案，從 zh-hant_settings.ts 移出以保持其長度。 */
export const zhHantSettingsPlugins = {
  title: '桌面插件',
  openFolder: '打開插件資料夾',
  rescan: '重新掃描',
  reveal: '在檔案總管中顯示',
  enable: '啟用',
  disable: '停用',
  failed: '失敗了',
  kinds: {
    bundled: '捆綁的',
    disk: '在磁碟上',
    runtime: '運行時'
  },
  installModal: {
    installFromGit: '從 Git 安裝',
    reviewRepository: '檢查儲存庫',
    repoPlaceholder: 'https://github.com/owner/repo',
    title: '安裝插件',
    description: '在安裝任何內容之前查看此儲存庫包含的內容。',
    repoLabel: '儲存庫',
    includesHeading: '該套餐包括',
    agentLabel: '代理商插件',
    desktopLabel: '桌面使用者介面',
    agentTargetLocal: (profile, dir) => `安裝到${profile}後端 (${dir})`,
    agentTargetRemote: profile => `安裝到已連接的設備中${profile}後端`,
    restartToApply: '重啟網關使插件生效。',
    restartNow: '重啟網關',
    toolsConnected: n => `${n} 個工具已連接`,
    skillsReady: names => (names.length === 1 ? `技能 ${names[0]} 已就緒` : `${names.length} 個技能已就緒`),
    nextChat: '下次對話中可使用更多工具',
    serverNotConnected: (server, reason) => `MCP 伺服器 ${server} 未連接${reason ? `：${reason}` : ''}`,
    verified: '已驗證',
    unverified: '未驗證',
    reviewedByNous: '已由 Nous 審核。',
    installsAndEnables: profile => `安裝到 ${profile}，並立即啟用。`,
    installsOnly: profile => `安裝到 ${profile}。`,
    advanced: '進階',
    versionLabel: '版本',
    reviewedPin: sha => (sha ? `已審核的固定提交 ${sha}` : '已審核的固定提交'),
    latestCommit: '最新提交',
    nothingToInstall: '此套件在這裡沒有可安裝的內容。',
    missingEnvAction: '設定一下',
    alreadyInstalled: (name: string) => `${name}已經安裝。`,
    desktopTarget: '安裝到該應用程式的本機桌面插件資料夾中',
    desktopTargetFromPackage: '從上面的套件載入到此應用程式中 - 每個設定檔都相同',
    desktopOnlyNote: '僅桌面版軟體包不安裝後端代理插件。',
    insecureWarning: '此 URL 使用不安全或本地方案。首選 https:// 或 git@ 進行生產安裝。',
    securityIntro: '僅從您信任的來源安裝 - 如果您想查看將添加的內容，請查看下面的儲存庫。',
    sourceHeading: '原始碼',
    viewRepository: '查看儲存庫',
    viewPluginFiles: '查看插件文件',
    enableAgent: '安裝後啟用代理插件',
    forceReinstall: '強制重新安裝（如果已安裝則替換）',
    pinToCommit: '固定以提交（可選）',
    pinToCommitPlaceholder: '完整 40 個字元提交 SHA',
    pinToCommitHint: '每個安裝此 SHA 的人都會獲得相同的代碼；然後插件會拒絕更新，直到重新固定為止。為最新提交留空。',
    pinToCommitInvalid: '必須是完整的 40 個字元提交 SHA（不接受分支和標籤）。',
    install: '安裝',
    installing: '正在安裝...',
    probing: '檢查儲存庫...',
    probeUnavailable: '在此環境中插件檢查不可用。',
    desktopUnavailable: '在此環境中無法安裝桌面插件。',
    selectComponent: '至少選擇一個要安裝的組件。',
    agentSuccess: name => `代理插件${name}已安裝`,
    desktopSuccess: name => `桌面插件${name}已安裝`,
    agentFailed: '代理插件安裝失敗',
    desktopFailed: '桌面插件安裝失敗',
    missingEnv: (name, vars) =>
      `${name} is installed but needs a key before it can work: ${vars}。現在添加它，否則插件的工具將失敗。`,
    profileLabel: '安裝設定檔',
    installUncertain:
      'Hermes 已停止等待安裝結果，但插件可能仍在安裝中。請關閉此對話方塊，並在「插件」中執行「重新掃描」後再嘗試安裝',
    partialInstall: sha =>
      sha
        ? `外掛只安裝了一部分：代理部分已安裝在提交 ${sha}，但由於儲存庫在你審閱後有變更，桌面部分未能隨之安裝。在「進階」中開啟強制重新安裝，可用顯示的版本取代兩部分；或取消，只保留代理部分。`
        : '外掛只安裝了一部分：代理部分已安裝，但由於儲存庫在你審閱後有變更，桌面部分未能隨之安裝。在「進階」中開啟強制重新安裝，可用顯示的版本取代兩部分；或取消，只保留代理部分。',
    installAnyway: '仍要安裝',
    legacyBackendConfirm:
      '此後端比本應用程式舊，無法保證安裝的就是你審閱過的版本：如果儲存庫之後有變更，安裝的會是較新的版本。更新後端即可獲得這項保證。',
    sourceMoved: sha =>
      sha ? `自你審閱後儲存庫已變更。請先審閱新版本（提交 ${sha}）再安裝。` : '自你審閱後儲存庫已變更。正在讀取新版本…'
  }
} satisfies NonNullable<TranslationOverrides['settings']>['plugins']
