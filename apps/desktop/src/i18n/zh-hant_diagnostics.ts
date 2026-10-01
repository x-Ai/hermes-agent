import type { TranslationOverrides } from './define-locale'

export const zhHantDiagnostics = {
  notifications: {
    sharedProfileWarning:
      '另一個 Hermes 安裝實例正在使用此設定檔。兩個實例共用此設定檔的設定和資料，因此變更可能發生衝突。你可以繼續使用，也可以在變更前關閉另一個實例。',
    region: '通知',
    hide: '隱藏',
    show: '顯示',
    more: count => `另外 ${count} 則通知`,
    clearAll: '全部清除',
    dismiss: '關閉通知',
    details: '詳細資訊',
    copyDetail: '複製詳情',
    copyDetailFailed: '無法複製通知詳情',
    backendOutOfDateTitle: '後端版本過舊',
    backendOutOfDateMessage: '您的 Hermes 後端早於目前的桌面版本，可能無法正常運作。請更新以保持一致。',
    desktopOutOfDateTitle: '應用程式版本過舊',
    desktopOutOfDateMessage: '此 Hermes 應用程式早於所連接的後端，可能無法正常運作。請更新應用程式以保持一致。',
    updateDesktopApp: '更新應用程式',
    installMethodUnsupportedTitle: '不受支援的安裝方式',
    updateHermes: '更新 Hermes',
    updateReadyTitle: '有可用更新',
    updateReadyMessage: count => `有 ${count} 項新變更可用。`,
    updateReadyMessageUnknown: '有新更新可用。',
    seeWhatsNew: '查看新增內容',
    toast: {
      artifactPartialLoad: (failed, total) => `跳過${failed}的${total}在索引工件時的近期會議。`,
      artifactSafeLimitExceeded: count => `${count}超過了安全的轉錄負載限制。`,
      artifactUnreadable: count => `${count}無法讀取。`,
      attachmentLimitSaveFailed: '無法儲存最大附件大小',
      localEndpointSaveFailed: '無法儲存本地端點',
      memoryConnectionStartFailed: '啟動連接失敗',
      memoryFieldSaveFailed: label => `儲存失敗${label}`,
      memoryProviderSavedMessage: '更新內存提供者設定 .',
      memoryProviderSavedTitle: label => `${label}已保存`,
      memoryProviderSettingsSaveFailed: label => `儲存失敗${label}設定`,
      modelChangeFailed: '無法變更型態',
      onboardingReadyTitle: 'Hermes已準備好',
      openBrowserWindowFailed: '無法將瀏覽器彈出至新視窗',
      openNewWindowFailed: '無法開啟新視窗',
      openSessionTerminalFailed: '無法在终端中開啟聊天',
      openSessionWindowFailed: '無法在新視窗中開啟聊天',
      petDraftsReadyMessage: '你的寵物看起來完蛋 挑一個孵化.',
      petDraftsReadyTitle: '已備好送稿',
      petGenerationFailedTitle: 'Pet 產生失敗',
      petHatchedMessage: '重新啟動命名並收養它.',
      petHatchedTitle: '你的寵物孵化了',
      petHatchingFailedTitle: '遮蔽失敗',
      petReopenTryAgain: '重新開啟再試一次.',
      pluginLoadFailed: origin => `插件 "${origin}" 未載入`,
      pluginRegisterFailed: name => `外掛程式「${name}」註冊失敗`,
      pluginsFolderOpenFailed: '無法開啟外掛程式資料夾',
      pluginsFolderResolveFailed: '無法解析外掛程式資料夾',
      pluginsFolderUnavailable: '桌面插件不可用',
      pluginsHomeUnavailable: '後端介面未報告主目錄',
      gatewayConnectFailed: '無法連接到 Hermes 閘道',
      processStopFailed: '無法停止此行程',
      providerConnected: provider => `${provider}已連接。`,
      providerSaveFailed: label => `無法儲存${label}`,
      reactionFailed: '無法反應',
      runtimeNotReadyMessage: 'Hermes 桌面版啟動時無法驗證正在執行的後端，在閘道恢復連線前，部分功能可能無法使用',
      runtimeNotReadyTitle: '執行環境尚未就緒',
      toolGatewayEnabledMessage: labels => {
        const list = labels.length === 1 ? labels[0] : `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`

        return `${list} now run through your Nous subscription — no separate API keys needed.`
      },
      toolGatewayEnabledTitle: '工具網關已開啟',
      toolGatewayTools: {
        browser: '瀏覽器自動',
        image_gen: '影像產生',
        tts: '文字對語',
        video_gen: '影像生成',
        web: '網頁搜尋提取( f)'
      },
      unknownError: '未知錯誤',
      view: '查看'
    },
    mcp: {
      needsAuthTitle: 'MCP 伺服器需要重新驗證',
      needsAuthMessage: name => `${name} MCP 需要重新驗證。`,
      errorTitle: 'MCP 伺服器無法連線',
      errorMessage: name => `${name} MCP 健康檢查失敗。`,
      signIn: '登入',
      view: '檢視',
      disable: '停用',
      disabledMessage: name => `${name}MCP 已停用。你可以隨時從「能力」→ MCP 重新啟用它。`,
      disableFailed: name => `無法停用${name}MCP.`
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
          rate_limit: `${label} 在全部 ${attempts} 次嘗試中都回傳了流量限制`,
          overloaded: `${label} 在全部 ${attempts} 次嘗試中都回報過載`,
          server_error: `${label} 在全部 ${attempts} 次嘗試中都回傳了伺服器錯誤`,
          timeout: `${label} 在全部 ${attempts} 次嘗試中都未及時回應`,
          unknown: `${label} 在 ${attempts} 次嘗試後仍未作答`
        }[reason]

        const situation = resetWindow
          ? `其用量限額將在 ${resetWindow} 後重設。屆時請傳送 /retry，或使用 /model 切換模型。`
          : '它似乎暫時無法使用。請稍候一分鐘後傳送 /retry，或使用 /model 切換模型。'

        return `${lead}——${situation}為避免再次發生，可透過 \`hermes fallback add\` 新增備用供應商。`
      },
      providerSaid: summary => `供應商回傳：${summary}`,
      providerInvalidResponse: (label, attempts) =>
        `${label} 連續 ${attempts} 次回傳了空的或損毀的回覆——它可能已過載或正在對你限流。請稍候一分鐘後傳送 /retry，或使用 /model 切換模型。`,
      errorDetailsLine: detail => `詳細資訊：${detail}`,
      elevenLabsNeedsKey: '語音輸入需要一個 ElevenLabs 鍵。在 設定 → 鍵 中添加一個。',
      elevenLabsRejectedKey: 'ElevenLabs 未接受你的 API 金鑰。請在 設定 → 金鑰 中更新，然後再試一次。',
      diskFull: '磁碟已滿 — 請騰出一些空間後再試。',
      fileNotFound: target => (target ? `找不到檔案：${target}` : '找不到檔案'),
      gatewayAuthFailed:
        '此 Hermes 不再接受您已保存的登入。請打開 Gateways 並重新登入（或貼上新的存取權杖），然後再試一次。',
      invalidExternalUrl: '外部連結無效',
      invalidPreviewUrl: '預覽連結無效',
      methodNotAllowed: 'Hermes 的背景服務與應用程式不同步，可能是在更新後發生的。重新啟動它以修復此問題。',
      microphonePermission: '麥克風權限已被拒絕。',
      openaiRejectedApiKey: 'OpenAI 未接受你的 API 金鑰。請在 設定 → 金鑰 中更新，然後再試一次。',
      openaiRejectedApiKeyWithStatus: status => `OpenAI 拒絕了該 API 金鑰 (${status} invalid_api_key)。`,
      openaiTtsNeedsKey: '語音需要一個 OpenAI 鍵。請在設定 → 鍵中新增一個。',
      restoreTargetMissing: '目標訊息已不在會議歷史中 。 刷新會議再試一次 .',
      restoreTargetUnsafe: '此關卡無法安全恢复 。 刷新會議再試一次 .',
      sessionStoppedBeforeAgentReady: '代理程式就緒前工作階段已停止。',
      turnCancelledBeforeAgentReady: '代理程式就緒前，本輪對話已取消。',
      codeSkewRestartRequired: 'Hermes 已更新，但仍在運行舊版本。請重新啟動以完成更新。',
      storageFailure: 'Hermes 無法儲存到它的資料夾中 。 打開維修器以檢查和修理它.',
      rpcOutOfSync: '應用程式和後端介面不同版本. 都更新.',
      restartHermesFailed: '無法重新啟動 Hermes'
    },
    voice: {
      configureSpeechToText: '設定語音轉文字後即可使用語音模式。',
      couldNotStartSession: '無法啟動語音工作階段',
      microphoneAccessDenied: '麥克風存取被拒絕。',
      microphoneConstraintsUnsupported: '此裝置不支援目前的麥克風限制條件。',
      microphoneFailed: '麥克風發生錯誤',
      microphoneInUse: '麥克風正被其他應用程式使用中。',
      microphonePermissionDenied: '麥克風權限被拒絕。',
      microphoneStartFailed: '無法開始麥克風錄音。',
      microphoneUnsupported: '目前執行環境不支援麥克風錄音。',
      noMicrophone: '找不到麥克風。',
      noSpeechDetected: '未偵測到語音',
      playbackFailed: '語音播放失敗',
      recordingFailed: '語音錄製失敗',
      sayStopToEnd: phrase => `說「${phrase}」即可結束語音對話。`,
      transcriptionFailed: '語音轉寫失敗',
      transcriptionUnavailable: '語音轉寫暫不可用。',
      tryRecordingAgain: '請再錄製一次。',
      unavailable: '語音不可用',
      liveEnded: '直播聲音片段結束',
      liveError: '直播',
      liveDelegationFailed: '無法將要求交給 Hermes',
      liveUnavailable: reason => `GPT-Live voice chat is not available: ${reason}。取而代之的是演講對文字.`,
      liveEndedConnectionLost: '直播的聲音片段失去連線 .',
      liveEndedClosed: '直播會議被服務部關閉了.'
    },
    native: {
      approvalTitle: '需要核准',
      approveAction: '核准',
      rejectAction: '拒絕',
      inputTitle: '需要輸入',
      inputBody: 'Hermes 正在等待你的回應。',
      turnDoneTitle: 'Hermes 已完成',
      turnDoneBody: '',
      turnErrorTitle: '本輪失敗',
      backgroundDoneTitle: '背景工作已完成',
      backgroundFailedTitle: '背景工作失敗',
      creditsTitle: '額度',
      approvalTitleNamed: session => `需要批准 —${session}`,
      inputTitleNamed: session => `需要輸入 —${session}`
    },
    gatewayErrorTitle: 'Hermes 錯誤',
    gatewayErrorFallback: 'Hermes 回報了一個錯誤',
    actions: {
      restartHermes: '重新啟動 Hermes',
      openKeys: '開啟金鑰',
      openGateways: '開啟網關',
      openMaintenance: '開啟維持'
    },
    compressDeferredDone: '上下文壓縮已完成',
    updateReadyMessageAppInstaller: 'Hermes 新版本已就緒。立即更新，Windows 會為你完成剩餘步驟'
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
