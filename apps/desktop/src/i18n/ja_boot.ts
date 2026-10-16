import type { TranslationOverrides } from './define-locale'

// The boot screen's copy, composed by ja.ts.
export const jaBoot = {
  boot: {
    ready: 'Hermes Desktop の準備ができました',
    connecting: '接続中',
    desktopBootFailedWithMessage: message => `デスクトップの起動に失敗しました: ${message}`,
    steps: {
      connectingGateway: 'ライブデスクトップゲートウェイに接続中',
      loadingSettings: 'Hermes の設定を読み込み中',
      loadingSessions: '最近のセッションを読み込み中',
      retryingRemoteBackend: 'リモート Hermes バックエンドに再接続中…',
      startingDesktopConnection: 'デスクトップ接続を開始中',
      startingHermesDesktop: 'Hermes Desktop を起動中…',
      backendReady: 'Hermes バックエンドの準備ができました',
      connectingRemoteBackend: 'リモート Hermes バックエンドに接続中',
      resolvingBackend: 'Hermes バックエンドを解決中',
      resolvingRuntime: 'Hermes ランタイムを解決中',
      restartingAfterUpdate: '更新を完了するため Hermes を再起動中…',
      runtimeReady: 'Hermes ランタイムの準備ができました',
      startingBackend: 'Hermes バックエンドを起動中',
      usingRuntime: 'インストール済みの Hermes ランタイムを使用中',
      waitingBackendLaunch: 'Hermes バックエンドの起動を待機中',
      waitingBackendReady: 'Hermes バックエンドの準備完了を待機中',
      waitingForUpdate: '現在の更新が完了するまで待機中…',
      waitingSetupChoice: '初回セットアップの選択を待っています'
    },
    errors: {
      backgroundExited: 'Hermes バックグラウンドプロセスが終了しました。',
      backgroundExitedDuringStartup: '起動中に Hermes バックグラウンドプロセスが終了しました。',
      backendStopped: 'バックエンドが停止しました',
      desktopBootFailed: 'デスクトップの起動に失敗しました',
      gatewayConnectionLost: 'ゲートウェイへの接続が切断されました',
      gatewayConnectionLostDetail:
        'バックグラウンドで再試行しています。読み取りや下書きは続けられます。問題が続く場合はゲートウェイ設定を開いてください。',
      gatewaySignInRequired: 'ゲートウェイへのサインインが必要です',
      ipcBridgeUnavailable: 'デスクトップ IPC ブリッジが利用できません。',
      restartHermes: '再起動 Hermes',
      openLogs: 'ログを開く',
      reconnectNow: '今すぐ再接続してください',
      connectionSettings: '接続設定',
      gatewaySignInRequiredDetail: '再接続するには、もう一度サインインしてください。チャットと設定は安全です。',
      signInAgain: '再度サインインしてください'
    },
    failure: {
      title: 'Hermes を起動できませんでした',
      description:
        'バックグラウンドゲートウェイが起動しませんでした。以下の回復手順をお試しください。チャットや設定は削除されません。',
      remoteTitle: 'リモートゲートウェイへのサインインが必要です',
      remoteDescription:
        'リモートゲートウェイのセッションが期限切れです。再接続するにはもう一度サインインしてください。チャットや設定は削除されません。',
      retry: '再試行',
      repairInstall: 'インストールを修復',
      useLocalGateway: 'ローカルゲートウェイを使用',
      gatewaySettings: 'ゲートウェイ設定',
      back: '戻る',
      openLogs: 'ログを開く',
      repairHint: '修復はインストーラーを再実行します。新しいマシンでは数分かかる場合があります。',
      remoteSignInHint: signInLabel =>
        `保存済みのリモートブラウザセッションからサインアウトし、${signInLabel}を開きます。代わりにバンドルされたバックエンドに切り替えるには「ローカルゲートウェイを使用」を選択してください。`,
      signOutAndSignIn: 'サインアウトして再サインイン',
      remoteFailureHint:
        '「ゲートウェイ設定」でゲートウェイの URL とサインインを確認するか、ローカルゲートウェイに切り替えてください。',
      cloudDownTitle: 'Nous Cloud エージェントが停止しています',
      cloudDownDescription:
        'このゲートウェイが接続している Nous 管理のクラウドエージェントがサーバーエラーを返しています。ここから再起動することはできません。ステータスを確認するか、ローカルゲートウェイに切り替えるか、サポートに連絡してください。',
      cloudDownHint:
        '下のボタンから Nous Portal（インスタンスの状態と操作）を開くか、Discord でサポートを受けられます。',
      cloudDownCheckPortal: 'Portal のステータスを確認',
      cloudDownDiscord: 'Discord でサポートを受ける',
      hideRecentLogs: '最近のログを非表示',
      showRecentLogs: '最近のログを表示',
      signedInTitle: 'サインインしました',
      signedInMessage: 'リモートゲートウェイに再接続中…',
      signInIncompleteTitle: 'サインインが完了していません',
      signInIncompleteMessage: '認証が完了する前にログインウィンドウが閉じられました。',
      signInFailed: 'サインインに失敗しました',
      signInToRemoteGateway: 'リモートゲートウェイにサインイン',
      signInWithProvider: provider => `${provider} でサインイン`,
      identityProvider: 'ID プロバイダー',
      details: '詳細'
    },
    causes: {
      exitedEarly: 'Hermes のバックグラウンド サービスが起動直後に停止しました。',
      timedOut: 'Hermes のバックグラウンド サービスが時間内に応答しませんでした。',
      permission: 'Hermes はデータ フォルダーに書き込むことができませんでした (権限の問題)。',
      diskFull: 'ディスクがいっぱいであるため、Hermes を開始できませんでした。',
      portInUse: '別のプログラムが Hermes が必要とするネットワーク ポートを使用しています。',
      installMissing: 'Hermes のインストールの一部が欠落しています。元に戻すには、修復インストールを選択します。'
    }
  }
} satisfies Pick<TranslationOverrides, 'boot'>
