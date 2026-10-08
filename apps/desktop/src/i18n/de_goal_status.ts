import type { TranslationOverrides } from './define-locale'

// Desktop renderings of the backend's goal status lines (see
// types_goal_status.ts), spread into de.ts.
export const deGoalStatus = {
  goalStatus: {
    standingGoal: 'Laufendes Ziel',
    waitTargets: {
      session: id => `Session ${id}`,
      pid: pid => `Prozess ${pid}`,
      remaining: seconds => `noch ${seconds}s`,
      seconds: seconds => `${seconds}s`
    },
    parkedWaitingOn: (target, reason, byJudge) =>
      `Ziel wartet${byJudge ? ' (Richter)' : ''} — auf ${target}: ${reason}`,
    parkedOnPid: (pid, reason) =>
      `Ziel wartet auf Prozess ${pid}${reason ? ` (${reason})` : ''}. Die Schleife pausiert, bis er beendet ist.`,
    parkedStatus: (reason, meta, goal) => `Ziel (wartet auf ${reason}, ${meta}): ${goal}`,
    parkedCountdownStatus: (seconds, reason, meta, goal) => `Ziel (wartet ${seconds}s — ${reason}, ${meta}): ${goal}`,
    meta: {
      turns: (used, max) => `${used}/${max} Runden`,
      subgoals: count => `${count} Teilziel${count === 1 ? '' : 'e'}`,
      contract: 'Vertrag',
      gates: count => `${count} Gate${count === 1 ? '' : 's'}`,
      separator: ', '
    },
    set: (budget, goal) => `Ziel gesetzt (Budget: ${budget} Runden): ${goal}`,
    replacedPrevious: '(vorheriges Ziel ersetzt)',
    previousWas: previous => `war: ${previous}`,
    contractLabel: 'Abschlussvertrag:',
    draftedContractLabel: 'Entworfener Abschlussvertrag:',
    judgeTrailer: againstContract =>
      `Nach jeder Runde prüft ein Richter-Modell, ob das Ziel erreicht ist${againstContract ? ' – gemessen am Vertrag oben' : ''}. Hermes arbeitet weiter, bis es erreicht ist, du es pausierst/löschst oder das Budget erschöpft ist. Nutze /goal status, /goal show, /goal pause, /goal resume, /goal clear.`,
    draftTightenHint:
      'Schärfe ein Feld nach, indem du das Ziel mit Inline-Zeilen neu setzt (z. B. verify: <Befehl>), dann /goal resume. Mit /goal show prüfen.',
    draftFailed:
      'Konnte keinen Vertrag entwerfen (Hilfsmodell nicht verfügbar) – läuft als freies Ziel. Der Richter pro Runde gilt weiterhin.',
    ignoredControlWords: rest =>
      `(${rest} ignoriert: ein Steuerbefehl setzt nie den Zieltext – nutze /goal -- <Text>, wenn das Ziel wirklich mit einem Steuerwort beginnt.)`,
    paused: goal => `Ziel pausiert: ${goal}`,
    resumed: goal => `Ziel fortgesetzt: ${goal}`,
    cleared: 'Ziel gelöscht.',
    noActiveGoal: 'Kein aktives Ziel.',
    noActiveGoalHint: 'Kein aktives Ziel. Setze eines mit /goal <Text>.',
    noGoalSet: 'Kein Ziel gesetzt.',
    noGoalToResume: 'Kein Ziel zum Fortsetzen.',
    waitBarrierCleared: 'Wartebarriere aufgehoben – die Ziel-Schleife läuft weiter.',
    noWaitBarrier: 'Keine Wartebarriere gesetzt.',
    activeStatus: (meta, goal) => `Ziel (aktiv, ${meta}): ${goal}`,
    pausedStatus: (meta, reason, goal) => `Ziel (pausiert, ${meta}${reason ? ` – ${reason}` : ''}): ${goal}`,
    doneStatus: (meta, goal) => `Ziel erledigt (${meta}): ${goal}`,
    noContract: '(kein Abschlussvertrag – setze einen mit /goal draft <Ziel> oder Inline-Zeilen der Form Feld: Wert)',
    noActiveGoalParen: '(kein aktives Ziel)',
    continuing: (used, max, reason) => `Weiter Richtung Ziel (${used}/${max}): ${reason}`,
    achieved: reason => `Ziel erreicht: ${reason}`,
    pausedBudget: (used, max, gateStillFailing) =>
      `Ziel pausiert – ${used}/${max} Runden verbraucht${gateStillFailing ? ' (ein Quality Gate schlägt weiterhin fehl)' : ''}. /goal resume zum Weitermachen, /goal clear zum Beenden.`,
    pausedGatesNotRun: refusal =>
      `Ziel pausiert – Quality Gates nicht ausgeführt: ${refusal}. Repariere den Arbeitsbereich oder entferne die Gates mit /goal gate remove, dann /goal resume.`,
    pausedGateFailing: (retries, command, exitCode) =>
      `Ziel pausiert – Quality Gate schlägt nach ${retries} Wiederholungen weiterhin fehl: $ ${command} (Exit ${exitCode}). Behebe es manuell oder entferne es mit /goal gate remove, dann /goal resume.`,
    pausedJudgeErrors: (turns, configPath) =>
      `Ziel pausiert – die Richter-API lieferte Fehler (${turns} Runden). Prüfe Provider/Key von goal_judge in ${configPath}`,
    pausedJudgeUnparseable: (turns, configPath) =>
      `Ziel pausiert – das Richter-Modell (${turns} Runden) liefert nicht das geforderte JSON-Urteil. Leite den Richter auf ein strengeres Modell um in ${configPath}`,
    thenResume: 'Dann /goal resume zum Fortsetzen.',
    unachievable: reason =>
      `Ziel als unerreichbar beurteilt – pausiert: ${reason} Mit /goal set neu zuschneiden oder mit /goal resume übersteuern.`,
    gateAdded: (command, retries, timeout) =>
      `Gate hinzugefügt: $ ${command} (${retries} Wiederholungen, ${timeout}s Timeout). Es muss bestehen, bevor das Ziel abgeschlossen werden kann.`,
    gateRemoved: command => `Gate entfernt: $ ${command}`,
    gatesCleared: count => `${count} Gate${count === 1 ? '' : 's'} gelöscht.`,
    noGates: '(keine Quality Gates – mit /goal gate add <Befehl> eines verlangen)',
    gateListItem: (index, command, status) => `- ${index}. $ ${command}${status ? ` ${status}` : ''}`,
    gatePassing: '✓ besteht',
    gateFailing: (exitCode, attempt, maxRetries) =>
      `✗ schlägt fehl (Exit ${exitCode}, Versuch ${attempt}/${maxRetries})`
  }
} satisfies Pick<TranslationOverrides, 'goalStatus'>
