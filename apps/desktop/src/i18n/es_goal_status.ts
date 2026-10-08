import type { TranslationOverrides } from './define-locale'

// Desktop renderings of the backend's goal status lines (see
// types_goal_status.ts), spread into es.ts.
export const esGoalStatus = {
  goalStatus: {
    standingGoal: 'Objetivo permanente',
    waitTargets: {
      session: id => `sesión ${id}`,
      pid: pid => `proceso ${pid}`,
      remaining: seconds => `${seconds} s restantes`,
      seconds: seconds => `${seconds} s`
    },
    parkedWaitingOn: (target, reason, byJudge) =>
      `Objetivo en espera${byJudge ? ' (juez)' : ''} — ${target}: ${reason}`,
    parkedOnPid: (pid, reason) =>
      `Objetivo en espera del proceso ${pid}${reason ? ` (${reason})` : ''}. El bucle se pausa hasta que termine.`,
    parkedStatus: (reason, meta, goal) => `Objetivo (en espera: ${reason}, ${meta}): ${goal}`,
    parkedCountdownStatus: (seconds, reason, meta, goal) =>
      `Objetivo (en espera ${seconds} s — ${reason}, ${meta}): ${goal}`,
    meta: {
      turns: (used, max) => `${used}/${max} turnos`,
      subgoals: count => `${count} ${count === 1 ? 'subobjetivo' : 'subobjetivos'}`,
      contract: 'contrato',
      gates: count => `${count} ${count === 1 ? 'control' : 'controles'}`,
      separator: ', '
    },
    set: (budget, goal) => `Objetivo establecido (presupuesto de ${budget} turnos): ${goal}`,
    replacedPrevious: '(se reemplazó el objetivo anterior)',
    previousWas: previous => `antes: ${previous}`,
    contractLabel: 'Contrato de finalización:',
    draftedContractLabel: 'Borrador del contrato de finalización:',
    judgeTrailer: againstContract =>
      `Tras cada turno, un modelo juez comprueba si el objetivo está cumplido${againstContract ? ' según el contrato de arriba' : ''}. Hermes sigue trabajando hasta que lo esté, hasta que lo pauses o lo borres, o hasta agotar el presupuesto. Usa /goal status, /goal show, /goal pause, /goal resume, /goal clear.`,
    draftTightenHint:
      'Ajusta cualquier campo volviendo a establecer el objetivo con líneas en línea (p. ej. verify: <comando>) y luego /goal resume. Usa /goal show para revisarlo.',
    draftFailed:
      'No se pudo redactar un contrato (modelo auxiliar no disponible); se ejecuta como objetivo libre. El juez por turno sigue aplicándose.',
    ignoredControlWords: rest =>
      `(se ignoró ${rest}: un comando de control nunca establece el texto del objetivo; usa /goal -- <texto> cuando el objetivo empiece de verdad con una palabra de control.)`,
    paused: goal => `Objetivo en pausa: ${goal}`,
    resumed: goal => `Objetivo reanudado: ${goal}`,
    cleared: 'Objetivo borrado.',
    noActiveGoal: 'No hay ningún objetivo activo.',
    noActiveGoalHint: 'No hay ningún objetivo activo. Establece uno con /goal <texto>.',
    noGoalSet: 'No hay ningún objetivo establecido.',
    noGoalToResume: 'No hay ningún objetivo que reanudar.',
    waitBarrierCleared: 'Barrera de espera eliminada; el bucle del objetivo se reanuda.',
    noWaitBarrier: 'No hay ninguna barrera de espera.',
    activeStatus: (meta, goal) => `Objetivo (activo, ${meta}): ${goal}`,
    pausedStatus: (meta, reason, goal) => `Objetivo (en pausa, ${meta}${reason ? ` — ${reason}` : ''}): ${goal}`,
    doneStatus: (meta, goal) => `Objetivo completado (${meta}): ${goal}`,
    noContract: '(sin contrato de finalización; establece uno con /goal draft <objetivo> o con líneas campo: valor)',
    noActiveGoalParen: '(sin objetivo activo)',
    continuing: (used, max, reason) => `Avanzando hacia el objetivo (${used}/${max}): ${reason}`,
    achieved: reason => `Objetivo logrado: ${reason}`,
    pausedBudget: (used, max, gateStillFailing) =>
      `Objetivo en pausa: ${used}/${max} turnos usados${gateStillFailing ? ' (un control de calidad sigue fallando)' : ''}. Usa /goal resume para continuar o /goal clear para parar.`,
    pausedGatesNotRun: refusal =>
      `Objetivo en pausa: no se ejecutaron los controles de calidad: ${refusal}. Arregla el espacio de trabajo o quita los controles con /goal gate remove y luego /goal resume.`,
    pausedGateFailing: (retries, command, exitCode) =>
      `Objetivo en pausa: un control de calidad sigue fallando tras ${retries} reintentos: $ ${command} (salida ${exitCode}). Arréglalo a mano o quítalo con /goal gate remove y luego /goal resume.`,
    pausedJudgeErrors: (turns, configPath) =>
      `Objetivo en pausa: la API del juez devolvió errores (${turns} turnos). Revisa el proveedor/clave de goal_judge en ${configPath}`,
    pausedJudgeUnparseable: (turns, configPath) =>
      `Objetivo en pausa: el modelo juez (${turns} turnos) no devuelve el veredicto JSON requerido. Dirige el juez a un modelo más estricto en ${configPath}`,
    thenResume: 'Luego /goal resume para continuar.',
    unachievable: reason =>
      `Objetivo considerado inalcanzable; en pausa: ${reason} Redefínelo con /goal set o fuerza la continuación con /goal resume.`,
    gateAdded: (command, retries, timeout) =>
      `Control añadido: $ ${command} (${retries} reintentos, ${timeout} s de tiempo límite). Debe superarse antes de que el objetivo pueda completarse.`,
    gateRemoved: command => `Control quitado: $ ${command}`,
    gatesCleared: count => `Se ${count === 1 ? 'borró 1 control' : `borraron ${count} controles`}.`,
    noGates: '(sin controles de calidad; exige uno con /goal gate add <comando>)',
    gateListItem: (index, command, status) => `- ${index}. $ ${command}${status ? ` ${status}` : ''}`,
    gatePassing: '✓ supera',
    gateFailing: (exitCode, attempt, maxRetries) => `✗ falla (salida ${exitCode}, intento ${attempt}/${maxRetries})`
  }
} satisfies Pick<TranslationOverrides, 'goalStatus'>
