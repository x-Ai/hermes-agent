import type { TranslationOverrides } from './define-locale'

// The free Nous tier's copy (`freeTier`), composed by ja.ts.
export const jaFreeTier: TranslationOverrides['freeTier'] = {
  providerRowTitle: 'Nous · 無料プラン',
  providerRowPitch: 'Nous アカウントでサインインすると、より多くのモデルとツールを利用できます。',
  readyTitle: 'Hermes の準備ができました。',
  readyCaption: '無料 · コネクター付き',
  begin: '開始',
  signInInstead: '代わりに Nous アカウントでサインイン',
  otherProviders: 'その他のプロバイダー',
  stripTitle: '無料の Nous 推論とコネクターが利用できるようになりました。',
  stripBody: 'モデルピッカーを開いて試すか、Nous アカウントでサインインしてください。',
  openModelPicker: 'モデルピッカーを開く',
  dismiss: '閉じる',
  providerName: 'Nous',
  statusLabel: model => `Nous · ${model}`,
  signIn: 'サインイン',
  signInHeading: 'Nous アカウントでサインインすると、より多くのモデルとツールを利用できます。',
  settingUp: '無料の推論を準備しています…',
  finishInBrowser: 'ブラウザーで完了してください',
  doNotShare: 'このコードは共有しないでください。',
  openPageAgain: 'ページをもう一度開く',
  waiting: 'サインインを待っています…',
  finishingHeading: 'サインインを完了しています…',
  finishingBody: 'ブラウザーで承認されました。アカウントのトークンを取得しています。',
  signedInAsLabel: 'サインイン中のアカウント',
  signedIn: 'サインインしました。',
  completedBody: '推論とツールは、今後このアカウントで提供されます。',
  reconnect: '再接続',
  openConnectors: 'コネクターを開く',
  defaultModel: 'デフォルトモデル',
  change: '変更',
  done: '完了',
  notNow: '今はしない',
  tryAgain: 'もう一度試す',
  didNotComplete: 'サインインが完了しませんでした',
  timedOutHeading: 'サインインリンクの有効期限が切れました',
  timedOutBody: '準備ができたら、いつでもやり直せます。引き続き無料の Nous サービスを利用中です。',
  errorBody: 'サインインが完了しませんでした。準備ができたら、もう一度お試しください。',
  alreadySignedInHeading: 'すでにサインインしています。',
  alreadySignedInBody: 'この Hermes は、すでに Nous アカウントにサインインしています。',
  offer: {
    heading: 'Hermes を使い続ける',
    body: '現在は無料枠をご利用中です。Hermes を使い続けると、いずれ上限に達します。無料の Nous アカウントでサインインすると、より多くの利用枠が使えます。',
    signIn: 'サインイン',
    notNow: '今はしない'
  },
  busyHeading: 'あと少しです',
  busyBody: wait =>
    `Nous サービスが混み合っているため、Hermes はサインインを完了できませんでした。${wait}後にもう一度お試しください。その間もセッションはそのまま残っています。`,
  unreachableBody:
    'Hermes が Nous サービスに接続できず、サインインを完了できませんでした。インターネット接続を確認して、もう一度お試しください。セッションはそのまま残っています。',
  setupFailed: {
    gateClosed:
      'このバージョンの Hermes は、Nous アカウントがないと起動できません。サインインするか、アカウントを作成してください。無料で、1 分ほどで完了します。',
    paused:
      'サインインなしでの Hermes の利用は、一時的に停止されています。Hermes が引き続き状況を確認します。サインインは無料で、今すぐ使い始められます。',
    rateLimited: wait =>
      `現在多くの方が利用を開始しているため、Hermes は${wait}後に再試行します。サインインは無料で、待たずに始められます。`,
    unreachable:
      'Hermes が Nous サービスに接続できませんでした。インターネット接続を確認してから、「もう一度試す」をタップしてください。または、ひとまず別のプロバイダーに接続してください。',
    serverError:
      'Nous サービスで一時的な問題が発生しました。少し待ってから「もう一度試す」をタップするか、ひとまず別のプロバイダーに接続してください。',
    powRequired:
      'Nous サーバーがプルーフ・オブ・ワークを要求しましたが、お使いのエージェントにはまだ実装されていません。続行するには、サインインするか、無料の Nous アカウントを作成してください。',
    locked:
      'このセッションはサインインせずに続行できません。続行するには、サインインするか、無料の Nous アカウントを作成してください。',
    generic:
      'Hermes は、サインインせずに無料アクセスを設定できませんでした。サインインは無料です。別のプロバイダーに接続することもできます。',
    signInBelow: 'サインインは無料です。以下の Nous を選択してください。',
    tryAgain: 'もう一度試す',
    retrying: '再試行しています…'
  },
  wait: {
    fewSeconds: '数秒',
    aboutMinute: '約 1 分',
    aboutMinutes: count => `約 ${count} 分`,
    aboutHour: '約 1 時間',
    aboutHours: count => `約 ${count} 時間`
  }
}
