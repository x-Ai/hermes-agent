import type { ProviderWaitThreadCopy } from './types_provider_wait'

// Backend wait / retry status lines (see types_provider_wait.ts), spread into
// `assistant.thread` in zh.ts.
export const zhProviderWait: ProviderWaitThreadCopy = {
  modelContinuing: (attempt, maxAttempts) =>
    `模型仅返回了思考内容，未给出最终回答，正在请求继续（第 ${attempt}/${maxAttempts} 次）`,
  providerReconnecting: (elapsedSeconds, kind) =>
    `服务商持续 ${elapsedSeconds} 秒未返回${kind === 'output' ? '输出' : '响应'}，正在重新连接…`,
  providerRetrying: (retrySeconds, attempt, maxAttempts) =>
    `正在等待服务商，${retrySeconds} 秒后重试（第 ${attempt}/${maxAttempts} 次）`,
  providerRetryReasons: {
    rate_limited: '已触发限流',
    overloaded: '服务商过载',
    free_model_busy: '免费模型繁忙'
  },
  providerRetryingAfter: (reason, resetWindow, retrySeconds, attempt, maxAttempts) =>
    `${reason}，${resetWindow ? `${resetWindow} 后重置，` : ''}${retrySeconds} 秒后重试（第 ${attempt}/${maxAttempts} 次）`,
  providerAutoRecovering: (retrySeconds, cycle, total, stopHint) =>
    `服务商暂时不可用，${retrySeconds} 秒后自动重试（第 ${cycle}/${total} 轮）${stopHint ? `，${stopHint}` : ''}`,
  providerStopHints: {
    esc: '按 Esc 可停止',
    cancelRequest: '取消请求即可停止',
    stopCommand: '发送 /stop 可取消'
  },
  providerWaitPhases: {
    first_event: seconds => `等待首个服务商事件已 ${seconds} 秒`,
    reconnect: seconds => `重连后等待首个服务商事件已 ${seconds} 秒`,
    pre_progress: seconds => `服务商流已打开，${seconds} 秒内没有实质性的模型进展`,
    post_event: seconds => `服务商流处于活动状态，${seconds} 秒内没有流事件`,
    first_chunk: seconds => `等待首个流数据块已 ${seconds} 秒`,
    post_chunk: seconds => `流已打开，${seconds} 秒内没有流输出`
  },
  providerWaitNotice: (model, phaseText, watchdog, stillWaiting) =>
    `${stillWaiting ? '仍在等待' : '正在等待'} ${model}——${phaseText}${
      watchdog ? `（自动重连：${watchdog.label} 看门狗将在 ${watchdog.seconds} 秒后触发）` : ''
    }`
}
