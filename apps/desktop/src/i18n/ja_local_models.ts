import type { TranslationOverride } from '@hermes/shared/i18n'

import type { Translations } from './types'

export const jaLocalModels: TranslationOverride<Translations['settings']['localModels']> = {
  catalogDescriptions: {
    'Best all-round agent model; sees images; long context stays fast':
      '総合力に優れたエージェントモデル。画像に対応し、長いコンテキストでも高速',
    'Frontier-scale mixture-of-experts with multi-token prediction; sees images':
      'マルチトークン予測を備えた最先端規模の混合エキスパートモデル。画像に対応',
    'Frontier-scale model; needs a very large GPU to run well':
      '最先端の大規模モデル。快適な動作には非常に大容量の GPU メモリが必要',
    'Bigger mixture-of-experts with multi-token prediction; sees images':
      'マルチトークン予測を備えた、より大規模な混合エキスパートモデル。画像に対応',
    'Frontier-class model for machines with 128GB+ memory': '128 GB 以上のメモリを搭載したマシン向けの最先端モデル'
  } as Record<string, string>,
  recommendedBuild: (quant, largeWindow) =>
    `推奨ビルド（${quant}）— このエンジンが最適化されている量子化形式です。${largeWindow ? '大きなコンテキストウィンドウで、' : ''}すべて GPU 上で動作します`,
  compactBuild: quant =>
    `このマシン向けのコンパクトなビルド（${quant}）— GPU メモリに収まらず、システムメモリを使うため動作が遅くなります`,
  fitTooLarge: (quant, size) =>
    `最もコンパクトなビルド（${quant}、${size}）でも、GPU メモリとシステムメモリの合計容量を超えます`,
  fitNeedsMemory: 'このマシンの容量を超えるメモリが必要です',
  fitFullContext: context => `最大の ${context} コンテキストで動作します`,
  fitGrowingContext: (start, max) => `コンテキストは ${start} から始まり、使用に応じて ${max} まで拡張されます`,
  fitSpilled: detail => `${detail}（GPU メモリに収まらず、システムメモリを使うため動作が遅くなります）`,
  title: 'ローカルモデル',
  runtimeTitle: 'ローカルランタイム',
  runtimeReady: backend => `準備完了 · ${backend}`,
  serverRunning: '実行中',
  runtimeInstalled: 'llama.cpp ランタイムをインストール済み',
  runtimeInstalledDetail: (tag, backend) =>
    `ビルド ${tag}、${backend} バックエンド。サーバーは Hermes が起動・管理します。`,
  installTitle: 'ローカルランタイムをインストール',
  installDetail:
    'llama.cpp 推論エンジン（数百 MB）をダウンロードします。ダウンロードしたモデルはすべてこのマシン上で動作します——アカウント不要、データが外部に送られることはありません。',
  installAction: 'ランタイムをインストール',
  installing: 'ランタイムをインストール中…',
  installFailed: 'ランタイムのインストールに失敗しました',
  hardwareTitle: 'このマシン',
  hardwareLoading: 'ハードウェアを確認中…',
  vram: label => `GPU メモリ ${label}`,
  ram: label => `RAM ${label}`,
  unifiedMemory: 'ユニファイドメモリ',
  modelsTitle: 'モデル',
  recommended: 'おすすめ',
  recommendedReason: {
    'best-quality-resident':
      'GPU に完全に載り、フルスピードで動くモデルの中で最高品質です。おすすめは品質とこのハードウェアでの予測速度を両立させて選ばれます。',
    'speed-gated-quality':
      'より高品質なモデルもこのマシンに載りますが、メモリ帯域の制約で応答が遅くなります — これは速度を保てる最良のモデルです。',
    'product-default': 'このマシンのメーカーが選んだ標準モデルです。'
  } as Record<string, string>,
  noRecommendationTitle: 'このマシン向けの自動推奨モデルはありません',
  noRecommendationDetail:
    '自動セットアップには、GPU メモリまたはユニファイドメモリに完全に載り、フルスピードで動く厳選モデルが必要です。下の一覧から選ぶか、ほかのモデルを探すこともできます。',
  noRecommendationAction: 'モデルを探す',
  downloaded: 'ダウンロード済み',
  downloadAction: size => `ダウンロード · ${size}`,
  downloadProgress: (done, total) => `${done} / ${total}`,
  downloadStatusRunning: 'ダウンロード中',
  downloadSpeed: rate => `${rate}`,
  downloadEta: time => `残り約${time}`,
  downloadPausedLabel: '一時停止中',
  downloadPauseAction: '一時停止',
  downloadResumeAction: '再開',
  downloadDoneToast: model => `${model} の準備ができました。`,
  installDoneToast: 'ローカルランタイムのインストールが完了しました。',
  quickstartTitle: 'このマシンでモデルを実行する',
  quickstartDetail: (model, size) =>
    `ワンクリックで全てを設定します：ローカルエンジン、${model} (${size}ダウンロード）、および新しいチャットのデフォルト設定。何もこのコンピュータを離れません。`,
  quickstartDetailReady: model =>
    `ワンクリックで作る${model}新しいチャットのデフォルトです。すべてはこのマシンで動作します。`,
  quickstartAction: '私のためにセットアップしてください',
  quickstartConfigure: '自分で選ぶ',
  quickstartDoneToast: model => `${model}設定されています — 新しいチャットはこのマシンで実行されます。`,
  quickstartFailed: 'ローカルモデルのセットアップに失敗しました',
  quickstartStageEngine: 'エンジン',
  quickstartStageModel: 'モデル',
  quickstartStageFinish: '終了',
  useAction: '使用する',
  activePill: 'デフォルト',
  updateTitle: 'エンジンの更新があります',
  updateDetail: (next, current) =>
    `新しい llama.cpp ビルド（${next}）をインストールできます——現在は ${current} です。ダウンロード中もモデルは引き続き使えます。`,
  updateAction: 'エンジンを更新',
  updating: 'エンジンを更新中…',
  upToDateTitle: 'エンジンは最新です',
  upToDateDetail: (tag, backend) => `llama.cpp ${tag}（${backend}）で動作中——Hermes が提供する最新ビルドです。`,
  activeDetail: '新しいチャットはこのモデルを使用——最初のメッセージ送信時に読み込みます',
  activeNotLoaded: '最初のメッセージで読み込みます',
  loadedPill: '読み込み済み',
  placementResident: 'すべて GPU 上',
  placementSpilled: '一部 RAM 上',
  placementResidentTip: 'このコンテキストウィンドウで GPU メモリ内で完全に動作しています — フルスピード。',
  placementSpilledTip:
    'モデルの一部がシステム RAM から動作しています — 動作しますが遅くなります。よりコンパクトなビルドか小さいコンテキストなら完全に収まります。',
  loadingPill: '読み込み中…',
  ejectTip: 'GPU メモリを解放（必要時に再読み込み）',
  ejected: 'モデルをアンロードしました——GPU メモリを解放しました。',
  ejectFailed: 'モデルをアンロードできませんでした',
  stopServer: 'オフにする',
  startServer: 'オンにする',
  runtimeRunningDetail:
    'ローカルサーバーが実行中です。オフにすると GPU メモリを全て解放し、再度オンにするまで新しいチャットはローカルモデルを使用しません。',
  serverStopped: 'ローカルサーバーを停止しました——GPU メモリを解放しました。',
  serverStarted: 'ローカルサーバー実行中。',
  serverStopFailed: 'ローカルサーバーを停止できませんでした',
  serverStartFailed: 'ローカルサーバーを起動できませんでした',
  activating: '起動中…',
  activateFailed: model => `${model} への切り替えに失敗しました`,
  activateDoneToast: model => `新しいチャットは ${model} を使用します。`,
  downloadFailed: model => `${model} のダウンロードに失敗しました`,
  pillFitsGpu: 'GPU に完全に収まります',
  pillUsesRam: 'システム RAM を使用',
  pillTooBig: 'このマシンには大きすぎます',
  browseTitle: 'さらにモデルを探す',
  browseHint:
    'Hugging Face 全体を検索できます。ここでダウンロードしたモデルは自動でマシンに合わせて動作しますが、当方でのテストは行われていません。',
  browsePlaceholder: 'モデル名または作者で検索…',
  browseSearching: 'Hugging Face を検索中',
  browseListing: 'モデルファイルを読み込み中',
  browseShowFiles: 'ファイルを表示',
  browseRefresh: '更新',
  browseDownloads: 'ダウンロード',
  browseLikes: 'いいね',
  browseGated: 'Hugging Face へのサインインが必要',
  browseNoGguf: '互換性のあるモデルファイルが見つかりません。',
  browseFitUnknown: '適合状況は不明',
  browseAlreadyDownloaded: 'ダウンロード済みです。',
  addedByYou: 'あなたが追加',
  browseDownloadStarted: '{name} をダウンロード中',
  browseDownloadAria: '{name} をダウンロード',
  sideloadButton: 'モデルファイルを追加',
  sideloadTitle: 'GGUF モデルファイルを選択',
  sideloadDone: '{name} を追加しました。',
  sideloadAlreadyPresent: '既にライブラリにあります。',
  pillFullContext: max => `フル ${max} コンテキスト`,
  pillFullContextTip: '最初からモデルの完全なコンテキストウィンドウで動作します',
  pillUpTo: max => `最大 ${max} コンテキスト`,
  pillGrowsTip: '会話が必要とするにつれて自動的に拡張します',
  pillVision: '画像対応',
  deleteAction: 'モデルを削除',
  deleteConfirm: model => `${model} をディスクから削除しますか？`,
  deleted: model => `${model} を削除しました。`,
  deleteFailed: '削除に失敗しました',
  connectionChanged: 'ローカルモデルの接続が変更されました'
}
