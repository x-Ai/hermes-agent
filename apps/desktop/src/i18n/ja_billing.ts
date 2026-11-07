import type { TranslationOverride } from '@hermes/shared/i18n'

import type { Translations } from './types'

// Settings › Billing, composed by ja.ts as `settings.billing` (file-size split).
export const jaBilling: TranslationOverride<Translations['settings']['billing']> = {
  perMonth: amount => `${amount}/月`,
  creditsPerMonth: amount => `${amount} クレジット/月`,
  usageLabel: label => `${label}の利用量`,
  freeTier: {
    signIn: 'サインイン',
    title: 'Nous の無料プランを利用中です',
    message: 'Nous アカウントでサインインすると、より多くのモデルとツールを利用できます。',
    caption:
      'nous/welcome で動作し、コネクターも含まれます。サインインすると、コネクターはそのまま引き継がれ、アカウントが必要なツールと他のすべてのモデルが追加されます。',
    name: 'Nous · 無料プラン',
    footnote:
      '無料プランには残高がなく、支払う必要もありません。支払いと利用量は、Nous アカウントでサインインすると表示されます。',
    plan: '無料プラン',
    model: 'モデル',
    connectors: 'コネクター',
    included: '利用可能'
  },
  amountValidation: {
    reloadTo: '補充後の残高',
    greaterThanThreshold: '補充後の残高は、しきい値より大きくする必要があります。',
    decimal: label => `${label}：小数点以下 2 桁までのドル金額を入力してください。`,
    positive: label => `${label}：$0 より大きい金額を入力してください。`,
    minimum: (label, amount) => `${label}：下限は ${amount} です。`,
    maximum: (label, amount) => `${label}：上限は ${amount} です。`
  },
  stepUp: {
    openVerification: '確認ページを開く',
    dismiss: '閉じる',
    waiting: '確認リンクを待っています…',
    verify: '確認して続行',
    deniedTitle: '確認が承認されませんでした',
    deniedBody: '確認は終了しましたが、このターミナルのリモート支出は許可されませんでした。',
    successTitle: '確認完了',
    successBody: 'このターミナルのリモート支出が許可されました。'
  },
  charge: {
    added: amount => (amount ? `$${amount} を追加しました。` : 'クレジットを追加しました。'),
    failedTitle: '請求に失敗しました',
    unconfirmedTitle: '請求結果が未確認です',
    unconfirmedBody: message => `${message}今回の請求結果は未確認です。再試行する前に残高と履歴を確認してください。`,
    checkTitle: '請求を確認できませんでした',
    checkBody: '請求の状態を確認できませんでした。',
    untrackedTitle: '請求を追跡できませんでした',
    untrackedBody: '請求サービスはリクエストを受け付けましたが、請求 ID を返しませんでした。',
    timeoutTitle: '5 分経過しても処理中です',
    timeoutBody: '請求はこの後確定する可能性があります。再試行する前にポータルを確認してください。',
    authenticationRequired:
      '銀行による本人認証（3DS）が必要です。この購入を完了するには、ポータルで認証を済ませてください。',
    expired: 'カードの有効期限が切れています。ポータルで更新してください。',
    declined: 'カードが拒否されました。ポータルで別のカードをお試しください。',
    failedBody: reason => `請求が完了しませんでした（${reason}）。`
  },
  preview: 'プレビュー',
  summary: {
    balance: '残高',
    plan: 'プラン',
    autoRefill: '自動補充'
  },
  sections: {
    invoices: '請求書',
    plan: 'プラン',
    paymentAndCredits: '支払いとクレジット',
    usage: '利用量'
  },
  buyCredits: {
    customAmount: '任意のクレジット金額',
    title: '今すぐクレジットを購入',
    buyButton: '購入',
    processing: '処理中…決済を確認しています',
    added: amount => `${amount} を追加しました。残高を更新しています。`,
    retry: '再試行',
    openPortal: 'ポータルを開く'
  },
  plan: {
    title: 'プラン',
    changePlan: 'プランを変更',
    viewPlans: 'プランを見る',
    backAria: '請求に戻る',
    current: '現在のプラン',
    scheduled: '予約済み',
    empty: '現在変更できるプランはありません。',
    undo: '取り消す',
    undoing: '取り消し中…',
    downgrade: 'ダウングレード',
    confirmDowngrade: 'ダウングレードを確定',
    tryAgain: '再試行',
    checkingChange: '変更内容を確認中…',
    cannotChange: 'この変更はここでは実行できません。',
    alreadyOn: name => `すでに ${name} を利用中です。変更はありません。`,
    notScheduleable: 'この変更はここでは予約できません。',
    scheduling: '予約中…',
    cancel: 'キャンセル',
    effectScheduled: (targetName, effectiveAt, creditsDelta) =>
      `${targetName} に変更します（適用日：${effectiveAt}）。現時点での請求はなく、それまでは現在のプランを維持します。${creditsDelta ? `月間クレジットの変更：${creditsDelta}。` : ''}`
  },
  keepGoingOnCredits: {
    title: 'クレジットで続行',
    description: '含まれる利用量を使い切ったらクレジットを使います。オフの場合、Hermes はリセットまで待機します。',
    approveInBrowser: '変更するにはブラウザでリモート支出を承認してください。承認するとすぐに適用されます。',
    openAgain: 'もう一度開く',
    cancel: 'キャンセル',
    approvedRetry: 'リモート支出は承認されましたが、変更を保存できませんでした。',
    tryAgain: '再試行'
  },
  autoReload: {
    threshold: 'しきい値',
    thresholdAria: '自動補充のしきい値',
    reloadTo: '補充後の残高',
    reloadToAria: '自動補充後の残高',
    turnOffConfirm: '自動補充をオフにしますか？',
    turnOff: 'オフにする',
    disable: '無効にする',
    updated: '自動補充の設定を更新しました。',
    turnedOff: '自動補充をオフにしました。',
    manage: '管理',
    save: '保存',
    saving: '保存中…',
    cancel: 'キャンセル'
  },
  state: {
    notice: {
      loggedOut: {
        title: 'Nous アカウントを接続',
        message: 'Nous アカウントでサインインすると、残高・プラン・利用量をここで確認できます。',
        action: 'サインイン'
      },
      openPortal: 'ポータルを開く ↗',
      noCard: {
        title: '支払い方法が登録されていません',
        message: 'カードを登録するまで、追加クレジットの購入と自動補充は無効です。ポータルでカードを追加してください。',
        action: 'カードを追加 ↗'
      }
    },
    paymentMethod: {
      title: '支払い方法',
      description: '追加購入とサブスクリプション更新に使うカードを管理します。',
      addAction: '支払い方法を追加',
      updateAction: '更新',
      provenance: {
        autoRefill: '自動補充用カード',
        customerDefault: '既定のカード',
        subPin: 'サブスクリプション用カード',
        suffix: label => `（${label}）`
      }
    },
    buyCredits: {
      description: 'カードへの 1 回限りの請求で、本日中に残高に追加されます。'
    },
    autoRefill: {
      title: '残高低下時に補充',
      genericDescription: '残高がしきい値を下回ったときに自動で補充します。',
      offPill: '無効',
      enabledPill: '有効',
      manageCaption: 'ポータルで自動補充を管理できます。',
      turnOnCaption: 'ポータルで自動補充を有効にできます',
      chargesDescription: (reloadTo, threshold) => `残高が ${threshold} を下回ると ${reloadTo} まで自動補充します。`,
      distinctCardCaption: cardLabel => `自動補充の支払いカード：${cardLabel}。ポータルでカードを揃えてください。`,
      distinctCardFallback: '別のカード',
      reconcileAction: 'カードを揃える ↗'
    },
    usage: {
      subscriptionCredits: {
        title: 'サブスクリプションクレジット',
        barLabel: 'サブスクリプションクレジット残高',
        captionResets: date => `リセット日：${date}`,
        valueOf: (remaining, monthly) => `残り ${remaining} / ${monthly}`,
        valueOver: (remaining, monthly, over) => `残り ${remaining} / ${monthly} · ${over} 超過`
      },
      topupCredits: {
        title: '追加クレジット',
        caption: '有効期限なし'
      },
      monthlyCap: {
        title: '月間利用上限',
        barLabel: '月間利用上限の使用量',
        captionDefault: '既定の上限',
        captionSpending: '月間リモート支出額',
        valueUsed: (spent, limit) => `${spent} / ${limit} 使用済み`
      },
      window: {
        today: '今日',
        week: '今週',
        month: '今月',
        topTier: '大型モデル（月間）',
        barLabel: title => `${title}：含まれる利用量の使用率`,
        captionPaused: '一時停止中：サブスクリプションの支払いに失敗しました',
        captionPausedOther: '一時停止中：ポータルの請求ページを確認してください',
        captionTopTierUsedUp: '月間の利用枠を使い切りました。以降はクレジットで支払われます。',
        captionTopTierUsedUpKeepGoingOff:
          '月間の利用枠を使い切りました。プランに含まれる他のモデルは引き続き使えます。',
        captionResetsIn: duration => `${duration}後にリセット`,
        captionIncluded: '含まれる利用量',
        valueUsed: percent => `${percent} 使用済み`
      }
    },
    planCard: {
      freeTier: '無料',
      chooseAction: '選択 ↗',
      adjustPlanAction: 'プランを調整 ↗',
      unavailableCaption: 'サブスクリプションの詳細を取得できませんが、ポータルは開けます。',
      downgradeCaption: (tierName, when) => `${tierName} に変更されます（適用日：${when}）。`,
      cancellationCaption: when => `キャンセルされます（適用日：${when}）。`,
      renewsCaption: date => `更新日：${date}`,
      noSubscriptionCaption: '有効なサブスクリプションはありません。有料モデルは追加クレジットを使用します。'
    }
  },
  errors: {
    consentRequired: {
      title: 'カードの確認が必要です',
      message: 'ポータルで、このカードをターミナルからの請求に使用できるよう確認してください'
    },
    insufficientScope: {
      title: 'リモート支出の承認が必要です',
      message: 'リモート支出を許可する必要があります。追加購入を開始して許可した後、再試行してください。'
    },
    remoteSpendingRevoked: {
      title: 'リモート支出が停止されました',
      messageByAdmin: '管理者がこのターミナルのリモート支出を停止しました。',
      messageBySelf: 'このターミナルのリモート支出は、ご自身の操作で停止されました。'
    },
    remoteSpendingReconnect: who => `${who}「設定 → ゲートウェイ」から再接続し、このデバイスを再承認してください。`,
    sessionRevoked: {
      title: 'セッションがログアウトされました',
      message: 'セッションがログアウトされました。「設定 → ゲートウェイ」から再度サインインしてください。'
    },
    cliBillingDisabled: {
      title: 'リモート支出は無効です',
      message: 'このアカウントではリモート支出が無効です。請求管理者がポータルの Hermes Agent ページで有効にできます。'
    },
    roleRequired: {
      title: '管理者権限が必要です',
      message:
        '追加購入には、組織の管理者または所有者の権限が必要です。管理者に依頼するか、ポータルで管理してください。'
    },
    idempotencyConflict: {
      title: '新しい追加購入を開始',
      message: '🔴 この請求キーは別の金額ですでに使用されています。新しい追加購入を開始してください。'
    },
    noPaymentMethod: {
      title: '保存済みカードがありません',
      message:
        '💳 ターミナルからの請求に使える保存済みカードがまだありません。ポータルで設定してください（1 回限りのクレジット購入では、再利用できるカードは保存されません）。'
    },
    orgAccessDenied: {
      title: '組織へのアクセスが拒否されました',
      message: 'このトークンは管理可能な組織に紐付いていません'
    },
    monthlyCapExceeded: {
      title: '月間利用上限に達しました',
      messageReached: '🔴 月間利用上限に達しました。',
      messageHeadroom: remaining => `🔴 月間利用上限に達しました。残り枠は $${remaining} です。`
    },
    rateLimited: {
      title: '現在、請求リクエストが多すぎます',
      message: mins =>
        mins > 0
          ? `🟡 現在、請求リクエストが多すぎます（約 ${mins} 分後に再試行してください）。支払いに失敗したわけではありません。`
          : '🟡 現在、請求リクエストが多すぎます。支払いに失敗したわけではありません。'
    },
    stripeUnavailable: {
      title: 'Stripe で問題が発生しています',
      message: mins =>
        mins > 0
          ? `Stripe で問題が発生しています。約 ${mins} 分後に再試行してください。`
          : 'Stripe で問題が発生しています。しばらくしてから再試行してください。'
    },
    upgradeCapExceeded: {
      title: '1 日のプラン変更上限に達しました',
      message: '1 日のプラン変更上限に達しました。明日再試行してください。'
    },
    endpointUnavailable: {
      title: '請求エンドポイントを利用できません',
      message: '請求エンドポイントが JSON 以外の応答を返しました（この環境では利用できない可能性があります）。'
    },
    timeout: {
      title: '請求サービスへのリクエストがタイムアウトしました',
      message: '請求サービスへのリクエストがタイムアウトしました。'
    },
    transport: {
      title: '請求サービスへの接続に失敗しました',
      message: '請求サービスへのリクエストは、ゲートウェイに到達する前に失敗しました。'
    },
    default: {
      title: '請求サービスへのリクエストに失敗しました',
      message: '請求サービスへのリクエストに失敗しました。'
    }
  }
}
