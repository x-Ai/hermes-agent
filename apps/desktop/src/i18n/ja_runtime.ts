import type { TranslationOverrides } from './define-locale'

export const jaRuntime = {
  timelineEvents: {
    modelChanged: 'モデルを変更',
    resumedInterruptedTurn: '中断されたターンを再開',
    personalityChanged: 'パーソナリティを変更',
    backgroundAgentWorkFinished: 'バックグラウンドエージェントの作業が完了',
    backgroundAgentsFinished: (count: number) => `${count} 件のバックグラウンドエージェントが完了`,
    backgroundProcessFinished: 'バックグラウンドプロセスが完了'
  },
  runtimeErrors: {
    previewTargetUnavailable: (target: string) => `プレビュー対象を開けませんでした: ${target}`,
    desktopBridgeUnavailable: 'デスクトップブリッジを利用できません',
    artifactWriteFailed: '成果物ファイルを書き込めませんでした',
    previewBrowserBridgeUnavailable: 'デスクトップのプレビューブラウザーブリッジを利用できません',
    remotePreviewLoadFailed: 'リモートの HTML プレビューを読み込めませんでした',
    previewBufferBridgeUnavailable: 'デスクトップのプレビューバッファーブリッジを利用できません',
    remotePreviewStageFailed: 'リモートの HTML プレビューを準備できませんでした',
    hermesDesktopBridgeUnavailable: 'Hermes Desktop ブリッジを利用できません',
    savingUnavailable: '保存は利用できません',
    renameUnavailable: '名前の変更は利用できません',
    deleteUnavailable: '削除は利用できません',
    gatewayFilePathMissing: 'ゲートウェイのファイルパスがありません',
    fileDownloadBridgeUnavailable: 'デスクトップのファイルダウンロードブリッジを利用できません',
    attachmentReadFailed: (label: string) => `${label}を読み取れませんでした`,
    noActiveSessionToRestore: '復元できるアクティブなセッションがありません',
    restoreMessageNotFound: '復元するメッセージが見つかりませんでした',
    restoreEmptyMessage: '空のメッセージは復元できません',
    restoreUnavailableForMessage: 'このメッセージは復元できません',
    newSessionMissingId: '新しいセッションが保存済みの id を返しませんでした',
    quickEntryDestinationChanged: (drift: string) => `作成中にクイック入力の送信先が変わりました: ${drift}`,
    noActiveSessionForRestart: 'バックグラウンド再起動に使えるアクティブなセッションがありません',
    backgroundRestartNoTaskId: 'バックグラウンド再起動がタスク id を返しませんでした',
    gatewayNotConnected: 'Hermes ゲートウェイが接続されていません',
    gatewayUnavailable: 'Hermes ゲートウェイを利用できません',
    gatewayNotConnectedShort: 'ゲートウェイが接続されていません',
    gatewayDisconnected: 'ゲートウェイが切断されました',
    backendRetired: (profile: string) =>
      `「${profile}」のバックエンドは終了しました。再接続するには明示的に開いてください`,
    backendReconnecting: (profile: string) =>
      `「${profile}」のバックエンドは再接続中です。落ち着いてから再試行してください`,
    gatewayUnavailableForProfile: (profile: string) =>
      `プロファイル「${profile}」の Hermes ゲートウェイを利用できません`,
    registryDialUnsupported:
      'この Desktop ビルドはレジストリ接続にダイヤルできません。Hermes Desktop を更新してください',
    sessionControlGatewayUnavailable: 'セッション制御ゲートウェイを利用できません',
    profileChangedWhileConnecting: '接続中にアクティブな Hermes プロファイルが変わりました',
    connectionNotActive: (label: string) => `接続「${label}」がアクティブになりませんでした`,
    defaultProfileUnsupported: 'この Desktop バージョンでは既定のプロファイルを保存できません',
    poolLimitsApplyFailed: 'プール上限の適用に失敗しました',
    clipboardUnavailable: 'クリップボード API を利用できません',
    welcomeConversationUnavailable: 'ようこそ会話を読み込めませんでした。もう一度お試しください',
    pluginFolderUnavailable:
      'デスクトッププラグインのフォルダーを利用できません。最初のビルドを始める前に再試行してください',
    manifestMinContextInvalid: '最小コンテキストウィンドウは数値か空欄でなければなりません',
    manifestToolsNotList: 'tools はリストでなければなりません',
    manifestToolAutoInstall: (index: number) => `ツール ${index} は自動インストールを要求できません`,
    manifestPluginsNotList: 'plugins はリストでなければなりません',
    manifestSchemaUnsupported: 'マニフェストスキーマはバージョン 1 のみ対応しています',
    mcpDocNotObject: 'JSON オブジェクトが必要です',
    mcpDocNeedsName: 'サーバーを {"mcpServers": {"name": …}} で包んで名前を付けてください',
    transcriptionTimedOut: (seconds: number, provider: string) =>
      `文字起こしが ${seconds} 秒後にタイムアウトしました（${provider} が応答しませんでした）`,
    sttHttpError: (status: number, detail: string) => `ElevenLabs STT エラー（HTTP ${status}）: ${detail}`,
    ttsHttpError: (status: number, detail: string) => `ElevenLabs TTS エラー（HTTP ${status}）: ${detail}`,
    pluginIdentifierRequired: 'プラグイン識別子が必要です',
    pluginIdentifierInvalid: 'プラグイン識別子が無効です',
    mcpOauthCallbackUnsupported: 'MCP OAuth コールバックに対応するには Hermes Desktop を更新してください',
    mcpOauthTimedOut: 'MCP OAuth の認可待ちがタイムアウトしました',
    audioContextUnavailable: 'クライアント側のウェイク取り込みに必要な AudioContext を利用できません',
    connectionBridgeUnavailable: 'Hermes Desktop の接続ブリッジを利用できません'
  }
} satisfies Pick<TranslationOverrides, 'timelineEvents' | 'runtimeErrors'>
