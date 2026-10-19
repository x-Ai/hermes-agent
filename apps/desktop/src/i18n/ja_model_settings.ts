import type { TranslationOverride } from '@hermes/shared/i18n'

import { jaAuxTasks } from './ja_aux_tasks'
import type { ModelSettingsTranslations } from './types_model_settings'

export const jaModelSettings: TranslationOverride<ModelSettingsTranslations> = {
  moaTitle: 'エージェント混合（Mixture of Agents）',
  moaPreset: 'プリセット',
  moaDescription:
    '「Mixture of Agents」プロバイダーのモデルとして表示される名前付きプリセットを設定します。集約モデルが実行を担当し、ツールループのすべての処理を行うため、実行費用のほぼ全額がそのプロバイダーに請求されます。参照モデルは既定でユーザーの各ターンに一度だけ助言します。',
  moaAggregator: '集約モデル',
  moaAggregatorBilled: '実行モデル · 実行費用の請求先',
  moaReferenceHint: '既定では各ターンに一度だけ助言',
  setupProviderFallback: 'プロバイダー',
  setUpProvider: name => `${name} を設定`,
  staleAuxBefore: (count, names) => `${count} 件の補助タスク（${names}）は引き続き `,
  staleAuxAfter: ' で実行され、メインモデルは使用されません。',
  staleAuxOtherProviders: '別のプロバイダー',
  moaEnabled: '有効',
  moaSetDefault: 'デフォルトに設定',
  moaNewPresetPlaceholder: '新しいプリセット',
  moaAddPreset: 'プリセットを追加',
  customModel: 'カスタムモデル…',
  customModelPlaceholder: 'モデル ID',
  chooseFromList: 'リストから選択',
  moaDefault: 'デフォルト:',
  moaReferenceToggle: (enabled, index) => `参照 ${index} を${enabled ? '無効化' : '有効化'}`,
  moaReferenceTitle: index => `参照 ${index}`,
  moaAddReference: '参照モデルを追加',
  loading: 'モデル設定を読み込み中...',
  appliesDesc:
    '新しいセッションに適用されます。コンポーザーのモデルピッカーを使ってアクティブなチャットをホットスワップできます。',
  provider: 'プロバイダー',
  model: 'モデル',
  applying: '適用中...',
  defaultsLabel: 'デフォルト',
  reasoning: '推論',
  reasoningOff: 'オフ',
  defaultsFailed: 'モデルのデフォルトを保存できませんでした',
  loadFailed: 'モデルを読み込めませんでした',
  restartRequired:
    'アップデート後、このバックエンドは古いコードのままです。再起動して新しいコードを読み込んでください。',
  restartBackend: 'バックエンドを再起動',
  restartingBackend: 'バックエンドを再起動中...',
  restartFailed: 'バックエンドを再起動できませんでした',
  auxiliaryTitle: '補助モデル',
  resetAllToMain: 'すべてメインにリセット',
  staleAuxDismiss: '今後表示しない',
  auxiliaryDesc:
    'ヘルパータスクはデフォルトでメインモデルで実行されます。タスクに専用モデルを割り当てることでオーバーライドできます。',
  setToMain: 'メインに設定',
  change: '変更',
  autoUseMain: '自動 · メインモデルを使用',
  providerDefault: '(プロバイダーのデフォルト)',
  fallbackAdd: 'フォールバックの追加',
  fallbackEmpty: 'フォールバック モデルなし - 失敗しない限り、デフォルト モデルが使用されます。',
  notInCatalog:
    'このプロバイダーのモデル リストには含まれていません。呼び出しはバックアップにフォールバックされる可能性があります。',
  staleAuxPrefix: (count, names) => `${count} 件の補助タスク (${names}) は引き続き `,
  staleAuxSuffix: ' で実行されます — メインモデルではありません。',
  pasteKeyPlaceholder: keyEnv => `${keyEnv} を貼り付け`,
  activate: '有効化',
  activating: '有効化中...',
  needsApiKeyHint: name => `${name} には API キーが必要です — 設定するとモデルを選択できます。`,
  oauthHint: name => `${name} はブラウザーでサインインします — Hermes がフローを代行します。`,
  moa: {
    title: 'Mixture of Agents',
    shortTitle: 'MoA',
    presetsTitle: 'MoA プリセット',
    description:
      'Mixture of Agents プロバイダーの下にモデルとして表示される名前付きプリセットを設定します。アグリゲーターが実際に応答するモデルです。',
    presetPlaceholder: 'プリセット',
    enabled: '有効',
    setDefault: 'デフォルトに設定',
    deletePreset: '削除',
    newPresetPlaceholder: '新しいプリセット名',
    addPreset: 'プリセットを追加',
    defaultLabel: 'デフォルト:',
    referenceTitle: index => `リファレンス ${index}`,
    toggleReference: (index, enabled) => `リファレンス ${index} を${enabled ? '無効にする' : '有効にする'}`,
    removeReference: '削除',
    addReference: 'リファレンスモデルを追加',
    aggregatorTitle: 'アグリゲーター'
  },
  tasks: jaAuxTasks,
  inheritMainEffort: '継承 · メインモデルの推論強度',
  inheritsFrom: task => `${task} を継承`,
  followTask: task => `${task} に従う`,
  subagents: {
    inherit: 'メインエージェントから継承',
    modelOnly: 'カスタムモデル（メインエージェントの認証情報を使用）',
    providerLabel: 'サブエージェントのプロバイダー',
    modelLabel: 'サブエージェントのモデル',
    direct: '直接エンドポイント',
    customProvider: 'カスタムプロバイダー...',
    customProviderLabel: 'サブエージェントのカスタムプロバイダー',
    parentModel: 'メインエージェントのモデルを使用',
    parentModelWarning:
      '選択したプロバイダーがメインエージェントのモデルに対応している必要があります。モデルが対応していないと、プロバイダーのみのルートは失敗することがあります。そのプロバイダーに独自の既定モデルがある場合、サブエージェントはそちらを使用します。',
    directActive:
      '直接エンドポイントが有効で、保存済みのプロバイダーより優先されます。このモードを選択している間、エンドポイントと認証情報は保持されます。',
    directClear:
      'このルートを適用すると、直接エンドポイントと保存済みのキーが削除されます。その他のリクエスト設定は保持されます。',
    catalogFailed: 'モデルカタログを取得できません。プロバイダーとモデルを手動で入力するか、再試行してください。',
    draftHint: '適用するまで変更はローカルにのみ保持されます。'
  }
}
