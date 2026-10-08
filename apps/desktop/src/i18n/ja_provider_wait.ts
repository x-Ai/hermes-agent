import type { ProviderWaitThreadCopy } from './types_provider_wait'

// Backend wait / retry status lines (see types_provider_wait.ts), spread into
// `assistant.thread` in ja.ts.
export const jaProviderWait: ProviderWaitThreadCopy = {
  modelContinuing: (attempt, maxAttempts) =>
    `モデルが思考内容のみを返し、最終回答がないため、続きを要求しています（${attempt}/${maxAttempts}）`,
  providerReconnecting: (elapsedSeconds, kind) =>
    `プロバイダーから${kind === 'output' ? '出力' : '応答'}がないまま ${elapsedSeconds} 秒経過したため、再接続しています…`,
  providerRetrying: (retrySeconds, attempt, maxAttempts) =>
    `プロバイダーを待っています — ${retrySeconds} 秒後に再試行（${attempt}/${maxAttempts} 回目）`,
  providerRetryReasons: {
    rate_limited: 'レート制限中',
    overloaded: 'プロバイダーが過負荷',
    free_model_busy: '無料モデルが混み合っています'
  },
  providerRetryingAfter: (reason, resetWindow, retrySeconds, attempt, maxAttempts) =>
    `${reason} — ${resetWindow ? `${resetWindow} 後にリセット、` : ''}${retrySeconds} 秒後に再試行（${attempt}/${maxAttempts} 回目）`,
  providerAutoRecovering: (retrySeconds, cycle, total, stopHint) =>
    `プロバイダーが一時的に利用できません — ${retrySeconds} 秒後に自動で再試行します（サイクル ${cycle}/${total}）${
      stopHint ? ` — ${stopHint}` : ''
    }`,
  providerStopHints: {
    esc: '停止するには Esc を押してください',
    cancelRequest: '停止するにはリクエストをキャンセルしてください',
    stopCommand: 'キャンセルするには /stop を送信してください'
  },
  providerWaitPhases: {
    first_event: seconds => `最初のプロバイダーイベントを ${seconds} 秒待機中`,
    reconnect: seconds => `再接続後、最初のプロバイダーイベントを ${seconds} 秒待機中`,
    pre_progress: seconds =>
      `プロバイダーのストリームは開いていますが、${seconds} 秒間モデルの実質的な進捗がありません`,
    post_event: seconds => `プロバイダーのストリームは動作中ですが、${seconds} 秒間ストリームイベントがありません`,
    first_chunk: seconds => `最初のストリームチャンクを ${seconds} 秒待機中`,
    post_chunk: seconds => `ストリームは開いていますが、${seconds} 秒間ストリーム出力がありません`
  },
  providerWaitNotice: (model, phaseText, watchdog, stillWaiting) =>
    `${model} を${stillWaiting ? '引き続き' : ''}待っています — ${phaseText}${
      watchdog ? `（自動再接続: ${watchdog.label} ウォッチドッグが ${watchdog.seconds} 秒後に作動）` : ''
    }`
}
