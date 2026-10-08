import type { TranslationOverrides } from './define-locale'

// Desktop renderings of the backend's goal status lines (see
// types_goal_status.ts), spread into zh.ts.
export const zhGoalStatus = {
  goalStatus: {
    standingGoal: '当前目标',
    waitTargets: {
      session: id => `会话 ${id}`,
      pid: pid => `进程 ${pid}`,
      remaining: seconds => `剩余 ${seconds} 秒`,
      seconds: seconds => `${seconds} 秒`
    },
    parkedWaitingOn: (target, reason, byJudge) =>
      `目标等待中${byJudge ? '（判定器）' : ''}，等待对象：${target}，原因：${reason}`,
    parkedOnPid: (pid, reason) => `目标等待中，等待进程 ${pid}${reason ? `（${reason}）` : ''}，该进程退出后循环继续`,
    parkedStatus: (reason, meta, goal) => `目标（等待中，等待对象：${reason}，${meta}）：${goal}`,
    parkedCountdownStatus: (seconds, reason, meta, goal) =>
      `目标（等待中，还需 ${seconds} 秒，${reason}，${meta}）：${goal}`,
    meta: {
      turns: (used, max) => `${used}/${max} 轮`,
      subgoals: count => `${count} 个子目标`,
      contract: '含契约',
      gates: count => `${count} 个关卡`,
      separator: '，'
    },
    set: (budget, goal) => `已设定目标（${budget} 轮预算）：${goal}`,
    replacedPrevious: '（已替换之前的目标）',
    previousWas: previous => `原目标：${previous}`,
    contractLabel: '完成契约：',
    draftedContractLabel: '已起草的完成契约：',
    judgeTrailer: againstContract =>
      `每轮结束后，判定模型会检查目标是否已完成${againstContract ? '（依据上方契约）' : ''}，Hermes 会持续工作，直到目标完成、你暂停或清除目标，或预算耗尽，可使用 /goal status、/goal show、/goal pause、/goal resume、/goal clear`,
    draftTightenHint:
      '可用内联字段行（例如 verify: <命令>）重新设定目标以收紧任一字段，然后执行 /goal resume，使用 /goal show 查看',
    draftFailed: '无法起草契约（辅助模型不可用），将按自由形式目标运行，每轮判定仍然生效',
    ignoredControlWords: rest =>
      `（已忽略 ${rest}：控制命令不会设定目标文本，若目标确实以控制词开头，请使用 /goal -- <文本>）`,
    paused: goal => `目标已暂停：${goal}`,
    resumed: goal => `目标已恢复：${goal}`,
    cleared: '目标已清除',
    noActiveGoal: '没有活跃的目标',
    noActiveGoalHint: '没有活跃的目标，使用 /goal <文本> 设定一个',
    noGoalSet: '未设定目标',
    noGoalToResume: '没有可恢复的目标',
    waitBarrierCleared: '等待屏障已清除，目标循环继续',
    noWaitBarrier: '未设置等待屏障',
    activeStatus: (meta, goal) => `目标（进行中，${meta}）：${goal}`,
    pausedStatus: (meta, reason, goal) => `目标（已暂停，${meta}${reason ? `，${reason}` : ''}）：${goal}`,
    doneStatus: (meta, goal) => `目标已完成（${meta}）：${goal}`,
    noContract: '（没有完成契约，可用 /goal draft <目标> 或内联的"字段: 值"行设定）',
    noActiveGoalParen: '（没有活跃的目标）',
    continuing: (used, max, reason) => `继续推进目标（${used}/${max}）：${reason}`,
    achieved: reason => `目标已达成：${reason}`,
    pausedBudget: (used, max, gateStillFailing) =>
      `目标已暂停，已用 ${used}/${max} 轮${gateStillFailing ? '（仍有质量关卡未通过）' : ''}，使用 /goal resume 继续，或 /goal clear 停止`,
    pausedGatesNotRun: refusal =>
      `目标已暂停，质量关卡未运行：${refusal}，请修复工作区或用 /goal gate remove 移除关卡，然后执行 /goal resume`,
    pausedGateFailing: (retries, command, exitCode) =>
      `目标已暂停，质量关卡在 ${retries} 次重试后仍未通过：$ ${command}（退出码 ${exitCode}），请手动修复或用 /goal gate remove 移除，然后执行 /goal resume`,
    pausedJudgeErrors: (turns, configPath) =>
      `目标已暂停，判定 API 连续 ${turns} 轮返回错误，请检查 goal_judge 的提供商/密钥设置：${configPath}`,
    pausedJudgeUnparseable: (turns, configPath) =>
      `目标已暂停，判定模型连续 ${turns} 轮未返回要求的 JSON 判定结果，请在此处将判定器切换到更严格的模型：${configPath}`,
    thenResume: '然后执行 /goal resume 继续',
    unachievable: reason =>
      `目标被判定为无法达成，已暂停：${reason} 可用 /goal set 重新界定范围，或用 /goal resume 强制继续`,
    gateAdded: (command, retries, timeout) =>
      `已添加关卡：$ ${command}（${retries} 次重试，${timeout} 秒超时），目标完成前必须通过`,
    gateRemoved: command => `已移除关卡：$ ${command}`,
    gatesCleared: count => `已清除 ${count} 个关卡`,
    noGates: '（没有质量关卡，使用 /goal gate add <命令> 添加）',
    gateListItem: (index, command, status) => `- ${index}. $ ${command}${status ? ` ${status}` : ''}`,
    gatePassing: '✓ 通过',
    gateFailing: (exitCode, attempt, maxRetries) => `✗ 未通过（退出码 ${exitCode}，第 ${attempt}/${maxRetries} 次尝试）`
  }
} satisfies Pick<TranslationOverrides, 'goalStatus'>
