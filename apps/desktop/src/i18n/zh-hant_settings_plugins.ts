import type { TranslationOverrides } from './define-locale'

/** 設定 ▸ 外掛（桌面外掛頁、安裝對話框）的文案，從 zh-hant_settings.ts 移出以保持其長度。 */
export const zhHantSettingsPlugins = {
  title: '桌面外掛程式',
  openFolder: '開啟桌面外掛程式資料夾',
  rescan: '重新掃描',
  reveal: '在檔案管理員中顯示',
  failed: '失敗',
  kinds: {
    bundled: '內建',
    disk: '磁碟',
    runtime: '執行階段'
  },
  installModal: {
    installFromGit: '從 Git 安裝',
    reviewRepository: '審閱儲存庫',
    repoPlaceholder: 'https://github.com/owner/repo',
    title: '安裝外掛程式',
    description: '安裝任何內容之前，請先審閱此儲存庫包含的內容。',
    repoLabel: '儲存庫',
    includesHeading: '此套件包含',
    agentLabel: '代理外掛程式',
    desktopLabel: '桌面介面',
    agentTargetLocal: (profile, dir) => `安裝到 ${profile} 後端（${dir}）`,
    agentTargetRemote: profile => `安裝到已連線的 ${profile} 後端`,
    restartToApply: '重新啟動閘道後，外掛程式才會生效。',
    restartNow: '重新啟動閘道',
    toolsConnected: n => `${n} 個工具已連線`,
    skillsReady: names => (names.length === 1 ? `技能 ${names[0]} 已就緒` : `${names.length} 個技能已就緒`),
    nextChat: '下次對話時可使用更多工具',
    serverNotConnected: (server, reason) => `MCP 伺服器 ${server} 未連線${reason ? `：${reason}` : '。'}`,
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
    missingEnvAction: '立即設定',
    alreadyInstalled: (name: string) => `${name} 已安裝。`,
    desktopTarget: '安裝到此應用程式在本機的 desktop-plugins 資料夾',
    desktopTargetFromPackage: '從上方的套件載入此應用程式——所有設定檔共用',
    desktopOnlyNote: '只含桌面部分的套件不會安裝後端代理外掛程式。',
    insecureWarning: '此 URL 使用不安全或本機的協定。正式環境的安裝請優先使用 https:// 或 git@。',
    securityIntro: '請只從你信任的來源安裝——如果想知道會新增哪些內容，請查看下方的儲存庫。',
    sourceHeading: '原始碼',
    viewRepository: '查看儲存庫',
    viewPluginFiles: '查看外掛程式檔案',
    enableAgent: '安裝後啟用代理外掛程式',
    forceReinstall: '強制重新安裝（若已安裝則取代）',
    pinToCommit: '固定於提交（選填）',
    pinToCommitPlaceholder: '完整的 40 字元提交 SHA',
    pinToCommitHint:
      '安裝此 SHA 的每個人都會取得相同的程式碼；之後外掛程式會拒絕更新，直到重新固定為止。留空則使用最新提交。',
    pinToCommitInvalid: '必須是完整的 40 字元提交 SHA（不接受分支和標籤）。',
    install: '安裝',
    installing: '正在安裝…',
    probing: '正在檢查儲存庫…',
    probeUnavailable: '此環境無法檢查外掛程式。',
    desktopUnavailable: '此環境無法安裝桌面外掛程式。',
    selectComponent: '請至少選擇一個要安裝的元件。',
    agentSuccess: name => `代理外掛程式 ${name} 已安裝`,
    desktopSuccess: name => `桌面外掛程式 ${name} 已安裝`,
    agentFailed: '代理外掛程式安裝失敗',
    desktopFailed: '桌面外掛程式安裝失敗',
    missingEnv: (name, vars) =>
      `${name} 已安裝，但需要金鑰才能運作：${vars}。請立即新增，否則這個外掛程式的工具將無法使用。`,
    profileLabel: '安裝到設定檔',
    installUncertain:
      'Hermes 已停止等待安裝結果，但外掛程式可能仍在安裝中。請關閉此對話方塊，先在「技能與工具 ▸ 外掛」中按「重新掃描」，再嘗試重新安裝。',
    partialInstall: sha =>
      sha
        ? `這個外掛程式只安裝了一部分：代理部分已安裝（提交 ${sha}），但儲存庫在你審閱後有變更，桌面部分無法隨之安裝。請在「進階」中開啟「強制重新安裝」，以顯示的版本取代兩個部分；或按「取消」，只保留代理部分。`
        : '這個外掛程式只安裝了一部分：代理部分已安裝，但儲存庫在你審閱後有變更，桌面部分無法隨之安裝。請在「進階」中開啟「強制重新安裝」，以顯示的版本取代兩個部分；或按「取消」，只保留代理部分。',
    installAnyway: '仍要安裝',
    legacyBackendConfirm:
      '此後端比本應用程式舊，無法保證安裝的就是你審閱過的版本：如果儲存庫之後有變更，安裝的會是較新的版本。更新後端即可獲得這項保證。',
    sourceMoved: sha =>
      sha ? `自你審閱後儲存庫已變更。請先審閱新版本（提交 ${sha}）再安裝。` : '自你審閱後儲存庫已變更。正在讀取新版本…'
  }
} satisfies NonNullable<TranslationOverrides['settings']>['plugins']
