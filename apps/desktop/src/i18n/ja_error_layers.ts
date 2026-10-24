import type { Translations } from './types'

type ThreadCopy = Translations['assistant']['thread']

// The error card's layer fallbacks (lib/error-surface-copy.ts): used when a failure code has no own entry.
export const jaErrorLayers: Pick<ThreadCopy, 'errorLayerBodies' | 'errorLayers'> = {
  errorLayers: {
    auth: '認証エラー',
    billing: 'クレジット不足',
    disk: 'ディスク容量不足',
    endpoint: 'カスタムエンドポイントのエラー',
    gateway: 'ゲートウェイのエラー',
    generic: 'ターンが失敗しました',
    provider: 'プロバイダーのエラー',
    runtime: 'ローカルランタイムのエラー',
    streaming: 'ストリーミング接続のエラー'
  },
  errorLayerBodies: {
    auth: 'AI サービスがサインインを拒否しました。このプロバイダーの認証情報を確認して、メッセージを再送してください。',
    billing: 'このプロバイダーのアカウント残高がありません。チャージするかプロバイダーを切り替えて、再送してください。',
    disk: 'ディスクがいっぱいのため、Hermes はこの会話を保存できませんでした。空き容量を確保して再試行してください。',
    endpoint: 'カスタムモデルサーバーに接続できません。サーバーが起動しているか確認し、メッセージを再送してください。',
    gateway:
      'Hermes は返信の開始時に内部エラーを検出しました。メッセージを再送し、問題が続く場合は診断情報を送信してください。',
    generic:
      'Hermes の返信中に問題が発生しました。再試行してください。問題が続く場合はエラー詳細をコピーしてください。',
    provider:
      'AI サービスがリクエストを完了できませんでした。少し待って再試行するか、プロバイダーを切り替えてください。',
    runtime:
      'Hermes は返信の開始時に内部エラーを検出しました。メッセージを再送し、問題が続く場合は診断情報を送信してください。',
    streaming: '返信が完了する前に接続が切れました。再試行してもう一度送信してください。'
  }
}
