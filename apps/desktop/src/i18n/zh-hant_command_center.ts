import type { TranslationOverrides } from './define-locale'

export const zhHantCommandCenter = {
  commandCenter: {
    close: '關閉命令中心',
    paletteTitle: '命令面板',
    back: '返回',
    searchPlaceholder: '搜尋工作階段、檢視和動作',
    goTo: '前往',
    goToSession: '前往工作階段',
    branches: '分支',
    projects: '專案',
    openFolder: '打開資料夾作為項目...',
    openFolderAt: path => `以專案方式開啟資料夾 —${path}`,
    newSessionInProject: project => `新會話於${project}`,
    commands: '命令',
    startInBranch: branch => `在 ${branch} 中開始新對話`,
    commandCenter: '命令中心',
    appearance: '外觀',
    settings: '設定',
    changeTheme: '變更主題',
    changeColorMode: '變更色彩模式…',
    pets: {
      title: '寵物',
      placeholder: '搜尋寵物…',
      loading: '正在載入 petdex 畫廊…',
      error: '無法連線至 petdex 畫廊。',
      staleBackend: '請重新啟動 Hermes 以使用寵物功能。',
      empty: '沒有符合的寵物。',
      turnOff: '關閉',
      turnOn: '開啟',
      installed: '已安裝',
      generatedTag: '生成',
      adoptFailed: '無法領養該寵物。',
      toggleFailed: enabled => `無法${enabled ? '開啟' : '關閉'}寵物顯示。`,
      noneAvailable: '尚無可用寵物——請在下方選擇一個安裝。'
    },
    generatePet: {
      title: '生成寵物',
      placeholder: '描述要生成的寵物……',
      promptHint: '輸入描述，然後按 Enter 生成四種造型。',
      readyHint: '按 Enter 依描述生成四種造型。',
      generate: '生成',
      generating: '生成中……',
      retry: '重試',
      hatch: '孵化',
      spawning: '召喚中……',
      hatching: '正在孵化你的寵物……',
      hatchingSub: '正在注入生命……',
      hatched: '孵化成功！',
      hatchRow: (_state, done, total) => `正在繪製畫面…… ${done}/${total}`,
      hatchComposing: '正在拼合……',
      hatchSaving: '快好了……',
      namePlaceholder: '為寵物命名',
      staleBackend: '請更新 Hermes 以生成寵物。',
      backgroundHint: '你可以關閉此視窗——完成後 Hermes 會通知你。',
      slowProviderHint: '這可能需要幾分鐘',
      remix: '混合生成',
      remixConfirmTitle: '以此造型混合生成？',
      remixConfirmBody: '將以此造型為起點生成一組新草圖，可能需要幾分鐘。',
      genericError: '生成失敗——請重試或選一個建議。',
      referenceImageTooLarge: '參考圖片過大。請使用小於 16 MB 的圖片。',
      referenceImageInvalid: '無法讀取該參考圖片。請嘗試 PNG、JPG、WebP 或 GIF。',
      adopt: '領養',
      startOver: '重新開始',
      hatchingProgress: '孵化進度',
      referenceFallback: '參考圖片',
      removeReference: '移除參考圖片',
      unavailableTitle: '請先新增圖片生成後端',
      unavailableDesc: '孵化自訂寵物需要能使用參考圖片的提供者。',
      setupImageGeneration: '設定圖片生成',
      getKeyFrom: '取得金鑰：',
      addReference: '新增參考圖'
    },
    installTheme: {
      title: '安裝主題…',
      pageTitle: '安裝主題',
      placeholder: '搜尋 VS Code Marketplace...',
      loading: '正在搜尋 Marketplace...',
      error: '無法連接到 Marketplace。',
      installError: '無法安裝該主題。',
      invalidColorTheme: '該主題缺少「colors」設定，因此不是有效的 VS Code 色彩主題。',
      empty: '沒有符合的主題。',
      install: '安裝',
      installing: '安裝中...',
      installed: '已安裝',
      installs: count => `${count} 次安裝`
    },
    settingsFields: '設定欄位',
    mcpServers: 'MCP 伺服器',
    archivedChats: '已封存聊天',
    sections: {
      maintenance: '維護保養',
      sessions: '工作階段',
      system: '系統',
      usage: '使用量'
    },
    nav: {
      newChat: {
        title: '新工作階段',
        detail: '開始新的工作階段'
      },
      settings: {
        title: '設定',
        detail: '設定 Hermes 桌面端'
      },
      messaging: {
        title: '訊息平台',
        detail: '設定 Telegram、Slack、Discord 等'
      },
      artifacts: {
        title: '成品',
        detail: '瀏覽產生的輸出'
      },
      capabilities: {
        title: '技能與工具',
        detail: '啟用技能、工具集和提供方'
      }
    },
    sectionEntries: {
      sessions: {
        title: '工作階段面板',
        detail: '搜尋、釘選和管理工作階段'
      },
      system: {
        title: '系統面板',
        detail: '閘道狀態、記錄、重新啟動/更新'
      },
      usage: {
        title: '使用量面板',
        detail: '詞元、費用和技能活動'
      }
    },
    providerNavigate: '導覽',
    providerSessions: '工作階段',
    refresh: '重新整理',
    refreshing: '重新整理中…',
    noResults: '找不到相符的結果。',
    pinSession: '釘選工作階段',
    unpinSession: '取消釘選',
    exportSession: '匯出工作階段',
    deleteSession: '刪除工作階段',
    noSessions: '暫無工作階段。',
    gatewayRunning: '訊息閘道執行中',
    gatewayStopped: '訊息閘道已停止',
    hermesActiveSessions: (version, count) => `Hermes ${version} · 活躍工作階段 ${count}`,
    restartGateway: '重新啟動閘道',
    openBrowser: '開啟瀏覽器',
    toggleBrowser: '切換瀏覽器',
    gatewayRestartFailed: '閘道重新啟動失敗。',
    updateHermes: '更新 Hermes',
    reloadWindow: '重新載入視窗',
    actionRunning: '執行中',
    actionDone: '完成',
    actionFailed: '失敗',
    actionStartedWaiting: '動作已啟動，等待狀態…',
    loadingStatus: '正在載入狀態…',
    recentLogs: '最近記錄',
    logSearchPlaceholder: '搜尋記錄行…',
    noLogs: '尚未載入記錄。',
    days: count => `${count} 天`,
    statSessions: '工作階段',
    statApiCalls: 'API 呼叫',
    statTokens: '輸入/輸出詞元',
    statCost: '預估費用',
    actualCost: cost => `實際 ${cost}`,
    loadingUsage: '正在載入使用量…',
    noUsage: period => `最近 ${period} 天暫無使用量。`,
    retry: '重試',
    dailyTokens: '每日詞元',
    input: '輸入',
    output: '輸出',
    noDailyActivity: '暫無每日活動。',
    topModels: '常用模型',
    noModelUsage: '暫無模型使用量。',
    topSkills: '常用技能',
    noSkillActivity: '暫無技能活動。',
    actions: count => `${count} 次動作`,
    logFile: '紀錄檔案',
    logLevel: '等級',
    maintenance: {
      runOps: '診斷',
      doctor: '跑醫生',
      doctorDesc: '健康檢查安裝、配置和提供程序',
      securityAudit: '安全審計',
      securityAuditDesc: '掃描配置和技能以查找有風險的設置',
      backup: '建立備份',
      backupDesc: 'Zip 配置、記憶、技能和會話',
      debugShare: '偵錯分享',
      debugShareDesc: '上傳經過編輯的報告 + 日誌，以取得可共享連結（6 小時內自動刪除）',
      debugShareRunning: '正在上傳調試報告...',
      debugShareLinks: '分享連結',
      debugShareFailed: '調試共享失敗',
      copyLink: '複製連結',
      linkCopied: '連結已複製',
      curator: '技能館長',
      curatorDesc: '背景審查，存檔陳舊的代理商創建的技能',
      curatorPaused: '已暫停',
      curatorActive: '活躍',
      curatorDisabled: '已禁用',
      curatorLastRun: when => `上次運行${when}`,
      curatorNeverRan: '從來沒有跑過',
      pause: '暫停',
      resume: '履歷',
      runNow: '立即運行',
      memoryData: '記憶體數據',
      memoryDataDesc: '注入每個會話的內建記憶體文件',
      memoryProvider: name => `活躍提供者：${name}`,
      builtinMemory: '內建的',
      memoryFile: '代理記憶體 (MEMORY.md)',
      userFile: '用戶個人資料（USER.md）',
      bytes: size => size,
      empty: '空的',
      resetMemory: '重置記憶體',
      resetUser: '重置個人資料',
      resetAll: '重置兩者',
      resetConfirm: target => `Delete ${target}？此操作無法撤銷。`,
      resetDone: files => `已刪除${files}.`,
      resetFailed: '記憶體重置失敗',
      actionStarted: name => `${name}已啟動 — 追蹤日誌中...`,
      actionFailed: name => `${name}啟動失敗`,
      running: '運行...',
      viewLog: '行動日誌'
    },
    sharedGatewayRestartTitle: '重新啟動共享閘道？',
    sharedGatewayRestartDescription: bots => `此裝置上的所有機器人都會重新連線：${bots}`,
    sharedGatewayRestartConfirm: '全部重新啟動',
    sharedGatewayRestarted: count => `共享閘道已重新啟動（${count} 個機器人）`
  },
  messaging: {
    search: '搜尋訊息平台…',
    statusFilter: {
      all: '全部',
      bad: '錯誤',
      good: '已連線',
      muted: '未啟用',
      warn: '需要注意'
    },
    loading: '正在載入訊息平台…',
    loadFailed: '訊息平台載入失敗',
    states: {
      connected: '已連線',
      connecting: '連線中',
      disconnected: '已中斷',
      disabled: '已停用',
      fatal: '錯誤',
      gateway_stopped: '訊息閘道已停止',
      not_configured: '需要設定',
      pending_restart: '需要重新啟動',
      retrying: '重試中',
      startup_failed: '啟動失敗'
    },
    unknown: '未知',
    hintPendingRestart: '在狀態列重新啟動閘道以套用此變更。',
    hintGatewayStopped: '在狀態列啟動閘道以建立連線。',
    credentialsSet: '憑證已設定',
    needsSetup: '需要設定',
    gatewayStopped: '訊息閘道已停止',
    getCredentials: '取得您的憑證',
    openSetupGuide: '開啟設定指南',
    required: '必填',
    recommended: '建議',
    advanced: count => `進階 (${count})`,
    noTokenNeeded: '此平台不需要在此填寫 Token。請按照上方設定指南操作，然後在下方啟用。',
    enabled: '已啟用',
    disabled: '已停用',
    unsavedChanges: '有未儲存的變更',
    saving: '儲存中…',
    saveChanges: '儲存變更',
    saved: '已儲存',
    replaceValue: '取代目前值',
    openDocs: '開啟文件',
    clearField: key => `清除 ${key}`,
    addListEntry: '再新增一個',
    removeListEntry: '移除',
    listEntryPlaceholder: '輸入 ID',
    enableAria: name => `啟用 ${name}`,
    disableAria: name => `停用 ${name}`,
    platformEnabled: name => `${name} 已啟用`,
    platformDisabled: name => `${name} 已停用`,
    restartToApply: '此變更將在閘道重新啟動後生效。',
    setupSaved: name => `${name} 設定已儲存`,
    restartToReconnect: '新憑證將在閘道重新啟動後生效。',
    appliedLive: '已套用到執行中的閘道。',
    connectingLive: '執行中的閘道正在使用新憑證連線。',
    keyCleared: key => `${key} 已清除`,
    setupUpdated: name => `${name} 設定已更新。`,
    failedUpdate: name => `更新 ${name} 失敗`,
    failedSave: name => `儲存 ${name} 失敗`,
    failedClear: key => `清除 ${key} 失敗`,
    pendingRequests: count => `待處理的請求（${count})`,
    pendingAria: count => `${count} pending pairing ${count === 1 ? '要求' : '要求'}`,
    approvedUsers: count => `批准的用戶（${count})`,
    approve: '批准',
    approving: '正在批准...',
    revoke: '撤銷',
    revoking: '撤銷...',
    revokeAria: name => `撤銷${name}`,
    revokeTitle: '撤銷存取權限',
    revokeDesc: (name: string) => `${name}將在他們的下一條訊息中失去訪問權限並停止被認可。`,
    approvedUser: name => `${name}批准`,
    approvedHint: '他們在下一則訊息時會被自動識別。',
    revokedUser: name => `${name}撤銷`,
    failedApprove: name => `未能批准${name}`,
    failedRevoke: name => `撤銷失敗${name}`,
    pairingLockedOut: '審批失敗次數太多－該平台已被鎖定。稍後再試。',
    waitingSince: minutes => (minutes < 1 ? '剛才' : `${minutes}米前`),
    restartNeeded: '已儲存。請重新啟動訊息閘道以套用新設定。',
    restartNow: '立即重新啟動',
    restarting: '正在重新啟動…',
    restartFailedManual: '閘道重新啟動失敗 — 請手動重新啟動並檢查閘道日誌。',
    telegramQr: {
      title: '選擇連接 Telegram 機器人的方式',
      subtitle: '兩種方式都會連接由你控制的機器人，憑證僅儲存在此 Hermes 安裝中。',
      quickSetup: '快速設定',
      recommended: '推薦',
      qrCodeAlt: 'Telegram 設定 QR 碼',
      quickHelp: '掃描 QR 碼並在 Telegram 中確認。Hermes 會自動建立機器人並偵測你的 Telegram 使用者 ID。',
      createWithQr: '以 QR 碼建立',
      starting: '正在啟動…',
      replaceWarning: 'Telegram 憑證已設定。儲存後，新的 QR 設定或機器人權杖將取代目前的機器人。',
      scanHint: '用手機上的 Telegram 應用程式掃描，或在這台電腦上開啟連結。',
      waiting: '等待 Telegram 確認…',
      expiresIn: remaining => `${remaining} 後到期`,
      expired: '已到期',
      openTelegram: '開啟 Telegram',
      ready: '機器人已建立',
      allowedUsers: '允許的使用者',
      ownerDetected: '已偵測擁有者',
      addAtLeastOne: '請至少新增一個 Telegram 使用者 ID。',
      userIdPlaceholder: 'Telegram 使用者 ID',
      add: '新增',
      numericOnly: '允許的 Telegram 使用者 ID 必須是數字。',
      saveAndRestart: '儲存並重新啟動',
      applying: '正在儲存…',
      pairingExpired: 'Telegram 配對已到期。請重新開始 QR 設定。',
      stillWaiting: detail => `仍在等待 Telegram。出錯後重試：${detail}`,
      savedRestarting: 'Telegram 已儲存；閘道正在重新啟動…',
      savedRestartFailed: detail => `Telegram 已儲存；閘道重新啟動失敗${detail}`
    },
    fieldCopy: {
      TELEGRAM_BOT_TOKEN: {
        label: 'Bot Token',
        help: '用 @BotFather 建立機器人，然後貼上它給您的 Token。',
        placeholder: '貼上 Telegram bot Token'
      },
      TELEGRAM_ALLOWED_USERS: {
        label: '允許的 Telegram 使用者 ID',
        help: '建議設定。來自 @userinfobot 的數字 ID（每格一個）。不設定則任何人都能私訊您的機器人。'
      },
      TELEGRAM_PROXY: {
        label: '代理 URL',
        help: '僅在 Telegram 被封鎖的網路中需要。'
      },
      DISCORD_BOT_TOKEN: {
        label: 'Bot Token',
        help: '在 Discord 開發者入口網站建立應用程式，新增機器人，然後貼上其 Token。'
      },
      DISCORD_ALLOWED_USERS: {
        label: '允許的 Discord 使用者 ID',
        help: '建議設定。Discord 使用者 ID（每格一個）。'
      },
      DISCORD_REPLY_TO_MODE: {
        label: '回覆方式',
        help: 'first、all 或 off。'
      },
      DISCORD_ALLOW_ALL_USERS: {
        label: '允許所有 Discord 使用者',
        help: '僅供開發使用。為 true 時，任何人都可以私訊機器人，不需要允許清單。'
      },
      DISCORD_HOME_CHANNEL: {
        label: '主頻道 ID',
        help: '機器人主動傳送訊息的頻道（cron 輸出、提醒等）。'
      },
      DISCORD_HOME_CHANNEL_NAME: {
        label: '主頻道名稱',
        help: '記錄和狀態輸出中顯示的主頻道名稱。'
      },
      BLUEBUBBLES_ALLOW_ALL_USERS: {
        label: '允許所有 iMessage 使用者',
        help: '為 true 時略過 BlueBubbles 允許清單。'
      },
      MATTERMOST_ALLOW_ALL_USERS: {
        label: '允許所有 Mattermost 使用者'
      },
      MATTERMOST_HOME_CHANNEL: {
        label: '主頻道'
      },
      QQ_ALLOW_ALL_USERS: {
        label: '允許所有 QQ 使用者',
        help: '允許所有 QQ 使用者繞過允許清單與機器人互動（true/false）'
      },
      QQBOT_HOME_CHANNEL: {
        label: 'QQ 主頻道',
        help: 'cron 傳遞的預設頻道或群組。'
      },
      QQBOT_HOME_CHANNEL_NAME: {
        label: 'QQ 主頻道名稱',
        help: 'QQ 主頻道的顯示名稱'
      },
      SLACK_BOT_TOKEN: {
        label: 'Slack bot Token',
        help: '安裝 Slack 應用程式後，在 OAuth & Permissions 中找到 bot Token。',
        placeholder: '貼上 Slack bot Token'
      },
      SLACK_APP_TOKEN: {
        label: 'Slack app Token',
        help: 'Socket Mode 需要 app 層級 Token。',
        placeholder: '貼上 Slack app Token'
      },
      SLACK_ALLOWED_USERS: {
        label: '允許的 Slack 使用者 ID',
        help: '建議設定。Slack 使用者 ID（每格一個）。'
      },
      MATTERMOST_URL: {
        label: '伺服器 URL',
        help: 'Mattermost 伺服器 URL（例如 https://mm.example.com）',
        placeholder: 'https://mattermost.example.com'
      },
      MATTERMOST_TOKEN: {
        label: 'Bot Token',
        help: 'Mattermost Bot Token 或個人存取 Token'
      },
      MATTERMOST_ALLOWED_USERS: {
        label: '允許的使用者 ID',
        help: '建議設定。Mattermost 使用者 ID（每格一個）。'
      },
      MATRIX_HOMESERVER: {
        label: 'Homeserver URL',
        placeholder: 'https://matrix.org',
        help: 'Matrix homeserver URL（如 https://matrix.org）'
      },
      MATRIX_ACCESS_TOKEN: {
        label: '存取 Token',
        help: 'Matrix 存取 Token（優先於密碼登入）'
      },
      MATRIX_USER_ID: {
        label: 'Bot 使用者 ID',
        placeholder: '@hermes:example.org',
        help: 'Matrix 使用者 ID（如 @hermes:example.org）'
      },
      MATRIX_ALLOWED_USERS: {
        label: '允許的 Matrix 使用者 ID',
        help: '建議設定。@user:server 格式的使用者 ID（每格一個）。'
      },
      SIGNAL_HTTP_URL: {
        label: 'Signal 橋接 URL',
        placeholder: 'http://127.0.0.1:8080',
        help: '執行中的 signal-cli REST 橋接的 URL。'
      },
      SIGNAL_ACCOUNT: {
        label: '電話號碼',
        help: '在 signal-cli 橋接中註冊的號碼。'
      },
      SIGNAL_ALLOWED_USERS: {
        label: '允許的 Signal 使用者',
        help: '建議設定。Signal 識別碼（每格一個）。'
      },
      WHATSAPP_ENABLED: {
        label: '啟用 WhatsApp 橋接',
        help: '由下方切換開關自動設定。除非確知需要，否則請勿變更。'
      },
      WHATSAPP_MODE: {
        label: '橋接模式'
      },
      WHATSAPP_ALLOWED_USERS: {
        label: '允許的 WhatsApp 使用者',
        help: '建議設定。電話號碼或 WhatsApp ID（每格一個）。'
      },
      TELEGRAM_ALLOW_ALL_USERS: {
        label: '允許所有 Telegram 使用者',
        help: '僅供開發使用。任何 Telegram 使用者都能觸發機器人。'
      },
      TELEGRAM_HOME_CHANNEL: { label: '主頻道 ID', help: 'cron / 通知傳遞的預設聊天 ID。' },
      TELEGRAM_HOME_CHANNEL_NAME: { label: '主頻道名稱', help: 'Telegram 主頻道的顯示名稱。' },
      SLACK_ALLOW_ALL_USERS: {
        label: '允許所有 Slack 使用者',
        help: '僅供開發使用。任何 Slack 使用者都能觸發機器人。'
      },
      SLACK_HOME_CHANNEL: { label: '主頻道 ID', help: 'cron / 通知傳遞的預設頻道 ID（以 C 開頭）。' },
      SLACK_HOME_CHANNEL_NAME: { label: '主頻道名稱', help: 'Slack 主頻道的顯示名稱。' },
      SLACK_THREAD_REQUIRE_MENTION: {
        label: '討論串內需要 @提及',
        help: 'Slack 討論串回覆需要明確的 @提及；頂層自由回應頻道不受影響。'
      },
      MATTERMOST_ALLOWED_CHANNELS: {
        label: '允許的頻道 ID',
        help: '設定後機器人只在這些頻道回應（白名單），逗號分隔。'
      },
      MATTERMOST_FREE_RESPONSE_CHANNELS: {
        label: '自由回應頻道 ID',
        help: '機器人無需 @提及即可回應的 Mattermost 頻道 ID，逗號分隔。'
      },
      MATTERMOST_REPLY_MODE: { label: '回覆方式', help: 'thread（巢狀討論串）或 off（平鋪）。預設 off。' },
      MATTERMOST_REQUIRE_MENTION: {
        label: '頻道內需要 @提及',
        help: '在 Mattermost 頻道中需要 @提及（預設 true）。設為 false 可回應所有訊息。'
      },
      MATRIX_ALLOW_ALL_USERS: {
        label: '允許所有 Matrix 使用者',
        help: '僅供開發使用。任何 Matrix 使用者都能觸發機器人。'
      },
      MATRIX_AUTO_THREAD: { label: '房間內自動建立討論串', help: '為 Matrix 房間訊息自動建立討論串（預設 true）。' },
      MATRIX_DEVICE_ID: {
        label: '裝置 ID',
        help: '用於端對端加密的穩定 Matrix 裝置 ID，重啟後保持不變（如 HERMES_BOT）。'
      },
      MATRIX_DM_AUTO_THREAD: { label: '私訊自動建立討論串', help: '為 Matrix 私訊自動建立討論串（預設 false）。' },
      MATRIX_FREE_RESPONSE_ROOMS: {
        label: '自由回應房間 ID',
        help: '機器人無需 @提及即可回應的 Matrix 房間 ID，逗號分隔。'
      },
      MATRIX_HOME_CHANNEL: { label: '主房間 ID', help: 'cron / 通知傳遞的預設房間 ID。' },
      MATRIX_HOME_CHANNEL_NAME: { label: '主房間名稱', help: 'Matrix 主房間的顯示名稱。' },
      MATRIX_PASSWORD: { label: 'Matrix 密碼', help: 'Matrix 帳戶密碼（存取 Token 的替代方式）。' },
      MATRIX_RECOVERY_KEY: {
        label: '復原金鑰',
        help: '裝置金鑰輪換後用於交叉簽署驗證的復原金鑰（Element：設定 → 安全 → 復原金鑰）。'
      },
      MATRIX_REQUIRE_MENTION: {
        label: '房間內需要 @提及',
        help: '在 Matrix 房間中需要 @提及（預設 true）。設為 false 可回應所有訊息。'
      },
      WHATSAPP_DM_POLICY: { label: '私訊策略', help: 'WhatsApp 私訊的授權方式。' },
      WHATSAPP_ALLOW_ALL_USERS: {
        label: '允許所有 WhatsApp 使用者',
        help: '僅供開發使用。任何 WhatsApp 使用者都能觸發機器人。'
      },
      WHATSAPP_HOME_CHANNEL: { label: '主頻道 ID', help: 'cron / 通知傳遞的預設聊天 ID。' },
      WHATSAPP_HOME_CHANNEL_NAME: { label: '主頻道名稱', help: 'WhatsApp 主頻道的顯示名稱。' },
      BLUEBUBBLES_SERVER_URL: {
        label: '伺服器 URL',
        help: '用於 iMessage 整合的 BlueBubbles 伺服器 URL。',
        placeholder: 'http://192.168.1.10:1234'
      },
      BLUEBUBBLES_PASSWORD: {
        label: '伺服器密碼',
        help: 'BlueBubbles 伺服器密碼（BlueBubbles Server → 設定 → API）。'
      },
      BLUEBUBBLES_ALLOWED_USERS: {
        label: '允許的 iMessage 位址',
        help: '建議設定。逗號分隔的 iMessage 位址（電子郵件或電話號碼）。'
      },
      HASS_URL: {
        label: 'Home Assistant URL',
        help: 'Home Assistant 基礎 URL。',
        placeholder: 'http://homeassistant.local:8123'
      },
      HASS_TOKEN: { label: '長期存取權杖', help: 'Home Assistant 長期存取權杖。' },
      EMAIL_ADDRESS: { label: '電子郵件位址', help: '電子郵件帳戶位址。' },
      EMAIL_PASSWORD: { label: '電子郵件密碼', help: '電子郵件帳戶密碼 / 應用程式專用密碼。' },
      EMAIL_IMAP_HOST: { label: 'IMAP 主機', help: '收件輪詢使用的 IMAP 主機。', placeholder: 'imap.gmail.com' },
      EMAIL_SMTP_HOST: { label: 'SMTP 主機', help: '寄件使用的 SMTP 主機。', placeholder: 'smtp.gmail.com' },
      EMAIL_ALLOWED_USERS: {
        label: '允許的電子郵件位址',
        help: '建議設定。允許與機器人對話的電子郵件位址，逗號分隔。'
      },
      EMAIL_HOME_ADDRESS: { label: '主位址', help: 'cron / 通知傳遞的預設電子郵件位址。' },
      EMAIL_SMTP_PORT: { label: 'SMTP 連接埠', help: 'SMTP 連接埠（預設 587）。' },
      TWILIO_ACCOUNT_SID: { label: 'Twilio Account SID', help: '來自 Twilio 控制台的 Account SID。' },
      TWILIO_AUTH_TOKEN: { label: 'Twilio Auth Token', help: '來自 Twilio 控制台的 Auth Token。' },
      TWILIO_PHONE_NUMBER: { label: 'Twilio 電話號碼', help: '可傳送簡訊的 Twilio 號碼（E.164 格式）。' },
      DINGTALK_CLIENT_ID: { label: 'Client ID (App Key)', help: '釘釘應用的 App Key（Client ID）。' },
      DINGTALK_CLIENT_SECRET: { label: 'Client Secret', help: '釘釘應用的 App Secret（Client Secret）。' },
      DINGTALK_ALLOWED_USERS: {
        label: '允許的使用者',
        help: '允許與機器人對話的員工 / 傳送者 ID，逗號分隔（* 表示任何人）。'
      },
      DINGTALK_HOME_CHANNEL: { label: '主對話 ID', help: 'cron / 通知傳遞的預設對話 ID。' },
      DINGTALK_HOME_CHANNEL_NAME: { label: '主對話名稱', help: '釘釘主對話的顯示名稱。' },
      DINGTALK_WEBHOOK_URL: {
        label: '群機器人 Webhook URL',
        help: '用於跨平台 / cron 傳遞的固定群機器人 Webhook URL（選填）。'
      },
      FEISHU_APP_ID: { label: 'App ID', help: '飛書 / Lark 應用的 App ID。' },
      FEISHU_APP_SECRET: { label: 'App Secret', help: '飛書 / Lark 應用的 App Secret。' },
      FEISHU_ENCRYPT_KEY: { label: '加密金鑰 (Encrypt Key)', help: '飛書 / Lark 事件加密金鑰。' },
      FEISHU_VERIFICATION_TOKEN: { label: '驗證權杖 (Verification Token)', help: '飛書 / Lark 事件驗證權杖。' },
      FEISHU_ALLOWED_USERS: { label: '允許的使用者 ID', help: '建議設定。允許與機器人對話的飛書使用者 ID，逗號分隔。' },
      FEISHU_ALLOW_ALL_USERS: { label: '允許所有飛書使用者', help: '僅供開發使用。任何飛書使用者都能觸發機器人。' },
      FEISHU_DOMAIN: { label: '網域 (feishu/lark)', help: 'feishu（中國版）或 lark（國際版）。' },
      FEISHU_HOME_CHANNEL: { label: '主群組 ID', help: 'cron / 通知傳遞的預設群組 ID。' },
      FEISHU_HOME_CHANNEL_NAME: { label: '主群組名稱', help: '飛書主群組的顯示名稱。' },
      WECOM_BOT_ID: { label: '機器人 ID', help: '企業微信智慧機器人的 bot ID。' },
      WECOM_SECRET: { label: '機器人 Secret', help: '企業微信智慧機器人的 secret。' },
      WECOM_CALLBACK_CORP_ID: { label: '企業 ID (Corp ID)', help: '企業微信回呼模式的企業 ID（自建應用）。' },
      WECOM_CALLBACK_CORP_SECRET: { label: '應用 Secret', help: '企業微信回呼模式的應用 Secret。' },
      WECOM_CALLBACK_AGENT_ID: { label: '應用 Agent ID', help: '企業微信回呼模式的應用 Agent ID。' },
      WECOM_CALLBACK_TOKEN: { label: '回呼 Token', help: '企業微信回呼驗證 Token。' },
      WECOM_CALLBACK_ENCODING_AES_KEY: {
        label: 'EncodingAESKey',
        help: '用於訊息加解密的企業微信回呼 EncodingAESKey。'
      },
      WEIXIN_ACCOUNT_ID: {
        label: 'iLink Bot 帳號 ID',
        help: '透過 hermes gateway setup 掃碼登入取得的 iLink Bot 帳號 ID。'
      },
      WEIXIN_TOKEN: { label: 'iLink Bot 權杖', help: '透過 hermes gateway setup 掃碼登入取得的 iLink Bot 權杖。' },
      WEIXIN_BASE_URL: {
        label: 'iLink API 基礎 URL',
        help: '掃碼登入儲存的 iLink API 基礎 URL（預設 https://ilinkai.weixin.qq.com）。'
      },
      QQ_APP_ID: { label: 'App ID', help: '來自 QQ 開放平台 (q.qq.com) 的機器人 App ID。' },
      QQ_CLIENT_SECRET: { label: 'Client Secret', help: '來自 QQ 開放平台的機器人 Client Secret。' },
      QQ_ALLOWED_USERS: { label: '允許的 QQ 使用者', help: '建議設定。允許使用機器人的 QQ 使用者 ID，逗號分隔。' },
      QQ_GROUP_ALLOWED_USERS: { label: '允許的 QQ 群', help: '允許與機器人互動的 QQ 群 ID，逗號分隔。' },
      QQ_SANDBOX: { label: '沙箱模式', help: '啟用 QQ 沙箱模式用於開發測試（true/false）。' },
      API_SERVER_ENABLED: {
        label: '啟用 API 伺服器',
        help: '啟用相容 OpenAI 的 API 伺服器（true/false），供 Open WebUI、LobeChat 等前端連線。'
      },
      API_SERVER_KEY: {
        label: '驗證金鑰',
        help: 'API 伺服器認證用的 Bearer 權杖。啟用 API 伺服器時必填，缺少時伺服器拒絕啟動。'
      },
      API_SERVER_PORT: { label: '連接埠', help: 'API 伺服器連接埠（預設 8642）。' },
      API_SERVER_HOST: {
        label: '監聽位址',
        help: 'API 伺服器的繫結位址（預設 127.0.0.1）。即使只繫結本機回送位址也需要設定驗證金鑰。'
      },
      API_SERVER_MODEL_NAME: {
        label: '模型名稱',
        help: '在 /v1/models 上公佈的模型名。預設為設定檔名（預設設定檔則為 hermes-agent）。適合搭配 OpenWebUI 的多使用者情境。'
      },
      WEBHOOK_ENABLED: { label: '啟用 Webhook', help: '啟用 Webhook 平台配接器，接收來自 GitHub、GitLab 等的事件。' },
      WEBHOOK_PORT: { label: '連接埠', help: 'Webhook HTTP 伺服器連接埠（預設 8644）。' },
      WEBHOOK_SECRET: {
        label: '簽章金鑰',
        help: '用於 Webhook 簽章驗證的全域 HMAC 金鑰（可在 config.yaml 中按路由覆寫）。'
      },
      IRC_SERVER: {
        label: 'IRC 伺服器',
        help: 'IRC 伺服器主機名稱（如 irc.libera.chat）。',
        placeholder: 'irc.libera.chat'
      },
      IRC_CHANNEL: { label: 'IRC 頻道', help: '要加入的 IRC 頻道（如 #hermes）。' },
      IRC_NICKNAME: { label: '機器人暱稱', help: '機器人在 IRC 上的暱稱（預設 hermes-bot）。' },
      IRC_SERVER_PASSWORD: { label: '伺服器密碼', help: 'IRC 伺服器密碼（如需要）。' },
      IRC_NICKSERV_PASSWORD: { label: 'NickServ 密碼', help: '用於暱稱認證的 NickServ 密碼。' },
      IRC_PORT: { label: 'IRC 連接埠', help: 'IRC 伺服器連接埠（預設：TLS 6697，非 TLS 6667）。' },
      IRC_USE_TLS: { label: '使用 TLS', help: 'IRC 連線使用 TLS（1/true/yes 啟用；連接埠 6697 時預設啟用）。' },
      IRC_ALLOWED_USERS: { label: '允許的暱稱', help: '允許與機器人對話的 IRC 暱稱，逗號分隔。' },
      IRC_ALLOW_ALL_USERS: { label: '允許所有使用者', help: '僅供開發使用。允許頻道中任何人與機器人對話。' },
      IRC_HOME_CHANNEL: { label: '主頻道', help: 'cron / 通知傳遞的頻道（預設使用 IRC_CHANNEL）。' },
      GOOGLE_CHAT_SERVICE_ACCOUNT_JSON: {
        label: '服務帳戶 JSON',
        help: '服務帳戶 JSON 金鑰的路徑（或內嵌 JSON）。留空則在 Cloud Run / GCE 上使用應用程式預設憑證（ADC），回退到 GOOGLE_APPLICATION_CREDENTIALS。'
      },
      GOOGLE_CHAT_HTTP_EVENTS_URL: { label: 'HTTP 事件回呼 URL', help: '用於 Chat 訊息事件的已驗證 HTTP 端點。' },
      GOOGLE_CHAT_HTTP_EVENTS_AUDIENCE: {
        label: 'HTTP 事件權杖受眾',
        help: 'Google 簽署 HTTP 事件 Bearer 權杖的預期受眾。預設為 GOOGLE_CHAT_HTTP_EVENTS_URL。'
      },
      GOOGLE_CHAT_HTTP_EVENTS_SERVICE_ACCOUNT_EMAIL: {
        label: 'HTTP 事件服務帳戶信箱',
        help: 'HTTP 事件 Bearer 權杖預期的 Google 服務帳戶信箱。'
      },
      GOOGLE_CHAT_PROJECT_ID: {
        label: 'GCP 專案 ID',
        help: '選用 Pub/Sub 入站模式的 GCP 專案 ID。回退到 GOOGLE_CLOUD_PROJECT。'
      },
      GOOGLE_CHAT_SUBSCRIPTION_NAME: { label: 'Pub/Sub 訂閱名稱', help: '拉取模式入站事件的選用 Pub/Sub 訂閱路徑。' },
      GOOGLE_CHAT_ALLOWED_USERS: { label: '允許的使用者信箱', help: '允許與機器人互動的使用者信箱，逗號分隔。' },
      GOOGLE_CHAT_HOME_CHANNEL: { label: '主空間 ID', help: 'cron / 通知傳遞的預設空間（如 spaces/AAAA...）。' },
      LINE_CHANNEL_ACCESS_TOKEN: {
        label: '頻道存取權杖',
        help: 'LINE 頻道長期存取權杖（LINE Developers 主控台 > Messaging API > Channel access token）。'
      },
      LINE_CHANNEL_SECRET: { label: '頻道密鑰', help: 'LINE 頻道密鑰（用於 HMAC-SHA256 Webhook 簽章驗證）。' },
      LINE_PORT: { label: 'Webhook 連接埠', help: 'Webhook 監聽連接埠（預設 8646）。' },
      LINE_HOST: { label: 'Webhook 主機', help: 'Webhook 繫結主機（預設未設定 → 雙協定棧，所有介面 IPv4+IPv6）。' },
      LINE_PUBLIC_URL: {
        label: '公開 HTTPS 基礎 URL',
        help: '向 LINE 提供圖片/音訊/影片的公開 HTTPS 基礎 URL（如 https://my-tunnel.example.com）。繫結位址無法直接存取時傳送媒體必需。'
      },
      LINE_ALLOWED_USERS: { label: '允許的使用者 ID', help: '允許私訊機器人的 LINE 使用者 ID（U 開頭），逗號分隔。' },
      LINE_ALLOWED_GROUPS: { label: '允許的群組 ID', help: '機器人會回應的 LINE 群組 ID（C 開頭），逗號分隔。' },
      LINE_ALLOWED_ROOMS: { label: '允許的聊天室 ID', help: '機器人會回應的 LINE 聊天室 ID（R 開頭），逗號分隔。' },
      LINE_ALLOW_ALL_USERS: {
        label: '允許所有使用者',
        help: '僅供開發使用。允許任何 LINE 使用者與機器人對話（停用允許清單）。'
      },
      LINE_HOME_CHANNEL: { label: '主頻道 ID', help: 'cron / 通知傳遞的預設使用者/群組/聊天室 ID。' },
      LINE_SLOW_RESPONSE_THRESHOLD: {
        label: '慢回應閾值（秒）',
        help: '觸發慢 LLM postback 按鈕前的秒數（預設 45；設 0 停用並一律使用 Push 回退）。'
      },
      NTFY_TOPIC: { label: '訂閱主題', help: '要訂閱的主題名稱（如 hermes-in）。' },
      NTFY_SERVER_URL: { label: '伺服器 URL', help: 'ntfy 伺服器 URL（預設 https://ntfy.sh）。' },
      NTFY_TOKEN: { label: '驗證權杖', help: 'Bearer 權杖或用於 Basic 驗證的 user:pass（選填）。' },
      NTFY_PUBLISH_TOPIC: { label: '發佈主題', help: '回覆發佈到的主題（預設使用 NTFY_TOPIC）。' },
      NTFY_MARKDOWN: { label: '啟用 Markdown', help: '傳送回覆時帶 X-Markdown: true 標頭（true/false，預設 false）。' },
      NTFY_ALLOWED_USERS: { label: '允許的主題名稱', help: '允許的主題名稱（允許清單），逗號分隔。' },
      NTFY_ALLOW_ALL_USERS: { label: '允許所有主題', help: '僅供開發使用。允許任何主題與機器人對話（停用允許清單）。' },
      NTFY_HOME_CHANNEL: { label: '主主題', help: 'cron / 通知傳遞的預設主題。' },
      NTFY_HOME_CHANNEL_NAME: { label: '主主題名稱', help: '主頻道的顯示名稱（預設使用主題名稱）。' },
      PHOTON_PROJECT_ID: {
        label: 'Spectrum 專案 ID',
        help: 'Spectrum 專案 ID（專案的 spectrumProjectId；由 hermes photon setup 設定）。'
      },
      PHOTON_PROJECT_SECRET: {
        label: '專案密鑰',
        help: '與 Spectrum 專案 ID 配對的專案密鑰（由 hermes photon setup 設定）。'
      },
      PHOTON_SIDECAR_PORT: {
        label: 'Sidecar 控制連接埠',
        help: 'Node sidecar 控制與入站通道的回送連接埠（預設 8789）。'
      },
      PHOTON_SIDECAR_AUTOSTART: {
        label: '自動啟動 Sidecar',
        help: '連線時自動啟動 Node sidecar（true/false，預設 true）。'
      },
      PHOTON_NODE_BIN: { label: 'Node 執行檔路徑', help: 'node 執行檔的路徑（預設取 PATH 中的 node）。' },
      PHOTON_DASHBOARD_HOST: {
        label: 'Dashboard 主機',
        help: 'Photon Dashboard API 主機（預設 https://app.photon.codes）。'
      },
      PHOTON_SPECTRUM_HOST: {
        label: 'Spectrum API 主機',
        help: 'Photon Spectrum API 主機（預設 https://spectrum.photon.codes）。'
      },
      PHOTON_ALLOWED_USERS: { label: '允許的使用者', help: '允許與機器人對話的 E.164 電話號碼，逗號分隔。' },
      PHOTON_ALLOW_ALL_USERS: {
        label: '允許所有使用者',
        help: '僅供開發使用。允許任何傳送者觸發機器人（停用允許清單）。'
      },
      PHOTON_REQUIRE_MENTION: {
        label: '群組聊天需要提及',
        help: '忽略群組聊天訊息，除非命中提及喚醒詞（true/false，預設 false）。'
      },
      PHOTON_MENTION_PATTERNS: {
        label: '群組提及模式',
        help: '群組聊天的提及喚醒詞正規表示式（JSON 清單或逗號/換行分隔；預設使用 Hermes 喚醒詞）。'
      },
      PHOTON_HOME_CHANNEL: {
        label: '主 Photon 目標',
        help: 'cron / 通知傳遞的預設 Photon 目標：Spectrum 空間 ID、DM GUID 或純 E.164 電話號碼。'
      },
      PHOTON_HOME_CHANNEL_NAME: { label: '主頻道名稱', help: '主頻道的顯示名稱。' },
      PHOTON_TELEMETRY: {
        label: '啟用 Spectrum 遙測',
        help: '在 sidecar 中啟用 Spectrum SDK 遙測（true/false，預設 false；可用 hermes photon telemetry on|off 切換）。'
      },
      PHOTON_MARKDOWN: {
        label: '以 Markdown 呈現回覆',
        help: '以 Markdown 傳送回覆——iMessage 原生呈現，其他 Spectrum 平台降級為純文字（true/false，預設 true）。'
      },
      PHOTON_REACTIONS: {
        label: '啟用回應貼圖',
        help: '用 👀/👍/👎 回應訊息表示處理狀態，並把機器人訊息上的回應轉給代理（true/false，預設 false）。'
      },
      SIMPLEX_WS_URL: {
        label: '常駐程式 WebSocket URL',
        help: 'simplex-chat 常駐程式的 WebSocket URL（如 ws://127.0.0.1:5225）。'
      },
      SIMPLEX_ALLOWED_USERS: { label: '允許的聯絡人 ID', help: '允許與機器人對話的 SimpleX 聯絡人 ID，逗號分隔。' },
      SIMPLEX_ALLOW_ALL_USERS: {
        label: '允許所有聯絡人',
        help: '僅供開發使用。允許任何聯絡人與機器人對話（停用允許清單）。'
      },
      SIMPLEX_AUTO_ACCEPT: { label: '自動接受聯絡人請求', help: '自動接受收到的聯絡人請求（預設 true）。' },
      SIMPLEX_GROUP_ALLOWED: {
        label: '允許的群組 ID',
        help: '機器人參與的 SimpleX 群組 ID（逗號分隔），或 * 允許任意群組。省略則完全忽略群組訊息（更安全的預設——否則群組裡機器人會處理每個成員的訊息）。'
      },
      SIMPLEX_HOME_CHANNEL: { label: '主聯絡人/群組 ID', help: 'cron / 通知傳遞的預設聯絡人/群組 ID。' },
      SIMPLEX_HOME_CHANNEL_NAME: { label: '主頻道名稱', help: '主頻道的顯示名稱（預設使用 ID）。' },
      HERMES_SIMPLEX_TEXT_BATCH_DELAY: {
        label: '文字合批延遲（秒）',
        help: '把連續快速到達的入站文字合併為單一訊息事件的靜默期秒數（預設 0.8）——與 Telegram 的文字合批相同。'
      },
      SMS_ALLOWED_USERS: { label: '允許的號碼', help: '允許與機器人對話的電話號碼，逗號分隔。' },
      SMS_HOME_CHANNEL: { label: '主號碼', help: 'cron / 通知傳遞的預設電話號碼。' },
      TEAMS_CLIENT_ID: { label: 'Azure AD 用戶端 ID', help: 'Azure AD 應用程式（Bot Framework）用戶端 ID。' },
      TEAMS_CLIENT_SECRET: { label: 'Azure AD 用戶端密鑰', help: 'Azure AD 應用程式用戶端密鑰。' },
      TEAMS_TENANT_ID: { label: 'Azure AD 租用戶 ID', help: '託管機器人應用程式的 Azure AD 租用戶 ID。' },
      TEAMS_PORT: { label: 'Webhook 連接埠', help: 'Webhook 監聽連接埠（Bot Framework 預設 3978）。' },
      TEAMS_HOST: { label: 'Webhook 主機', help: 'Webhook 繫結主機（預設未設定 → 雙協定棧，所有介面 IPv4+IPv6）。' },
      TEAMS_ALLOWED_USERS: { label: '允許的使用者', help: '允許與機器人對話的 Teams 使用者 ID / UPN，逗號分隔。' },
      TEAMS_ALLOW_ALL_USERS: { label: '允許所有使用者', help: '僅供開發使用。任何 Teams 使用者都能觸發機器人。' },
      TEAMS_REQUIRE_MENTION: {
        label: 'Teams 要求提及',
        help: '僅回覆在頻道或群組聊天中 @提及機器人或回覆機器人的訊息（預設關閉；應用取得 RSC 訊息讀取許可後需要啟用）'
      },
      TEAMS_HOME_CHANNEL: { label: '主頻道', help: 'cron / 通知傳遞的預設聊天/頻道 ID。' },
      TEAMS_HOME_CHANNEL_NAME: { label: '主頻道名稱', help: 'Teams 主頻道的顯示名稱。' },
      WECOM_WEBSOCKET_URL: { label: 'WebSocket URL', help: '企業微信智慧機器人 WebSocket URL。' },
      WECOM_HOME_CHANNEL: { label: '主對話 ID', help: 'cron / 通知傳遞的預設聊天 ID。' },
      WECOM_ALLOWED_USERS: { label: '允許的使用者', help: '允許與機器人對話的企業微信使用者 ID，逗號分隔。' },
      A2A_AGENT_NAME: {
        label: 'A2A 代理名稱',
        help: '在此代理的 Agent Card 上公布的名稱（預設：主機名稱派生）。',
        placeholder: 'A2A 代理名稱'
      },
      A2A_BEARER_TOKEN: {
        label: 'A2A 共用權杖（空則僅限本機）',
        help: '入站 A2A 呼叫的共用權杖（身分回退至呼叫方 IP）。不設任何權杖則僅綁定 127.0.0.1。',
        placeholder: 'A2A 共用權杖（空則僅限本機）'
      },
      A2A_HOST: {
        label: 'A2A 綁定主機（預設 127.0.0.1）',
        help: '入站綁定主機。預設 127.0.0.1；僅在設定了權杖且在此處選擇時才擴展到 0.0.0.0。',
        placeholder: 'A2A 綁定主機（預設 127.0.0.1）'
      },
      A2A_PORT: {
        label: 'A2A 連接埠（預設 9900）',
        help: '入站 A2A 伺服器連接埠（預設 9900）。',
        placeholder: 'A2A 連接埠（預設 9900）'
      },
      A2A_PEER_TOKENS: {
        label: 'A2A 對等權杖（name:token，逗號分隔；或留空）',
        help: '每個對等代理的權杖（如 alice:tok1,bob:tok2）。匹配的名稱用於限速、信任和稽核。',
        placeholder: 'A2A 對等權杖（name:token，逗號分隔；或留空）'
      },
      A2A_HOME_CHANNEL: { label: 'A2A 主頻道（或留空）', help: 'cron / 通知投遞時 deliver=a2a 使用的任務/情境 ID。' },
      A2A_ALLOW_ALL_USERS: {
        label: '允許所有 A2A 對等代理',
        help: '允許任何已驗證的 A2A 對等代理存取此代理（僅限開發）。'
      },
      RAFT_PROFILE: {
        label: 'Raft 代理 profile',
        help: 'Raft 代理 profile slug — 設定後自動啟用轉接器。',
        placeholder: 'Raft 代理 profile'
      },
      BUZZ_RELAY_URL: {
        label: 'Buzz 中繼 URL',
        help: 'Buzz 社群中繼的基礎 URL（如 https://mycommunity.communities.buzz.xyz）。',
        placeholder: 'Buzz 中繼 URL'
      },
      BUZZ_PRIVATE_KEY: {
        label: 'Nostr 私密金鑰（nsec 或 hex）',
        help: '代理 Buzz 身分的 Nostr 私密金鑰（nsec 或 hex）——唯一的 Buzz 密鑰。'
      },
      BUZZ_CLI_PATH: {
        label: 'buzz CLI 路徑（或留空）',
        help: 'buzz CLI 二進位檔路徑（預設：PATH 中的 buzz，然後是 ~/bin/buzz）。'
      },
      BUZZ_CHANNELS: {
        label: '頻道 UUID（逗號分隔）',
        help: '要監聽的頻道 UUID，逗號分隔（預設：所有已加入的頻道）。'
      },
      BUZZ_HOME_CHANNEL: {
        label: '主頻道 UUID（或留空）',
        help: 'cron / 通知投遞的頻道 UUID（預設使用第一個監聽的頻道）。'
      },
      BUZZ_ALLOWED_USERS: { label: '允許的使用者（逗號分隔）', help: '允許與代理對話的 npub 或 hex 公鑰，逗號分隔。' },
      BUZZ_ALLOW_ALL_USERS: {
        label: '允許所有使用者？（true/false）',
        help: '允許任何社群成員與代理對話（true/false）。'
      },
      BUZZ_TRANSPORT: {
        label: '傳輸方式（auto/websocket/poll）',
        help: '入站傳輸方式：auto（WebSocket 帶輪詢回退，預設）、websocket 或 poll。'
      },
      BUZZ_POLL_INTERVAL: { label: '輪詢間隔秒數', help: '入站輪詢掃描間隔秒數（預設 4）。' },
      BUZZ_AUTH_TAG: {
        label: 'NIP-OA auth tag JSON（或留空）',
        help: '用於 NIP-42 WebSocket 認證的可選 NIP-OA 所有者證明 auth tag JSON。'
      },
      BUZZ_CREDENTIALS_FILE: {
        label: '憑證檔案路徑（或留空）',
        help: '保存 nsec 的 JSON 憑證檔案（當 BUZZ_PRIVATE_KEY 未設定時作為回退）。'
      },
      TELEGRAM_WEBHOOK_SECRET: {
        label: 'Webhook 密鑰',
        help: 'Telegram 隨每次 Webhook 更新一同傳送的密鑰權杖（設定了 TELEGRAM_WEBHOOK_URL 時必填）。'
      },
      EMAIL_AUTHSERV_ID: {
        label: '收件 MTA 的 authserv-id',
        help: '郵件伺服器最頂層 Authentication-Results 標頭中的 authserv-id 原文，例如 mx.google.com（除非 EMAIL_TRUST_FROM_HEADER=true，否則必填）。'
      },
      A2A_PUSH_SECRET: {
        label: 'A2A 推送簽章密鑰（或留空）',
        help: '為推送通知簽章的 HMAC 密鑰（預設使用 A2A 共用權杖）。'
      },
      BUZZ_REPLY_IN_THREAD: {
        label: '在討論串中回覆？（true/false）',
        help: '在觸發訊息下方以討論串回覆（true/false，預設 true）；設為 false 時直接發佈到頻道時間軸。'
      },
      PHOTON_READ_RECEIPTS: {
        label: '傳送已讀回條？（true/false）',
        help: '轉發給 Hermes 後，將收到的 iMessage 標記為已讀（true/false，預設 true）。'
      },
      PHOTON_SIDECAR_TOKEN: {
        label: 'Sidecar 權杖',
        help: '回送 sidecar 通道的共用密鑰（預設每次啟動隨機產生）。'
      },
      TEAMS_GRAPH_ACCESS_TOKEN: {
        label: 'Graph 存取權杖（或留空）',
        help: 'graph 模式下傳遞會議摘要所用的 Microsoft Graph 存取權杖。'
      },
      TEAMS_INCOMING_WEBHOOK_URL: {
        label: '傳入 Webhook URL（或留空）',
        help: 'webhook 模式下傳遞會議摘要所用的傳入 Webhook URL（這個 URL 本身就是憑證）。'
      }
    },
    platformIntro: {
      telegram:
        '在 Telegram 中與 @BotFather 對話，執行 /newbot，複製它給您的 Token。然後從 @userinfobot 取得您的數字使用者 ID。',
      discord:
        '開啟 Discord 開發者入口網站，建立應用程式，新增 Bot，然後複製其 Token。用正確的權限範圍把機器人邀請到您的伺服器。',
      slack: '建立 Slack 應用程式，啟用 Socket Mode，安裝到您的工作區，然後複製 bot Token 和 app 層級 Token。',
      mattermost: '在您的 Mattermost 伺服器上建立機器人帳戶或個人存取權杖，然後在此貼上伺服器 URL 和權杖。',
      matrix: '用機器人帳戶登入您的 homeserver，然後複製存取權杖、使用者 ID 和 homeserver URL。',
      signal: '在可存取的位置執行 signal-cli REST 橋接，然後把 Hermes 指向該 URL 和已註冊的電話號碼。',
      whatsapp: '啟動 Hermes 內建的 WhatsApp 橋接，首次執行時掃描 QR code，然後啟用該平台。',
      bluebubbles:
        '在裝有 iMessage 的 Mac 上執行 BlueBubbles Server，公開其 API，然後用伺服器密碼把 Hermes 指向該 URL。',
      homeassistant: '在 Home Assistant 中開啟您的個人資料並建立長期存取權杖。把它連同您的 HA URL 一起貼到這裡。',
      email: '使用專用信箱。對於 Gmail/Workspace，建立應用程式專用密碼並使用 imap.gmail.com / smtp.gmail.com。',
      sms: '從 Twilio 控制台取得您的 Account SID 和 Auth Token，以及一個可傳送簡訊的電話號碼。',
      dingtalk: '在開發者控制台建立釘釘應用，然後在此複製 Client ID (App key) 和 Client Secret。',
      feishu: '建立飛書 / Lark 應用，設定機器人能力，複製 App ID、App secret 和事件加密金鑰。',
      wecom: '在企業微信中新增群機器人，複製其 webhook key 作為 WECOM_BOT_ID。僅可傳送——雙向請用企業微信 (應用) 選項。',
      wecom_callback: '設定一個企業微信自建應用，公開其回呼 URL，並提供 corp ID、secret、agent ID 和 AES key。',
      weixin:
        '執行 `hermes gateway setup`，選擇 Weixin，然後使用個人微信帳號掃描並確認 QR code。Hermes 會透過騰訊 iLink Bot API 連線並儲存憑證。',
      qqbot: '在 QQ 開放平台 (q.qq.com) 註冊一個應用，複製 App ID 和 Client Secret。',
      api_server:
        '把 Hermes 公開為相容 OpenAI 的 API。設定一個驗證金鑰，然後把 Open WebUI / LobeChat 等指向 host:port。',
      webhook: '執行一個 HTTP 伺服器，供其他工具 (GitHub、GitLab、自訂應用) POST。用 secret 驗證簽章。',
      a2a: '無外部依賴（僅標準函式庫）。設定共用 token 或對等 token 以允許其他 Hermes 實例透過 A2A 協定連線。',
      buzz: '需要 buzz CLI 工具 (https://github.com/block/buzz) 在 PATH 或 BUZZ_CLI_PATH 中。透過 Nostr relay 連接到 Buzz 社群。',
      raft: '以外部代理的身分加入 Raft 工作區。'
    },
    sharedListenerUrl: '透過共享閘道監聽器提供，位址為',
    restartFailedManualDetail: '再次嘗試重新啟動；如果仍然失敗，請開啟日誌並發送診斷訊息。',
    restartAgain: '再次重啟',
    openLogs: '打開日誌',
    platformDescription: {
      telegram: '在 Telegram 私訊、群組和話題中使用 Hermes。',
      discord: '把 Hermes 接入 Discord 私訊、頻道和討論串。',
      slack: '透過 Socket Mode 在 Slack 中使用 Hermes。新增允許的 Slack 成員 ID 後已連線的機器人才會回應。',
      mattermost: '把 Hermes 接入 Mattermost 頻道和私訊。',
      matrix: '在 Matrix 房間和私訊中使用 Hermes。',
      signal: '透過 signal-cli REST 橋接連線。',
      whatsapp: '透過內建的 WhatsApp 橋接使用 Hermes，掃碼認證。',
      bluebubbles: '透過 BlueBubbles 伺服器在 iMessage 中使用 Hermes。',
      homeassistant: '透過 Home Assistant 從 Hermes 控制您的智慧家庭。',
      email: '透過 IMAP/SMTP 信箱與 Hermes 對話。',
      sms: '透過 Twilio 收發簡訊。',
      dingtalk: '把 Hermes 接入釘釘群。',
      feishu: '在飛書 / Lark 中使用 Hermes。',
      google_chat: '透過 Cloud Pub/Sub 把 Hermes 接入 Google Chat。',
      wecom: '僅傳送的企業微信群機器人（webhook 方式）。',
      wecom_callback: '透過回呼應用實現企業微信雙向整合。',
      weixin: '透過騰訊 iLink Bot API 連接個人微信帳號。',
      qqbot: '把 Hermes 接入 QQ 開放平台的 QQ 機器人。',
      yuanbao: '把 Hermes 接入騰訊元寶。',
      api_server: '把 Hermes 公開為相容 OpenAI 的 HTTP API，供 Open WebUI 等工具使用。',
      webhook: '接收來自 GitHub、GitLab 等 Webhook 來源的事件。',
      a2a: 'Hermes Agent 的 A2A（Agent-to-Agent）協定 v1.0 支援 —— Linux 基金會開放標準的雙向代理間通訊。\n\n出站（客戶端工具）：a2a_discover、a2a_call、a2a_list、a2a_history 和 a2a_orchestrate 讓代理獲取其他代理的 Agent Card 並透過 JSON-RPC 傳送任務 —— 可與任何 A2A 相容的對等端（Hermes、LangChain、CrewAI、Google ADK、OpenClaw 等）協作。\n\n入站（平台適配器）：將 Hermes 暴露為可被 A2A 發現的代理。Agent Card 在 /.well-known/agent-card.json 提供服務（v1.0 規範路徑；舊版 agent.json 也回應），傳入任務被路由到代理的即時閘道工作階段中，就像任何其他平台一樣 —— 因此回覆的代理與正在與使用者對話的是同一個，擁有完整的記憶體和情境，而不是一次性複製。\n\n安全性預設開啟：未設定權杖則僅繫結 localhost。入站任務文字經過提示注入篩選器；出站文字清除憑證形式的字串；每次交換都經過稽核日誌記錄並持久化到磁碟，在情境壓縮管線之外，因此對話在壓縮和重新啟動後仍然存活。\n\n純標準函式庫傳輸（http.server + urllib）—— 無需 a2a-sdk 依賴。',
      buzz: '透過 Nostr relay 連接到去中心化的 Buzz 社群（需要 buzz CLI）。',
      raft: '以外部代理的身分加入 Raft 工作區，協作完成任務。'
    }
  },
  profiles: {
    close: '關閉設定檔',
    openFailed: profile => `Failed to open profile "${profile}"`,
    switchFailed: profile => `Failed to switch to profile "${profile}"`,
    nameHint: '小寫字母、數字、連字號和底線。必須以字母或數字開頭。',
    title: '設定檔',
    count: count => `${count} 個設定檔`,
    search: '搜尋設定檔…',
    loading: '正在載入設定檔…',
    newProfile: '新增設定檔',
    importProfile: '匯入設定檔…',
    exportProfile: '匯出設定檔…',
    imported: '設定檔已匯入',
    exported: '設定檔已匯出',
    failedImport: '匯入設定檔失敗',
    failedExport: '匯出設定檔失敗',
    allProfiles: '全部設定檔',
    showAllProfiles: '顯示全部設定檔',
    switchToProfile: name => `切換至 ${name}`,
    switchToConnection: name => `切換至 ${name}`,
    switchConnectionFailed: name => `無法連線至 ${name}`,
    manageProfiles: '管理設定檔…',
    connectGateway: '管理網關...',
    fleet: {
      allOnGateway: '該網關上的所有設定文件',
      gateway: gateway => `個人資料在${gateway}`,
      gatewayUnreachable: gateway => `${gateway}· 無法到達`,
      onGateway: (name, gateway) => `${name} · ${gateway}`,
      switchTo: (name, gateway) => `切換到${name}開啟${gateway}`,
      deleteOn: gateway => `開啟${gateway}`,
      localDevice: '此裝置（本機後端——若未安裝 Hermes 則會安裝，否則開啟一個新的工作階段）',
      switchDeviceTitle: '切換到此裝置？',
      switchDeviceDesc: '這會在這台電腦上開啟一個新的工作階段。目前的對話仍留在另一個閘道上。',
      switchDeviceConfirm: '切換',
      installDeviceTitle: '切換到此裝置？',
      installDeviceDesc: '這將在本機安裝 Hermes，然後在這台電腦上開啟一個新的工作階段。確認之前不會開始安裝。',
      installDeviceConfirm: '在本機安裝',
      connectExistingInstead: '改為連線現有環境'
    },
    remoteOverride: {
      menuItem: '連線至遠端主機…',
      badge: (host: string) => `執行於 ${host}`,
      title: (profile: string) => `將 ${profile} 連線至遠端主機`,
      description: '此設定檔中的工作階段將在你指定的遠端 Hermes 上執行，而不是這台電腦。',
      urlLabel: '遠端位址',
      urlPlaceholder: 'https://hermes.example.com',
      urlInvalid: '請輸入以 http:// 或 https:// 開頭的完整位址',
      tokenLabel: '存取權杖',
      tokenPlaceholder: '貼上遠端工作階段權杖',
      tokenSavedHint: '已儲存權杖。留空以保留現有權杖。',
      plainTextOptIn: '這台電腦沒有安全金鑰儲存空間，權杖將以未加密方式儲存到磁碟。仍要儲存。',
      collisionWarning: (label: string) => `設定中已存在名為「${label}」的閘道。此設定檔連線是獨立的，不會變更它。`,
      confirmTitle: '將此設定檔連線至遠端主機？',
      confirmNote: (profile: string, host: string) =>
        `${profile} 中的新對話將在 ${host} 上執行。指令執行與檔案讀取都會發生在那台電腦上，而不是這台。請只連線你信任的主機。`,
      confirmBack: '返回',
      connect: '連線',
      connecting: '連線中…',
      disconnect: '移除遠端連線',
      savedTitle: '設定檔已連線',
      savedMessage: (profile: string, host: string) => `${profile} 現在執行於 ${host}`,
      removedTitle: '已移除遠端連線',
      removedMessage: (profile: string) => `${profile} 現在在這台電腦上執行`,
      removeFailed: '無法移除遠端連線',
      authFailedTitle: '遠端主機拒絕了已儲存的權杖',
      authFailedMessage: (profile: string, host: string) =>
        `${host} 拒絕了為 ${profile} 儲存的權杖。它可能已在遠端被變更。`,
      updateToken: '輸入新權杖…'
    },
    actions: '動作',
    color: '顏色…',
    colorFor: '顏色',
    setColor: color => `設定顏色 ${color}`,
    autoColor: '自動',
    noProfiles: '找不到設定檔。',
    selectPrompt: '選擇一個設定檔以檢視其詳細資訊。',
    refresh: '重新整理設定檔',
    refreshing: '正在重新整理設定檔',
    default: '預設',
    skills: count => `${count} 個技能`,
    env: 'env',
    defaultBadge: '預設',
    rename: '重新命名',
    renameMenu: '重新命名…',
    exportMenu: '匯出…',
    editSoul: '編輯 SOUL.md…',
    copySetup: '複製安裝指令',
    copying: '複製中…',
    modelLabel: '模型',
    skillsLabel: '技能',
    notSet: '未設定',
    soulDesc: '內建於此設定檔的系統提示詞與角色指令。',
    soulMissing: '此設定檔尚無 SOUL.md 檔案。在下方輸入指令並儲存即可建立。config.yaml 中的人格預設需另外管理。',
    soulOptional: '選填',
    soulPlaceholder: mode => `此設定檔的系統提示詞 / 角色說明。\n留空則保留${mode}預設值。`,
    soulPlaceholderCloned: '複製的',
    soulPlaceholderEmpty: '空的',
    unsavedChanges: '有未儲存的變更',
    loadingSoul: '正在載入 SOUL.md…',
    emptySoul: '空的 SOUL.md — 開始撰寫角色設定…',
    saving: '儲存中…',
    saveSoul: '儲存 SOUL.md',
    deleteTitle: '刪除設定檔？',
    deleteDescPrefix: '這將刪除 ',
    deleteDescMid: ' 並移除其 ',
    deleteDescSuffix: ' 目錄。此操作無法復原。',
    deleting: '刪除中…',
    createDesc: '設定檔是獨立的 Hermes 環境：各自擁有獨立的設定、技能和 SOUL.md。',
    nameLabel: '名稱',
    cloneFrom: '複製來源',
    cloneFromNone: '無（空白）',
    cloneFromDesc: '從選取的來源設定檔複製設定、技能和 SOUL.md。',
    cloneFromDefault: '從預設設定檔複製設定',
    cloneFromDefaultDesc: '從您的預設設定檔複製設定、技能和 SOUL.md。',
    invalidName: hint => `設定檔名稱無效。${hint}`,
    nameRequired: '名稱為必填',
    creating: '建立中…',
    createAction: '建立設定檔',
    renameTitle: '重新命名設定檔',
    renameDescPrefix: '重新命名會更新設定檔目錄以及 ',
    renameDescSuffix: ' 中的所有包裝指令碼。',
    displayNameTitle: '命名該代理',
    displayNameDesc: '設定在應用程式中顯示的顯示名稱。內部設定檔 ID 保持「預設」。',
    displayNameLabel: '顯示名稱',
    newNameLabel: '新名稱',
    renaming: '重新命名中…',
    created: '已建立',
    renamed: '已重新命名',
    deleted: '已刪除',
    setupCopied: '安裝指令已複製',
    soulSaved: 'SOUL.md 已儲存',
    failedLoad: '載入設定檔失敗',
    failedDelete: '刪除設定檔失敗',
    failedCopy: '複製安裝指令失敗',
    failedLoadSoul: '載入 SOUL.md 失敗',
    failedSaveSoul: '儲存 SOUL.md 失敗',
    failedCreate: '建立設定檔失敗',
    failedRename: '重新命名設定檔失敗',
    openInNewWindow: '在新視窗中開啟',
    setAsDefault: '設為預設',
    defaultProfile: '預設設定檔',
    defaultSet: name => `${name} 已設為預設`,
    defaultDescription: '用於 Hermes 啟動和新建聊天。現有工作階段仍保留在各自的設定檔中。',
    failedSetDefault: '無法設定預設設定檔',
    status: {
      unread: count => `${count} 個工作階段有未讀訊息`,
      needsInput: count => `${count} 個工作階段等待你的回覆`,
      working: count => `${count} 個工作階段正在執行`
    }
  },
  cron: {
    close: '關閉排程',
    title: '排程工作',
    count: count => `${count} 個工作`,
    search: '搜尋排程工作…',
    loading: '正在載入排程工作…',
    states: {
      enabled: '已啟用',
      scheduled: '已排程',
      running: '執行中',
      paused: '已暫停',
      disabled: '已停用',
      error: '錯誤',
      completed: '已完成'
    },
    deliveryLabels: {
      local: '此桌面',
      telegram: 'Telegram',
      discord: 'Discord',
      slack: 'Slack',
      email: '電子郵件',
      botChat: 'Bot 聊天',
      defaultProfile: '預設'
    },
    scheduleLabels: {
      daily: '每天',
      weekdays: '工作日',
      weekly: '每週',
      monthly: '每月',
      hourly: '每小時',
      'every-15-minutes': '每 15 分鐘',
      custom: '自訂'
    },
    scheduleHints: {
      daily: '每天上午 9:00',
      weekdays: '週一至週五上午 9:00',
      weekly: '每週一上午 9:00',
      monthly: '每月第一天上午 9:00',
      hourly: '每個整點',
      'every-15-minutes': '每 15 分鐘',
      custom: 'Cron 語法或自然語言'
    },
    days: {
      '0': '週日',
      '1': '週一',
      '2': '週二',
      '3': '週三',
      '4': '週四',
      '5': '週五',
      '6': '週六',
      '7': '週日'
    },
    dayFallback: value => `第 ${value} 天`,
    everyDayAt: time => `每天 ${time}`,
    weekdaysAt: time => `工作日 ${time}`,
    everyDayOfWeekAt: (day, time) => `每${day} ${time}`,
    monthlyOnDayAt: (dayOfMonth, time) => `每月 ${dayOfMonth} 日 ${time}`,
    topOfHour: '每個整點',
    everyHourAt: minute => `每小時的 :${minute}`,
    newCron: '新排程工作',
    emptyDescNew: '按 cron 表達式排程一個提示詞。Hermes 會執行它，並將結果傳送至您選擇的目的地。',
    emptyDescSearch: '請嘗試更廣泛的搜尋詞。',
    emptyTitleNew: '暫無排程工作',
    emptyTitleSearch: '無相符項目',
    last: '上次：',
    next: '下次：',
    noRuns: '尚無執行',
    queuedRun: '排隊中的執行',
    manage: '管理',
    showRuns: '顯示執行記錄',
    hideRuns: '隱藏執行記錄',
    runHistory: '執行記錄',
    actionsTitle: '排程工作動作',
    resume: '繼續',
    pause: '暫停',
    resumeTitle: '繼續',
    pauseTitle: '暫停',
    triggerNow: '立即觸發',
    edit: '編輯排程工作',
    deleteTitle: '刪除排程工作？',
    deleteDescPrefix: '這將永久移除 ',
    deleteDescSuffix: '。它會立即停止觸發。',
    deleting: '刪除中…',
    resumed: '排程工作已繼續',
    paused: '排程工作已暫停',
    triggered: '排程工作已觸發',
    deleted: '排程工作已刪除',
    created: '排程工作已建立',
    updated: '排程工作已更新',
    failedLoad: '載入排程工作失敗',
    failedUpdate: '更新排程工作失敗',
    failedTrigger: '觸發排程工作失敗',
    failedDelete: '刪除排程工作失敗',
    failedSave: '儲存排程工作失敗',
    editTitle: '編輯排程工作',
    createTitle: '新排程工作',
    editDesc: '更新排程、提示詞或傳遞目標。變更將在下次執行時生效。',
    createDesc: '排程一個提示詞以自動執行。使用 cron 語法或類似「每 15 分鐘」的自然語言。',
    nameLabel: '名稱',
    namePlaceholder: '例如：每日摘要',
    promptLabel: '提示詞',
    scriptLabel: '指令碼',
    scriptBadge: '指令碼',
    promptPlaceholder: '代理每次執行時應做什麼？',
    frequencyLabel: '頻率',
    deliverLabel: '傳遞至',
    deliverNeedsHomeChannel: '請先設定主頻道',
    modelLabel: '模型',
    modelDefault: '預設（全域模型）',
    customScheduleLabel: '自訂排程',
    customPlaceholder: '0 9 * * * 或 weekdays at 9am',
    customHint: 'Cron 表達式，或類似「每小時」「工作日上午 9 點」的短語。',
    optional: '選填',
    promptRequired: '提示詞為必填項目。',
    promptScheduleRequired: '提示詞和排程為必填項目。',
    scheduleRequired: '排程為必填項目。',
    scriptOnlyEditHint: '僅腳本任務（無 AI 提示詞）。任務 ID：',
    saveChanges: '儲存變更',
    createAction: '建立排程工作',
    tabs: {
      jobs: '工作',
      blueprints: '藍圖'
    },
    blueprints: {
      tab: '藍圖',
      startFrom: '從此開始',
      custom: '自訂',
      subtitle: '現成的自動化',
      dialogDesc: '填寫詳細資訊並進行排程。',
      scheduleIt: '安排工作',
      scheduling: '安排中...',
      scheduled: '藍圖已安排',
      loading: '正在載入藍圖...',
      failedLoad: '載入藍圖失敗',
      emptyTitle: '沒有可用的藍圖',
      emptyDesc: '此後端上沒有可用的自動化藍圖。',
      titles: {
        'Morning briefing': '早間簡報',
        'Important-mail monitor': '重要郵件監控',
        'Weekly review': '每週回顧',
        'Workday start reminder': '工作日開始提醒',
        'Custom reminder': '自訂提醒',
        'Evening wind-down': '晚間整理',
        'Topic news digest': '主題新聞摘要',
        'Bills & renewals reminder': '帳單與續約提醒',
        'Price & availability watch': '價格與庫存監控',
        'Competitor news watch': '競爭對手新聞監控',
        'Habit check-in': '習慣簽到',
        'Hydration & movement nudge': '補水與運動提醒',
        'Weekly meal plan': '每週膳食計畫',
        'Daily learning drip': '每日學習',
        'Gratitude & reflection prompt': '感恩與反思提示',
        'On-this-day discovery': '歷史上的今天'
      },
      descriptions: {
        'Morning briefing': '簡短的每日簡報：今日行事曆、天氣和待辦緊急事項。',
        'Important-mail monitor': '定期檢查收件匣，僅在真正需要注意時提醒。',
        'Weekly review': '每週回顧：已完成的事項、待辦事項和即將到來的事項。',
        'Workday start reminder': '工作日提醒，附帶議程和首要任務。',
        'Custom reminder': '依您的排程自訂的重複提醒。',
        'Evening wind-down': '一日結束檢查：瞭解明日行程和今晚需準備的事項。',
        'Topic news digest': '關於您關心主題的定期摘要——去重後僅顯示真正的新項目。',
        'Bills & renewals reminder': '定期付款、訂閱續約或到期日前的提前警告——避免意外自動扣款。',
        'Price & availability watch': '監控特定商品、航班、飯店或清單，並在價格或庫存狀況符合條件時提醒。',
        'Competitor news watch': '追蹤指定公司的重要新聞——產品發布、定價、融資、申報——附引用摘要。',
        'Habit check-in': '定期提醒以維持習慣並反思完成情況。',
        'Hydration & movement nudge': '全天定期提醒喝水、站立和伸展。',
        'Weekly meal plan': '依您的飲食和烹飪時間量身打造的每週膳食計畫，附合併購物清單。',
        'Daily learning drip': '每天一個小課程，關於您想學習的主題——日積月累。',
        'Gratitude & reflection prompt': '每日或每週的反思提示，記錄感恩和洞察。',
        'On-this-day discovery': '歷史上在今天發生的有趣事件——依您的興趣個人化。'
      },
      labels: {
        'What time?': '什麼時間？',
        'Where to deliver?': '送達何處？',
        'How often?': '多久一次？',
        'Remind me to…': '提醒我…',
        'Which day?': '哪一天？',
        'Repeat on': '重複於',
        'What topic?': '什麼主題？',
        'How many bullets?': '幾個項目符號？',
        "What's due?": '什麼到期？',
        'What exactly to watch?': '確切監控什麼？',
        'Alert me when…': '提醒我當…',
        'Which companies?': '哪些公司？',
        'Which events matter?': '哪些事件重要？',
        'Which habit?': '哪個習慣？',
        'Start hour': '開始時間',
        'End hour': '結束時間',
        'Diet?': '飲食限制？',
        'Meals per day?': '每日幾餐？',
        'Cooking effort?': '烹飪難度？',
        'Only notify me if the mail…': '僅在郵件…時通知我',
        'Learn about…': '學習…',
        'What kind?': '什麼類型？'
      },
      helps: {
        '24h local time, e.g. 08:00': '24小時制，如 08:00',
        'minutes between checks': '檢查間隔（分鐘）',
        'hours between checks — be gentle with rate limits': '檢查間隔（小時）——注意速率限制',
        'hours between nudges': '提醒間隔（小時）',
        'first hour of the active window (24h)': '活躍時段開始小時（24小時制）',
        'last hour of the active window (24h)': '活躍時段結束小時（24小時制）'
      },
      options: {
        everyday: '每天',
        weekdays: '工作日',
        weekends: '週末',
        sunday: '週日',
        monday: '週一',
        tuesday: '週二',
        wednesday: '週三',
        thursday: '週四',
        friday: '週五',
        saturday: '週六',
        'dinner only': '僅晚餐',
        'lunch and dinner': '午餐和晚餐',
        'all three': '三餐',
        quick: '簡單',
        medium: '中等',
        ambitious: '複雜',
        'no restrictions': '無限制',
        vegetarian: '素食',
        vegan: '純素',
        'high-protein': '高蛋白',
        'low-carb': '低碳水',
        'on this day in history': '歷史上的今天',
        'word of the day': '每日單詞',
        'science fact': '科學趣聞',
        'quote of the day': '每日名言',
        auto: '自動',
        websocket: 'websocket',
        poll: '輪詢'
      }
    },
    lastRunFailed: '上次運行失敗：',
    editJob: '編輯職位',
    runAgain: '再次運行',
    overdueSince: '逾期自：',
    modelImpact: {
      title: '排程工作將繼續使用原模型',
      message: count => `${count} 個未固定的排程工作將繼續使用建立時的模型執行。固定它們或設定 cron.model 以遷移。`,
      detailMore: (names, remaining) => `${names}，以及另外 ${remaining} 個`,
      review: '檢查排程工作',
      saveFailed: 'Hermes 未儲存該模型變更。',
      confirmTitle: '模型選擇警告',
      confirmDetail: '僅在你接受此權衡時確認。',
      confirmAction: '確認',
      declined: '已取消模型變更 — 你拒絕了資料訓練層級警告。'
    }
  }
} satisfies Pick<TranslationOverrides, 'commandCenter' | 'messaging' | 'profiles' | 'cron'>
