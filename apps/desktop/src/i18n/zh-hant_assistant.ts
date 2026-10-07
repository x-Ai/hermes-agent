import type { TranslationOverrides } from './define-locale'

export const zhHantAssistant = {
  assistant: {
    media: {
      gatewayFetchFailed: name => `無法從閘道取得 ${name}（檔案可能不存在、無法讀取或過大）。`,
      openMediaFile: kind => `開啟${kind === 'audio' ? '音訊' : '影片'}檔案`,
      openNamed: name => `開啟 ${name}`,
      loadingNamed: name => `正在載入 ${name}…`,
      couldNotLoad: name => `無法載入 ${name}。`,
      openImage: '開啟圖片',
      imageFallbackName: '圖片'
    },
    embeds: {
      load: label => `載入 ${label}`,
      alwaysAllow: label => `一律允許 ${label}`,
      holdToZoom: '按住 Ctrl/⌘ 進行縮放',
      failedToLoad: label => `無法載入 ${label} 嵌入內容`,
      openDiagram: '開啟圖表',
      embedTitle: label => `${label} 嵌入內容`
    },
    catalogInstall: {
      preparing: '正在準備安裝…',
      install: '安裝',
      advanced: '進階',
      skip: '略過',
      installing: '正在安裝…',
      installed: '已安裝',
      notInstalled: '未安裝',
      failed: '失敗',
      showNames: '顯示名稱',
      hideNames: '隱藏名稱',
      skill: name => `技能 ${name}`,
      kind: { plugin: '外掛程式', skill: '技能' },
      tier: { official: '官方', community: '社群' },
      targetProfile: profile => `將安裝到你的 ${profile} 設定檔`,
      sendFailed: '無法傳送你的回覆，請重試',
      commitLabel: '提交',
      subdirLabel: '資料夾',
      securityHeading: '安全性',
      scan: { passed: '掃描通過', warnings: '掃描發現警告', failed: '掃描失敗' },
      requirementsLabel: '需求',
      credentialsHeading: '憑證',
      requiresHermes: range => `Hermes ${range}`,
      envVar: name => `${name} 環境變數`,
      serverNotConnected: (server, reason) => `MCP 伺服器 ${server} 未連線${reason ? `：${reason}` : ''}`,
      notEnabled: '已安裝但未啟用',
      missingEnv: names => `設定 ${names} 以完成設定`,
      alreadyInstalled: '已安裝，維持原狀',
      phase: { downloading: '正在下載…', python_packages: '正在安裝 Python 套件…', loading_tools: '正在載入其工具…' }
    },
    thread: {
      loadingSession: '正在載入工作階段',
      openSessionFailed: '無法開啟此工作階段',
      showEarlier: '顯示較早的訊息',
      loadingResponse: 'Hermes 正在載入回覆',
      steered: '已引導',
      asyncDelegationFailure: detail => `（失敗：${detail}）`,
      asyncDelegationPartialOutput: '部分輸出：',
      messagingAgent: name => `正在向 ${name} 傳送訊息…`,
      messagedAgent: name => `已向 ${name} 傳送訊息`,
      messageFrom: name => `來自 ${name} 的訊息`,
      showMessage: '檢視訊息',
      repliedTo: name => `已回覆 ${name}`,
      showReply: '檢視回覆',
      processOutput: '輸出',
      emojiSearch: '搜尋…',
      emojiLoading: '正在載入表情符號…',
      emojiEmpty: '找不到表情符號。',
      moreEmoji: '更多表情符號',
      removeReaction: emoji => `移除 ${emoji} 回應`,
      reactedByHermes: 'Hermes 的回應',
      conversationTimeline: '對話時間軸',
      reviewSummary: {
        label: '自我改進回顧',
        memoryUpdated: '記憶已更新',
        memoryCreated: '記憶項目已建立',
        userProfileUpdated: '使用者資料已更新',
        skillCreated: '技能已建立',
        skillNamedCreated: (name, detail) => `技能「${name}」已建立${detail ? `：${detail}` : ''}`,
        skillNamedPatched: (name, detail) => `技能「${name}」已修補${detail ? `：${detail}` : ''}`,
        skillNamedRewritten: (name, detail) => `技能「${name}」已重寫${detail ? `：${detail}` : ''}`,
        memoryLabel: '記憶',
        userProfileLabel: '使用者資料'
      },
      operationInterrupted: '操作已中斷。',
      operationInterruptedDuringRetry: (reason, attempt, maxAttempts) =>
        `操作已中斷：重試過程中（${reason}，第 ${attempt}/${maxAttempts} 次嘗試）。`,
      operationInterruptedHandlingApiError: (errorType, detail) =>
        `操作已中斷：正在處理 API 錯誤（${errorType}：${detail}）。`,
      operationInterruptedRetryingApiCall: (retry, maxRetries) =>
        `操作已中斷：API 呼叫出錯後正在重試（第 ${retry}/${maxRetries} 次）。`,
      operationInterruptedRetryingEmptyResponse: (retry, maxRetries) =>
        `操作已中斷：正在重試模型的空回應（第 ${retry}/${maxRetries} 次）。`,
      operationInterruptedRetryReasons: {
        fastResponseLikelyRateLimited: durationSeconds => `回應較快（${durationSeconds} 秒）——可能受到限流`,
        rateLimited: '上游供應商限流（429）',
        responseTime: durationSeconds => `回應耗時 ${durationSeconds} 秒`,
        slowResponseLikelyUpstreamTimeout: durationSeconds => `回應較慢（${durationSeconds} 秒）——可能是上游逾時`,
        upstreamError: (code, durationSeconds) => `上游錯誤（代碼 ${code}，${durationSeconds} 秒）`,
        upstreamGatewayTimedOut: durationSeconds => `上游閘道逾時（504，${durationSeconds} 秒）`,
        upstreamProviderOverloaded: code => `上游供應商過載（${code}）`,
        upstreamProviderTimedOut: durationSeconds => `上游供應商逾時（Cloudflare 524，${durationSeconds} 秒）`,
        upstreamServerError: (code, durationSeconds) => `上游伺服器錯誤（${code}，${durationSeconds} 秒）`
      },
      operationInterruptedWaitingForModel: elapsedSeconds =>
        `操作已中斷：正在等待模型回應（已等待 ${elapsedSeconds} 秒）。`,
      modelContinuing: (attempt, maxAttempts) =>
        `模型僅傳回了思考內容，未提供最終回答，正在請求繼續（第 ${attempt}/${maxAttempts} 次）`,
      providerReconnecting: (elapsedSeconds, kind) =>
        `供應商持續 ${elapsedSeconds} 秒未傳回${kind === 'output' ? '輸出' : '回應'}，正在重新連線…`,
      providerRetrying: (retrySeconds, attempt, maxAttempts) =>
        `正在等待供應商，${retrySeconds} 秒後重試（第 ${attempt}/${maxAttempts} 次）`,
      providerWaitPhases: {
        first_event: seconds => `等待首個供應商事件已 ${seconds} 秒`,
        reconnect: seconds => `重新連線後等待首個供應商事件已 ${seconds} 秒`,
        pre_progress: seconds => `供應商串流已開啟，${seconds} 秒內沒有實質的模型進展`,
        post_event: seconds => `供應商串流運作中，${seconds} 秒內沒有串流事件`,
        first_chunk: seconds => `等待首個串流資料區塊已 ${seconds} 秒`,
        post_chunk: seconds => `串流已開啟，${seconds} 秒內沒有串流輸出`
      },
      providerWaitNotice: (model, phaseText, watchdog, stillWaiting) =>
        `${stillWaiting ? '仍在等待' : '正在等待'} ${model}——${phaseText}${
          watchdog ? `（自動重新連線：${watchdog.label} 看門狗將在 ${watchdog.seconds} 秒後觸發）` : ''
        }`,
      summarizingThread: '正在整理對話',
      moaAggregating: 'MoA 正在彙整…',
      moaReference: (label, index, count) =>
        `參考模型${index && count ? ` ${index}/${count}` : ''}${label ? ` — ${label}` : ''}`,
      moaReferencesProgress: (done, total, label) => `MoA 參考進度 ${done}/${total}${label ? ` — ${label}` : ''}`,
      loadingLocalModel: model => `加載中${model}進入記憶`,
      processingPrompt: '處理提示',
      resumeWhenBackgroundDone: count =>
        count === 1 ? '背景工作完成後將自動繼續' : `${count} 個背景工作完成後將自動繼續`,
      thinking: '思考中',
      thought: '已思考',
      thoughtBriefly: '思考了片刻',
      thoughtFor: duration => `思考了 ${duration}`,
      turnDuration: duration => `本輪耗時 ${duration}`,
      today: time => `今天，${time}`,
      yesterday: time => `昨天，${time}`,
      copy: '複製',
      refresh: '重新整理',
      moreActions: '更多動作',
      branchNewChat: '在新聊天中分支',
      react: '回應',
      dismissError: '關閉錯誤',
      responseStopped: '回應已停止',
      errorGenericProvider: 'AI 服務',
      errorLayerBodies: {
        auth: 'AI 服務拒絕了登入憑證。請檢查此供應商的憑證，然後重新傳送訊息。',
        billing: '此供應商帳戶的額度已用盡。請儲值或切換供應商，然後重新傳送。',
        disk: '磁碟空間已滿，Hermes 無法儲存此對話。請釋放空間後重試。',
        generic: 'Hermes 回覆時發生問題。請重試；若問題持續，請複製錯誤詳細資訊。',
        provider: 'AI 服務無法完成此請求。請稍後重試或切換服務商。',
        endpoint: 'Hermes 無法連線至你的自訂模型伺服器。請確認它正在執行，然後重新傳送訊息。',
        gateway: 'Hermes 在開始回覆時遇到內部問題。請重新傳送訊息；若問題持續，請傳送診斷資訊。',
        runtime: 'Hermes 在開始回覆時遇到內部問題。請重新傳送訊息；若問題持續，請傳送診斷資訊。',
        streaming: '回覆完成前連線已中斷。請重試以重新傳送。'
      },
      errorCodes: {
        auth: {
          title: provider => `${provider} 拒絕了登入`,
          body: provider => `為 ${provider} 儲存的憑證未被接受。請在設定中修正憑證或切換供應商，然後重新傳送訊息。`
        },
        auth_permanent: {
          title: provider => `${provider} 拒絕了登入`,
          body: provider => `為 ${provider} 儲存的憑證無效或已被撤銷。請更新憑證或切換供應商，然後重新傳送訊息。`
        },
        billing: {
          title: '額度不足',
          body: provider => `${provider} 帳戶的額度已用盡。請儲值或切換供應商，然後重新傳送。`
        },
        provider_policy_blocked: {
          title: '帳戶設定封鎖了此模型',
          body: provider => `${provider} 無法依你帳戶的資料或隱私設定路由此請求。請選擇其他模型或切換服務商。`
        },
        content_policy_blocked: {
          title: 'AI 服務拒絕回答此請求',
          body: provider => `${provider} 拒絕回答這則訊息。請修改後重新傳送。`
        },
        format_error: {
          title: 'AI 服務拒絕了請求格式',
          body: provider => `${provider} 不接受此請求的建構方式。請切換服務商，或傳送診斷資訊以便我們排查。`
        },
        invalid_response: {
          title: 'AI 服務傳回了無法讀取的回覆',
          body: provider => `${provider} 傳回了 Hermes 無法讀取的內容。請稍後重試。`
        },
        empty_response: {
          title: 'AI 服務傳回了空回覆',
          body: provider => `${provider} 沒有為此訊息傳回內容。請稍後重試。`
        },
        rate_limit: {
          title: 'AI 服務忙碌中',
          body: provider => `${provider} 正在限制請求數量。請稍等片刻後重試。`
        },
        upstream_rate_limit: {
          title: 'AI 服務忙碌中',
          body: provider => `${provider} 正在限制請求數量。請稍等片刻後重試。`
        },
        overloaded: {
          title: 'AI 服務負載過高',
          body: provider => `${provider} 目前遇到問題。請稍後重試或切換服務商。`
        },
        server_error: {
          title: 'AI 服務發生錯誤',
          body: provider => `${provider} 傳回了伺服器錯誤。請稍後重試或切換服務商。`
        },
        timeout: {
          title: '無法連線到 AI 服務',
          body: provider => `無法連線到 ${provider}，或其未及時回應。請檢查網路連線後重試。`
        },
        stream_drop: {
          title: '回覆被中斷',
          body: '連線在回覆完成前已中斷。請重試以重新傳送。'
        },
        no_reply: {
          title: '回覆未完成',
          body: 'Hermes 在沒有回覆的情況下結束了這一輪，請重試以再次傳送'
        },
        upstream_blocked: {
          title: '請求被防火牆攔截',
          body: provider =>
            `${provider} 前方的防火牆或 CDN 在請求到達模型前將其攔截；你的金鑰可能沒有問題。請在設定中透過供應商的 extra_headers 設定 User-Agent，或切換供應商後重試。`
        },
        ssl_cert_verification: {
          title: '安全連線失敗',
          body: provider => `Hermes 無法驗證與 ${provider} 的安全連線。請檢查網路或代理設定，或切換服務商後重新傳送。`
        },
        context_overflow: {
          title: '此對話過長',
          body: '對話內容已超出模型上下文。請壓縮對話或建立新對話，然後重新傳送。'
        },
        payload_too_large: {
          title: '此訊息過大',
          body: '請求內容超出模型限制。請壓縮對話或建立新對話，然後重新傳送。'
        },
        model_not_found: {
          title: '此模型不可用',
          body: provider => `${provider} 未向你的帳戶提供此模型。請選擇其他模型，然後重新傳送。`
        },
        truncated: {
          title: '回覆未完整產生',
          body: '模型在完成回覆前停止了。請重試以取得完整回覆。'
        },
        loop_error: {
          title: 'Hermes 陷入循環',
          body: '回覆持續重複相同步驟，因此 Hermes 已停止執行。請重試；若再次發生，可建立新對話。'
        },
        SESSION_NOT_OWNED: {
          title: '此對話已在其他位置開啟',
          body: '此對話目前正在另一個 Hermes 視窗或終端機中開啟。請先在那裡關閉，然後重新傳送；也可以在此建立新對話。'
        },
        disk_full: {
          title: '磁碟已滿',
          body: '磁碟空間已滿，Hermes 無法儲存此對話。請釋放空間後重試。'
        },
        free_tier_disabled: {
          title: '未登入的免費服務目前已關閉',
          body: '登入免費的 Nous 帳戶即可繼續對話。'
        },
        free_tier_rate_limited: {
          title: '未登入聊天額度已用盡',
          body: '額度很快會恢復。登入免費的 Nous 帳戶可獲得更高額度。'
        },
        free_tier_at_capacity: {
          title: '未登入聊天目前忙碌',
          body: '登入免費帳戶可略過佇列，也可以稍後重試。'
        },
        free_tier_model_not_free: {
          title: '未登入時無法使用此模型',
          body: 'Hermes 目前使用免費模型。登入免費的 Nous 帳戶可使用更多模型。'
        },
        free_tier_route: {
          title: 'Hermes 無法存取此路由上的免費模型',
          body: '請登入免費的 Nous 帳戶，或檢查 NOUS_INFERENCE_BASE_URL 設定。'
        },
        free_tier_outage: {
          title: '免費模型暫時無法回應',
          body: '請稍後重新傳送訊息。'
        },
        free_tier_refused: {
          title: '未登入時無法傳送此訊息',
          body: '請登入免費的 Nous 帳戶後繼續。'
        }
      },
      errorLayers: {
        auth: '認證錯誤',
        billing: '額度不足',
        disk: '磁碟已滿',
        endpoint: '自訂端點錯誤',
        gateway: '閘道錯誤',
        generic: '本輪失敗',
        provider: '模型服務商錯誤',
        runtime: '本機執行環境錯誤',
        streaming: '串流連線錯誤'
      },
      errorRetry: '重試',
      errorStartNewSession: '開始新工作階段',
      errorSwitchProvider: '切換服務商',
      errorSignInAgain: provider => `重新登入 ${provider}`,
      errorOauthExpired: provider => `您的 ${provider} 登入已過期或被撤銷。請重新登入以繼續對話。`,
      errorOpenLogs: '開啟日誌',
      errorOpenLogsFailed: '無法開啟日誌資料夾',
      errorOpenDesktopLogs: '開啟桌面端日誌',
      errorCopyDiagnostics: '複製錯誤詳細資訊',
      errorSendDiagnostics: '傳送診斷資訊',
      filesChanged: count => `${count} 個檔案已變更`,
      reviewChanges: '檢視',
      readAloudFailed: '朗讀失敗',
      preparingAudio: '正在準備音訊...',
      stopReading: '停止朗讀',
      readAloud: '朗讀',
      copyFullResponse: '複製完整回覆',
      readAloudFullResponseHint: '按住 Shift 點擊：朗讀完整回覆',
      editMessage: '編輯訊息',
      expandMessage: '展開留言',
      scrollToBottom: '滾動到底部',
      stop: '停止',
      restorePrevious: '還原至上一個檢查點',
      restoreCheckpoint: '還原檢查點',
      restoreFromHere: '還原檢查點 — 從此提示重新執行',
      restoreFailed: '回復失敗',
      restoreTitle: '還原至此檢查點？',
      restoreBody: '此提示之後的所有訊息將從對話中移除，並從此處重新執行該提示。',
      restoreConfirm: '還原並重新執行',
      restoreNext: '還原至下一個檢查點',
      goForward: '前進',
      sendEdited: '傳送編輯後的訊息',
      attachingFile: '正在附加…',
      errorAuthKinds: {
        api_key: {
          title: provider => `${provider}拒絕了你的 API 金鑰`,
          body: provider => `為 ${provider} 儲存的 API 金鑰無效或已被撤銷。請更新後再試一次。`
        },
        oauth: {
          title: provider => `你的${provider}登入已過期`
        }
      },
      errorDetails: '詳細資訊',
      errorToastTitle: 'Hermes 无法完成回复',
      errorLimitResets: time => `限額將於 ${time} 重設`,
      errorRetryAtReset: time => `限額重設後重試（${time}）`,
      errorRetryScheduled: (time, wait) => `將於 ${time} 重試 — 還剩 ${wait}`,
      errorRetryScheduledCancel: '取消',
      errorChooseModel: '選擇型號',
      errorCompressConversation: '壓縮對話',
      errorCompressFailed: '無法壓縮對話',
      errorOpenHermesFolder: '開啟Hermes資料夾',
      errorOpenHermesFolderFailed: '無法開啟 Hermes 資料夾',
      errorUpdateApiKey: '更新 API 金鑰',
      errorSignInFreeTier: '使用 Nous 帳號登入'
    },
    approval: {
      gatewayDisconnected: 'Hermes 閘道未連線',
      sendFailed: '無法傳送核准回應',
      run: '執行',
      command: '指令',
      moreOptions: '更多核准選項',
      allowSession: '允許本工作階段',
      alwaysAllowMenu: '一律允許…',
      jumpToApproval: '需要核准',
      reject: '拒絕',
      alwaysTitle: '一律允許此指令？',
      alwaysDescription: pattern =>
        `這會將「${pattern}」模式加入永久允許清單（~/.hermes/config.yaml）。Hermes 對類似指令將不再詢問，包括目前工作階段和未來工作階段。`,
      alwaysAllow: '一律允許',
      reconnect: '重新連接',
      timedOutSystemLine: '批准超時 - 命令未運行。請Hermes重試，或在設定→安全性→批准逾時中提高限制。',
      openSafetySettings: '開啟安全設定',
      commandDetails: '命令詳細資訊'
    },
    clarify: {
      notReady: '澄清請求尚未就緒',
      gatewayDisconnected: 'Hermes 閘道未連線',
      sendFailed: '無法傳送澄清回應',
      loadingQuestion: '正在載入問題…',
      other: '其他（輸入您的答案）',
      placeholder: '輸入您的答案…',
      skip: '略過',
      skipped: '已略過',
      noAnswer: '未回答',
      confirmAndContinueLabel: '確認並繼續',
      singleSelectHint: '選一個',
      multiSelectHint: '可多選',
      recommendedSuffix: '（推薦）',
      questionProgress: (answered, total) => `已回答 ${answered}/${total}`,
      notDelivered: '此問題未送達應用程式，無法在此回答。請按停止結束本輪，然後在聊天中回覆。'
    },
    mcpSetup: {
      installTitle: '新增 MCP 伺服器',
      enableTitle: '啟用 MCP 伺服器',
      authorizeTitle: '授權MCP伺服器',
      installAction: '安裝',
      enableAction: '啟用',
      authorizeAction: '授權',
      installed: server => `已安裝${server}`,
      enabled: server => `已啟用${server}`,
      authorized: server => `授權的${server}`,
      failed: server => `設定失敗於${server}`,
      toolCount: count => (count === 1 ? '1 個工具' : `${count} tools`),
      envRequired: '首先填寫所需的憑證',
      sendFailed: '無法發送 MCP 設定回應',
      reloadFailed: '伺服器已儲存，但重新載入 MCP 工具失敗 - 它們載入下一個會話',
      gatewayDisconnected: 'Hermes 目前離線。重新連接，然後再次發送。'
    },
    tool: {
      copyCode: '複製程式碼',
      renderingImage: '正在渲染圖片',
      copyOutput: '複製輸出',
      copyCommand: '複製指令',
      copyContent: '複製內容',
      copyUrl: '複製 URL',
      copyResults: '複製結果',
      copyQuery: '複製查詢',
      copyFile: '複製檔案',
      copyPath: '複製路徑',
      outputAlt: '工具輸出',
      rawResponse: '原始回應',
      copyActivity: '複製活動',
      toolPayload: '工具承載資料',
      searchResults: '搜尋結果',
      recoveredOne: '在 1 個失敗步驟後已復原',
      recoveredMany: count => `在 ${count} 個失敗步驟後已復原`,
      failedOne: '1 個步驟失敗',
      failedMany: count => `${count} 個步驟失敗`,
      statusRunning: '執行中',
      statusError: '錯誤',
      statusRecovered: '已復原',
      statusDone: '完成',
      memoryWriteNoted: '已記下記憶寫入',
      failedToWriteFile: detail => `寫入檔案失敗：${detail}`,
      sensitiveSystemPathWriteRefused: path =>
        `拒絕寫入敏感系統路徑：${path}\n如需修改系統檔案，請使用終端機工具並透過 sudo 執行。`,
      returnedError: '工具傳回錯誤',
      returnedSuccessFalse: '工具傳回 success=false',
      returnedStatus: status => `工具傳回「${status}」狀態`,
      commandFailedWithExitCode: exitCode => `指令執行失敗，結束碼為 ${exitCode}`,
      sessionKernelTimedOut: (timeoutSeconds, remote) =>
        `執行單元在 ${timeoutSeconds} 秒後逾時；${remote ? '遠端' : ''}工作階段核心已被終止，其狀態已遺失。下一次 execute_code 呼叫將啟動全新的核心。`,
      clarifyErrors: {
        questionsMustBeArray: 'questions 參數必須是由問題物件組成的陣列',
        questionsLimit: limit => `questions 參數最多支援 ${limit} 項`,
        questionMustBeObject: index => `questions[${index}] 必須是包含 question 欄位的物件`,
        questionMustNotBeEmpty: index => `questions[${index}].question 必須是非空白文字`,
        choicesMustBeArray: field => `${field} 必須是陣列`,
        choicesMustBeStringArray: 'choices 參數必須是字串陣列',
        noQuestion:
          '未提供問題。請在 questions 陣列中至少傳入一個物件並填寫 question；choices 和 multi_select 為選填欄位',
        unavailable: '目前環境無法使用澄清問題工具',
        inputFailed: detail => `取得使用者輸入失敗：${detail}`
      },
      countLabel: (count, _noun, displayNoun) => `${count} ${displayNoun}`,
      runSummary: {
        analyze: {
          count: (count, live) => `${live ? '正在分析' : '分析了'} ${count} 張圖片`,
          present: '正在分析',
          target: (target, live) => `${live ? '正在分析' : '分析了'} ${target}`
        },
        browse: {
          count: (count, live) => `${live ? '正在開啟' : '開啟了'} ${count} 個頁面`,
          present: '正在開啟',
          target: (target, live) => `${live ? '正在開啟' : '開啟了'} ${target}`
        },
        delegate: {
          count: (count, live) => `${live ? '正在委派' : '委派了'} ${count} 個任務`,
          present: '正在委派',
          target: (target, live) => `${live ? '正在委派' : '委派了'} ${target}`
        },
        edit: {
          count: (count, live) => `${live ? '正在編輯' : '編輯了'} ${count} 個檔案`,
          present: '正在編輯',
          target: (target, live) => `${live ? '正在編輯' : '編輯了'} ${target}`
        },
        explore: {
          count: (count, live) => `${live ? '正在探索' : '探索了'} ${count} 個檔案`,
          present: '正在探索',
          target: (target, live) => `${live ? '正在探索' : '探索了'} ${target}`
        },
        interact: {
          count: (count, live) => `${live ? '正在執行' : '執行了'} ${count} 個瀏覽器操作`,
          present: '正在執行',
          target: (target, live) => `${live ? '正在執行' : '執行了'} ${target}`
        },
        other: {
          count: (count, live) => `${live ? '正在使用' : '使用了'} ${count} 個工具`,
          present: '正在使用',
          target: (target, live) => `${live ? '正在使用' : '使用了'} ${target}`
        },
        read: {
          count: (count, live) => `${live ? '正在閱讀' : '閱讀了'} ${count} 個頁面`,
          present: '正在閱讀',
          target: (target, live) => `${live ? '正在閱讀' : '閱讀了'} ${target}`
        },
        run: {
          count: (count, live) => `${live ? '正在執行' : '執行了'} ${count} 條命令`,
          present: '正在執行',
          target: (target, live) => `${live ? '正在執行' : '執行了'} ${target}`
        },
        search: {
          count: (count, live) => `${live ? '正在搜尋' : '搜尋了'} ${count} 個查詢`,
          present: '正在搜尋',
          target: (target, live) => `${live ? '正在搜尋' : '搜尋了'} ${target}`
        },
        separator: '，'
      },
      actions: {
        read: '已讀取',
        reading: '正在讀取',
        opened: '已開啟',
        opening: '正在開啟',
        failedToOpen: '開啟失敗',
        searched: '已搜尋',
        searching: '正在搜尋',
        ran: '已執行',
        running: '正在執行',
        ranCode: '已執行程式碼',
        runningCode: '正在撰寫腳本'
      },
      prefixes: {
        browser: '瀏覽器',
        web: '網頁'
      },
      titleTemplates: {
        actionCommand: (action, command) => `${action} ${command}`,
        actionQuoted: (action, value) => `${action}「${value}」`,
        actionTarget: (action, target) => `${action} ${target}`,
        completedTool: action => `已執行 ${action}`,
        prefixedDone: (prefix, action) => `已執行 ${prefix} ${action}`,
        runningPrefixedTool: (prefix, action) => `正在執行 ${prefix} ${action}`,
        runningTool: action => `正在執行 ${action}`
      },
      titles: {
        browser_click: {
          done: '已點擊頁面元素',
          pending: '正在點擊頁面元素',
          pendingAction: '正在點擊'
        },
        browser_fill: {
          done: '已填寫表單欄位',
          pending: '正在填寫表單欄位',
          pendingAction: '正在填寫'
        },
        browser_navigate: {
          done: '已開啟頁面',
          pending: '正在開啟頁面',
          pendingAction: '正在開啟'
        },
        browser_snapshot: {
          done: '已擷取頁面快照',
          pending: '正在擷取頁面快照',
          pendingAction: '正在擷取'
        },
        browser_take_screenshot: {
          done: '已擷取截圖',
          pending: '正在擷取截圖',
          pendingAction: '正在擷取'
        },
        browser_type: {
          done: '已在頁面輸入',
          pending: '正在頁面輸入',
          pendingAction: '正在輸入'
        },
        clarify: {
          done: '已提問',
          pending: '正在提問',
          pendingAction: '正在提問'
        },
        cronjob: {
          done: 'Cron 工作',
          pending: '正在安排 Cron 工作',
          pendingAction: '正在安排'
        },
        edit_file: {
          done: '已編輯檔案',
          pending: '正在編輯檔案',
          pendingAction: '正在編輯'
        },
        execute_code: {
          done: '已執行程式碼',
          pending: '正在撰寫腳本',
          pendingAction: '正在撰寫腳本'
        },
        image_generate: {
          done: '已生成圖片',
          pending: '正在生成圖片',
          pendingAction: '正在生成'
        },
        list_files: {
          done: '已列出檔案',
          pending: '正在列出檔案',
          pendingAction: '正在列出'
        },
        memory: {
          done: '已儲存至記憶',
          pending: '正在儲存至記憶',
          pendingAction: '正在儲存'
        },
        patch: {
          done: '已修補檔案',
          pending: '正在修補檔案',
          pendingAction: '正在修補'
        },
        read_file: {
          done: '已讀取檔案',
          pending: '正在讀取檔案',
          pendingAction: '正在讀取'
        },
        search_files: {
          done: '已搜尋檔案',
          pending: '正在搜尋檔案',
          pendingAction: '正在搜尋'
        },
        session_search_recall: {
          done: '已搜尋工作階段歷史',
          pending: '正在搜尋工作階段歷史',
          pendingAction: '正在搜尋'
        },
        skill_view: {
          done: '已載入技能',
          pending: '正在載入技能',
          pendingAction: '正在載入'
        },
        terminal: {
          done: '已執行指令',
          pending: '正在執行指令',
          pendingAction: '正在執行'
        },
        todo: {
          done: '已更新待辦',
          pending: '正在更新待辦',
          pendingAction: '正在更新'
        },
        vision_analyze: {
          done: '已分析圖片',
          pending: '正在分析圖片',
          pendingAction: '正在分析'
        },
        web_extract: {
          done: '已讀取網頁',
          pending: '正在讀取網頁',
          pendingAction: '正在讀取'
        },
        web_search: {
          done: '已搜尋網頁',
          pending: '正在搜尋網頁',
          pendingAction: '正在搜尋'
        },
        write_file: {
          done: '已編輯檔案',
          pending: '正在編輯檔案',
          pendingAction: '正在編輯'
        }
      },
      failedCalls: (count: number) => `${count} 次工具呼叫失敗`,
      skillActivity: {
        loading: '正在載入技能',
        loaded: '已載入技能',
        loadFailed: '技能載入失敗',
        readingResource: '正在讀取技能資源',
        readResource: '已讀取技能資源',
        resourceFailed: '技能資源讀取失敗',
        listing: '正在列出技能',
        listed: '已列出技能',
        listFailed: '技能清單取得失敗',
        unavailable: '技能結果無法使用'
      },
      resultUnavailable: '結果無法使用',
      resultInterrupted: '已中斷'
    }
  }
} satisfies Pick<TranslationOverrides, 'assistant'>
