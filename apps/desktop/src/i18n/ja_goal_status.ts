import type { TranslationOverrides } from './define-locale'

// Desktop renderings of the backend's goal status lines (see
// types_goal_status.ts), spread into ja.ts.
export const jaGoalStatus = {
  goalStatus: {
    standingGoal: '継続中の目標',
    waitTargets: {
      session: id => `セッション ${id}`,
      pid: pid => `プロセス ${pid}`,
      remaining: seconds => `残り ${seconds} 秒`,
      seconds: seconds => `${seconds} 秒`
    },
    parkedWaitingOn: (target, reason, byJudge) =>
      `目標は待機中${byJudge ? '（判定）' : ''} — ${target} を待っています: ${reason}`,
    parkedOnPid: (pid, reason) =>
      `目標は待機中 — プロセス ${pid}${reason ? `（${reason}）` : ''} を待っています。終了するまでループは一時停止します`,
    parkedStatus: (reason, meta, goal) => `目標（待機中: ${reason}、${meta}）: ${goal}`,
    parkedCountdownStatus: (seconds, reason, meta, goal) =>
      `目標（待機中 — 残り ${seconds} 秒、${reason}、${meta}）: ${goal}`,
    meta: {
      turns: (used, max) => `${used}/${max} ターン`,
      subgoals: count => `サブ目標 ${count} 件`,
      contract: '契約あり',
      gates: count => `ゲート ${count} 件`,
      separator: '、'
    },
    set: (budget, goal) => `目標を設定しました（${budget} ターンの予算）: ${goal}`,
    replacedPrevious: '（以前の目標を置き換えました）',
    previousWas: previous => `以前: ${previous}`,
    contractLabel: '完了契約:',
    draftedContractLabel: '下書きした完了契約:',
    judgeTrailer: againstContract =>
      `各ターンの後、判定モデルが目標の達成を${againstContract ? '上の契約に照らして' : ''}確認します。達成されるか、一時停止 / クリアされるか、予算を使い切るまで Hermes は作業を続けます。/goal status、/goal show、/goal pause、/goal resume、/goal clear が使えます`,
    draftTightenHint:
      'インライン行（例: verify: <コマンド>）で目標を設定し直せば各フィールドを絞り込めます。その後 /goal resume を実行してください。確認には /goal show を使います',
    draftFailed:
      '契約を下書きできませんでした（補助モデルが利用不可）— 自由形式の目標として実行します。ターンごとの判定は引き続き適用されます',
    ignoredControlWords: rest =>
      `（${rest} を無視しました: 制御コマンドは目標テキストを設定しません。目標が本当に制御語で始まる場合は /goal -- <テキスト> を使ってください）`,
    paused: goal => `目標を一時停止しました: ${goal}`,
    resumed: goal => `目標を再開しました: ${goal}`,
    cleared: '目標をクリアしました',
    noActiveGoal: 'アクティブな目標はありません',
    noActiveGoalHint: 'アクティブな目標はありません。/goal <テキスト> で設定してください',
    noGoalSet: '目標は設定されていません',
    noGoalToResume: '再開する目標はありません',
    waitBarrierCleared: '待機バリアを解除しました — 目標ループを再開します',
    noWaitBarrier: '待機バリアは設定されていません',
    activeStatus: (meta, goal) => `目標（進行中、${meta}）: ${goal}`,
    pausedStatus: (meta, reason, goal) => `目標（一時停止中、${meta}${reason ? ` — ${reason}` : ''}）: ${goal}`,
    doneStatus: (meta, goal) => `目標達成（${meta}）: ${goal}`,
    noContract:
      '（完了契約はありません — /goal draft <目的> またはインラインの「フィールド: 値」行で設定してください）',
    noActiveGoalParen: '（アクティブな目標なし）',
    continuing: (used, max, reason) => `目標に向けて続行中（${used}/${max}）: ${reason}`,
    achieved: reason => `目標を達成しました: ${reason}`,
    pausedBudget: (used, max, gateStillFailing) =>
      `目標を一時停止しました — ${used}/${max} ターンを使用${gateStillFailing ? '（品質ゲートがまだ失敗しています）' : ''}。続けるには /goal resume、終了するには /goal clear を実行してください`,
    pausedGatesNotRun: refusal =>
      `目標を一時停止しました — 品質ゲートを実行できませんでした: ${refusal}。ワークスペースを修正するか /goal gate remove でゲートを外し、/goal resume を実行してください`,
    pausedGateFailing: (retries, command, exitCode) =>
      `目標を一時停止しました — 品質ゲートが ${retries} 回の再試行後も失敗しています: $ ${command}（終了コード ${exitCode}）。手動で修正するか /goal gate remove で外し、/goal resume を実行してください`,
    pausedJudgeErrors: (turns, configPath) =>
      `目標を一時停止しました — 判定 API が ${turns} ターン連続でエラーを返しました。goal_judge のプロバイダー / キーを確認してください: ${configPath}`,
    pausedJudgeUnparseable: (turns, configPath) =>
      `目標を一時停止しました — 判定モデルが ${turns} ターン連続で必要な JSON 判定を返していません。より厳密なモデルに判定を切り替えてください: ${configPath}`,
    thenResume: 'その後 /goal resume で続行してください',
    unachievable: reason =>
      `目標は達成不可能と判定され、一時停止しました: ${reason} /goal set で範囲を見直すか、/goal resume で上書きしてください`,
    gateAdded: (command, retries, timeout) =>
      `ゲートを追加しました: $ ${command}（再試行 ${retries} 回、タイムアウト ${timeout} 秒）。目標の完了前に通過する必要があります`,
    gateRemoved: command => `ゲートを削除しました: $ ${command}`,
    gatesCleared: count => `${count} 件のゲートをクリアしました`,
    noGates: '（品質ゲートはありません — /goal gate add <コマンド> で追加できます）',
    gateListItem: (index, command, status) => `- ${index}. $ ${command}${status ? ` ${status}` : ''}`,
    gatePassing: '✓ 通過',
    gateFailing: (exitCode, attempt, maxRetries) => `✗ 失敗（終了コード ${exitCode}、試行 ${attempt}/${maxRetries}）`
  }
} satisfies Pick<TranslationOverrides, 'goalStatus'>
