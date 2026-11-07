import type { TranslationOverrides } from './define-locale'

export const zhHantDiagnostics = {
  notifications: {
    sharedProfileWarning:
      '另一個已安裝的 Hermes 正在使用此設定檔。兩者共用此設定檔的設定和資料，因此變更可能互相衝突。你可以繼續使用，或在進行變更前先關閉另一個 Hermes。',
    region: '通知',
    hide: '隱藏',
    show: '顯示',
    more: count => `另外 ${count} 則通知`,
    clearAll: '全部清除',
    dismiss: '關閉通知',
    details: '詳細資訊',
    copyDetail: '複製詳細資訊',
    copyDetailFailed: '無法複製通知詳細資訊',
    backendOutOfDateTitle: '後端版本過舊',
    backendOutOfDateMessage: '你的 Hermes 後端比此桌面版本舊，可能無法正常運作。請更新讓兩者版本一致。',
    desktopOutOfDateTitle: 'Hermes 應用程式版本過舊',
    desktopOutOfDateMessage: '此 Hermes 應用程式比所連線的後端舊，可能無法正常運作。請更新應用程式，讓兩者版本一致。',
    updateDesktopApp: '更新應用程式',
    installMethodUnsupportedTitle: '不受支援的安裝方式',
    updateHermes: '更新 Hermes',
    updateReadyTitle: '更新已就緒',
    updateReadyMessage: count => `有 ${count} 項新變更可用。`,
    updateReadyMessageUnknown: '有新更新可用。',
    seeWhatsNew: '查看新功能',
    toast: {
      artifactPartialLoad: (failed, total) => `索引成品時，已略過最近 ${total} 個工作階段中的 ${failed} 個。`,
      artifactSafeLimitExceeded: count => `${count} 個工作階段的對話記錄超出安全載入上限。`,
      artifactUnreadable: count => `${count} 個工作階段無法讀取。`,
      attachmentLimitSaveFailed: '無法儲存附件大小上限',
      localEndpointSaveFailed: '無法儲存本機端點',
      memoryConnectionStartFailed: '無法啟動連線',
      memoryFieldSaveFailed: label => `無法儲存 ${label}`,
      memoryProviderSavedMessage: '記憶提供者設定已更新。',
      memoryProviderSavedTitle: label => `${label} 已儲存`,
      memoryProviderSettingsSaveFailed: label => `無法儲存 ${label} 設定`,
      modelChangeFailed: '無法變更模型',
      onboardingReadyTitle: 'Hermes 已準備就緒',
      openBrowserWindowFailed: '無法將瀏覽器彈出至新視窗',
      openNewWindowFailed: '無法開啟新視窗',
      openSessionTerminalFailed: '無法在終端機中開啟聊天',
      openSessionWindowFailed: '無法在新視窗中開啟聊天',
      petDraftsReadyMessage: '你的寵物造型已完成，挑一個來孵化吧。',
      petDraftsReadyTitle: '寵物草圖已就緒',
      petGenerationFailedTitle: '寵物生成失敗',
      petHatchedMessage: '重新開啟即可命名並領養。',
      petHatchedTitle: '你的寵物孵化了',
      petHatchingFailedTitle: '孵化失敗',
      petReopenTryAgain: '請重新開啟後再試一次。',
      pluginLoadFailed: origin => `外掛程式「${origin}」載入失敗`,
      pluginRegisterFailed: name => `外掛程式「${name}」註冊失敗`,
      pluginsFolderOpenFailed: '無法開啟外掛程式資料夾',
      pluginsFolderResolveFailed: '無法確定外掛程式資料夾的位置',
      pluginsFolderUnavailable: '桌面外掛程式無法使用',
      pluginsHomeUnavailable: '後端未回報其主目錄',
      gatewayConnectFailed: '無法連線到 Hermes 閘道',
      processStopFailed: '無法停止此行程',
      providerConnected: provider => `${provider} 已連線。`,
      providerSaveFailed: label => `無法儲存 ${label}`,
      reactionFailed: '無法加上表情回應',
      runtimeNotReadyMessage: 'Hermes 桌面版啟動時無法驗證正在執行的後端。在能連線到閘道之前，部分功能可能無法使用。',
      runtimeNotReadyTitle: '執行環境尚未就緒',
      toolGatewayEnabledMessage: labels => `${labels.join('、')}現已透過你的 Nous 訂閱執行，無需另外的 API 金鑰。`,
      toolGatewayEnabledTitle: '工具閘道已啟用',
      toolGatewayTools: {
        browser: '瀏覽器自動化',
        image_gen: '圖像生成',
        tts: '文字轉語音',
        video_gen: '影片生成',
        web: '網頁搜尋與擷取'
      },
      unknownError: '未知錯誤',
      view: '檢視'
    },
    mcp: {
      needsAuthTitle: 'MCP 伺服器需要重新驗證',
      needsAuthMessage: name => `${name} MCP 需要重新驗證。`,
      errorTitle: 'MCP 伺服器無法連線',
      errorMessage: name => `${name} MCP 健康檢查失敗。`,
      signIn: '登入',
      view: '檢視',
      disable: '停用',
      disabledMessage: name => `${name} MCP 已停用。你可以隨時從「技能與工具 → MCP」重新啟用。`,
      disableFailed: name => `無法停用 ${name} MCP。`
    },
    errors: {
      agentInitUnknownProvider: provider =>
        `代理程式初始化失敗：未知的供應商「${provider}」。請執行「hermes model」查看可用的供應商，或執行「hermes doctor」診斷設定問題。`,
      unknownProvider: provider =>
        `未知的供應商「${provider}」。請執行「hermes model」查看可用的供應商，或執行「hermes doctor」診斷設定問題。`,
      fastModeUnavailable: '此模型不支援快速模式。',
      apiRetriesExhausted: retries => `API 呼叫重試 ${retries} 次後仍失敗`,
      invalidApiResponseAfterRetries: (retries, detail) => `API 回應無效，重試 ${retries} 次後仍失敗：${detail}`,
      resetsIn: remaining => `重設倒數：${remaining}`,
      providerRetriesExhausted: (reason, label, attempts, resetWindow) => {
        const lead = {
          rate_limit: `${label} 在全部 ${attempts} 次嘗試中都回傳了速率限制`,
          overloaded: `${label} 在全部 ${attempts} 次嘗試中都回報過載`,
          server_error: `${label} 在全部 ${attempts} 次嘗試中都回傳了伺服器錯誤`,
          timeout: `${label} 在全部 ${attempts} 次嘗試中都未及時回應`,
          unknown: `${label} 在 ${attempts} 次嘗試後仍未回應`
        }[reason]

        const situation = resetWindow
          ? `其用量限額將在 ${resetWindow} 後重設。屆時請傳送 /retry，或使用 /model 切換模型。`
          : '它似乎暫時無法使用。請稍候一分鐘後傳送 /retry，或使用 /model 切換模型。'

        return `${lead}——${situation}為避免再次發生，可透過 \`hermes fallback add\` 新增備用供應商。`
      },
      providerSaid: summary => `供應商回傳：${summary}`,
      providerInvalidResponse: (label, attempts) =>
        `${label} 連續 ${attempts} 次回傳了空的或損毀的回覆——它可能已過載，或正在對你進行速率限制。請稍候一分鐘後傳送 /retry，或使用 /model 切換模型。`,
      errorDetailsLine: detail => `詳細資訊：${detail}`,
      elevenLabsNeedsKey: '語音輸入需要 ElevenLabs 金鑰。請在「設定 → 工具與金鑰」中新增。',
      elevenLabsRejectedKey: 'ElevenLabs 未接受你的 API 金鑰。請在「設定 → 工具與金鑰」中更新，然後再試一次。',
      diskFull: '磁碟已滿 — 請騰出一些空間後再試。',
      fileNotFound: target => (target ? `找不到檔案：${target}` : '找不到檔案'),
      gatewayAuthFailed:
        '此 Hermes 不再接受你已儲存的登入資訊。請開啟「閘道」並重新登入（或貼上新的存取權杖），然後再試一次。',
      invalidExternalUrl: '外部連結無效',
      invalidPreviewUrl: '預覽連結無效',
      methodNotAllowed: 'Hermes 的背景服務與應用程式不同步，可能是在更新後發生的。重新啟動它以修復此問題。',
      microphonePermission: '麥克風權限已被拒絕。',
      openaiRejectedApiKey: 'OpenAI 未接受你的 API 金鑰。請在「設定 → 工具與金鑰」中更新，然後再試一次。',
      openaiRejectedApiKeyWithStatus: status => `OpenAI 拒絕了該 API 金鑰 (${status} invalid_api_key)。`,
      openaiTtsNeedsKey: '語音功能需要 OpenAI 金鑰。請在「設定 → 工具與金鑰」中新增。',
      restoreTargetMissing: '目標訊息已不在此工作階段的歷史記錄中。請重新整理工作階段後再試一次。',
      restoreTargetUnsafe: '無法安全地還原此檢查點。請重新整理工作階段後再試一次。',
      sessionStoppedBeforeAgentReady: '代理程式就緒前工作階段已停止。',
      turnCancelledBeforeAgentReady: '代理程式就緒前，此回合已取消。',
      codeSkewRestartRequired: 'Hermes 已更新，但仍在執行舊版本。請重新啟動以完成更新。',
      storageFailure: 'Hermes 無法將資料儲存到其資料夾。請開啟「維護」進行檢查與修復。',
      rpcOutOfSync: '應用程式與後端的版本不同。請將兩者都更新。',
      restartHermesFailed: '無法重新啟動 Hermes'
    },
    voice: {
      configureSpeechToText: '設定語音轉文字後即可使用語音模式。',
      couldNotStartSession: '無法啟動語音工作階段',
      microphoneAccessDenied: '麥克風存取被拒絕。',
      microphoneConstraintsUnsupported: '此裝置不支援目前的麥克風限制條件。',
      microphoneFailed: '麥克風發生錯誤',
      microphoneInUse: '麥克風正被其他應用程式使用中。',
      microphoneNeedsHttps: '麥克風需要安全連線。請透過 HTTPS 或到 127.0.0.1 的 SSH 通道開啟 Webapp 後使用。',
      microphonePermissionDenied: '麥克風權限被拒絕。',
      microphoneStartFailed: '無法開始麥克風錄音。',
      microphoneUnsupported: '目前執行環境不支援麥克風錄音。',
      noMicrophone: '找不到麥克風。',
      noSpeechDetected: '未偵測到語音',
      playbackFailed: '語音播放失敗',
      recordingFailed: '語音錄製失敗',
      sayStopToEnd: phrase => `說「${phrase}」即可結束語音對話。`,
      transcriptionFailed: '語音轉寫失敗',
      transcriptionUnavailable: '語音轉寫尚無法使用。',
      tryRecordingAgain: '請再錄製一次。',
      unavailable: '語音無法使用',
      liveEnded: '即時語音工作階段已結束',
      liveError: '即時語音',
      liveDelegationFailed: '無法將要求交給 Hermes',
      liveUnavailable: reason => `GPT-Live 語音聊天無法使用：${reason}。已改用語音轉文字。`,
      liveEndedConnectionLost: '即時語音工作階段的連線已中斷。',
      liveEndedClosed: '服務已關閉即時語音工作階段。'
    },
    native: {
      approvalTitle: '需要核准',
      approveAction: '核准',
      rejectAction: '拒絕',
      inputTitle: '需要輸入',
      inputBody: 'Hermes 正在等待你的回應。',
      turnDoneTitle: 'Hermes 已完成',
      turnDoneBody: '訊息已完成。',
      turnErrorTitle: '回合失敗',
      backgroundDoneTitle: '背景工作已完成',
      backgroundFailedTitle: '背景工作失敗',
      creditsTitle: '額度',
      approvalTitleNamed: session => `需要核准 — ${session}`,
      inputTitleNamed: session => `需要輸入 — ${session}`
    },
    gatewayErrorTitle: 'Hermes 錯誤',
    gatewayErrorFallback: 'Hermes 回報了一個錯誤',
    actions: {
      restartHermes: '重新啟動 Hermes',
      openKeys: '開啟「工具與金鑰」',
      openGateways: '開啟「閘道」',
      openMaintenance: '開啟「維護」'
    },
    compressDeferredDone: '上下文壓縮已完成',
    updateReadyMessageAppInstaller: 'Hermes 新版本已就緒。立即更新，Windows 會為你完成其餘步驟。'
  },
  sendDiagnostics: {
    title: '向 Nous 傳送診斷資訊',
    privacyNotice:
      '這會將偵錯套件上傳到 Nous 內部儲存空間（並非公開貼上板）。內容包括系統資訊（作業系統、版本、服務商、已設定的 API 金鑰種類 — 絕不包含金鑰本身）以及完整的 agent、gateway 與桌面端日誌（每個最多 512 KB，很可能包含對話內容、工具輸出與檔案路徑）。上傳前會先遮罩機密資訊。僅 Nous 員工與獲准的 Discord 版主可檢視，14 天後自動刪除。',
    upload: '上傳',
    uploading: '上傳中…',
    cancel: '取消',
    close: '關閉',
    copyLink: '複製連結',
    uploadIdFallback: id => `未回傳檢視連結 — 請向支援人員提供上傳 ID ${id}`,
    doneTitle: '診斷資訊已傳送',
    doneDescription: '偵錯套件已私密上傳。在您的支援討論串中分享以下連結，團隊即可檢視您的日誌。',
    failedTitle: '上傳失敗',
    failedHint:
      '您也可以在終端機執行 `hermes debug share --nous`，或執行 `hermes debug share --local` 在不上傳的情況下檢視報告。',
    handoffLead: '在以下位置繼續討論:',
    links: {
      github: 'GitHub Issues',
      portal: 'Nous Portal 支援',
      discord: 'Discord'
    }
  },
  errors: {
    genericFailure: '發生錯誤',
    boundaryTitle: '介面出現問題',
    boundaryDesc: '此檢視遇到意外錯誤。您的聊天和設定是安全的。',
    reloadWindow: '重新載入視窗',
    openLogs: '開啟記錄',
    boundaryDetails: '詳細資訊',
    sendDiagnostics: '傳送診斷資料'
  }
} satisfies Pick<TranslationOverrides, 'notifications' | 'sendDiagnostics' | 'errors'>
