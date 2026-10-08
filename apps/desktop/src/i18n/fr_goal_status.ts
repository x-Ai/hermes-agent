import type { TranslationOverrides } from './define-locale'

// Desktop renderings of the backend's goal status lines (see
// types_goal_status.ts), spread into fr.ts.
export const frGoalStatus = {
  goalStatus: {
    standingGoal: 'Objectif permanent',
    waitTargets: {
      session: id => `session ${id}`,
      pid: pid => `processus ${pid}`,
      remaining: seconds => `${seconds} s restantes`,
      seconds: seconds => `${seconds} s`
    },
    parkedWaitingOn: (target, reason, byJudge) =>
      `Objectif en attente${byJudge ? ' (juge)' : ''} — ${target} : ${reason}`,
    parkedOnPid: (pid, reason) =>
      `Objectif en attente du processus ${pid}${reason ? ` (${reason})` : ''}. La boucle est en pause jusqu'à sa fin.`,
    parkedStatus: (reason, meta, goal) => `Objectif (en attente : ${reason}, ${meta}) : ${goal}`,
    parkedCountdownStatus: (seconds, reason, meta, goal) =>
      `Objectif (en attente ${seconds} s — ${reason}, ${meta}) : ${goal}`,
    meta: {
      turns: (used, max) => `${used}/${max} tours`,
      subgoals: count => `${count} sous-objectif${count === 1 ? '' : 's'}`,
      contract: 'contrat',
      gates: count => `${count} contrôle${count === 1 ? '' : 's'}`,
      separator: ', '
    },
    set: (budget, goal) => `Objectif défini (budget de ${budget} tours) : ${goal}`,
    replacedPrevious: "(l'objectif précédent a été remplacé)",
    previousWas: previous => `avant : ${previous}`,
    contractLabel: "Contrat d'achèvement :",
    draftedContractLabel: "Brouillon du contrat d'achèvement :",
    judgeTrailer: againstContract =>
      `Après chaque tour, un modèle juge vérifie si l'objectif est atteint${againstContract ? ' au regard du contrat ci-dessus' : ''}. Hermes continue à travailler jusqu'à ce qu'il le soit, que vous le mettiez en pause ou le supprimiez, ou que le budget soit épuisé. Utilisez /goal status, /goal show, /goal pause, /goal resume, /goal clear.`,
    draftTightenHint:
      "Précisez n'importe quel champ en redéfinissant l'objectif avec des lignes en ligne (p. ex. verify: <commande>), puis /goal resume. Utilisez /goal show pour vérifier.",
    draftFailed:
      "Impossible de rédiger un contrat (modèle auxiliaire indisponible) — exécution en objectif libre. Le juge à chaque tour s'applique toujours.",
    ignoredControlWords: rest =>
      `(${rest} ignoré : une commande de contrôle ne définit jamais le texte de l'objectif — utilisez /goal -- <texte> quand l'objectif commence vraiment par un mot de contrôle.)`,
    paused: goal => `Objectif en pause : ${goal}`,
    resumed: goal => `Objectif repris : ${goal}`,
    cleared: 'Objectif supprimé.',
    noActiveGoal: 'Aucun objectif actif.',
    noActiveGoalHint: 'Aucun objectif actif. Définissez-en un avec /goal <texte>.',
    noGoalSet: 'Aucun objectif défini.',
    noGoalToResume: 'Aucun objectif à reprendre.',
    waitBarrierCleared: "Barrière d'attente levée — la boucle de l'objectif reprend.",
    noWaitBarrier: "Aucune barrière d'attente définie.",
    activeStatus: (meta, goal) => `Objectif (actif, ${meta}) : ${goal}`,
    pausedStatus: (meta, reason, goal) => `Objectif (en pause, ${meta}${reason ? ` — ${reason}` : ''}) : ${goal}`,
    doneStatus: (meta, goal) => `Objectif terminé (${meta}) : ${goal}`,
    noContract:
      "(aucun contrat d'achèvement — définissez-en un avec /goal draft <objectif> ou des lignes champ: valeur)",
    noActiveGoalParen: '(aucun objectif actif)',
    continuing: (used, max, reason) => `Poursuite vers l'objectif (${used}/${max}) : ${reason}`,
    achieved: reason => `Objectif atteint : ${reason}`,
    pausedBudget: (used, max, gateStillFailing) =>
      `Objectif en pause — ${used}/${max} tours utilisés${gateStillFailing ? ' (un contrôle qualité échoue toujours)' : ''}. /goal resume pour continuer, /goal clear pour arrêter.`,
    pausedGatesNotRun: refusal =>
      `Objectif en pause — contrôles qualité non exécutés : ${refusal}. Corrigez l'espace de travail ou retirez les contrôles avec /goal gate remove, puis /goal resume.`,
    pausedGateFailing: (retries, command, exitCode) =>
      `Objectif en pause — un contrôle qualité échoue encore après ${retries} nouvelles tentatives : $ ${command} (code ${exitCode}). Corrigez-le à la main ou retirez-le avec /goal gate remove, puis /goal resume.`,
    pausedJudgeErrors: (turns, configPath) =>
      `Objectif en pause — l'API du juge a renvoyé des erreurs (${turns} tours). Vérifiez le fournisseur/la clé de goal_judge dans ${configPath}`,
    pausedJudgeUnparseable: (turns, configPath) =>
      `Objectif en pause — le modèle juge (${turns} tours) ne renvoie pas le verdict JSON requis. Dirigez le juge vers un modèle plus strict dans ${configPath}`,
    thenResume: 'Puis /goal resume pour continuer.',
    unachievable: reason =>
      `Objectif jugé inatteignable — en pause : ${reason} Redéfinissez-le avec /goal set ou forcez avec /goal resume.`,
    gateAdded: (command, retries, timeout) =>
      `Contrôle ajouté : $ ${command} (${retries} nouvelles tentatives, délai de ${timeout} s). Il doit réussir avant que l'objectif puisse se terminer.`,
    gateRemoved: command => `Contrôle retiré : $ ${command}`,
    gatesCleared: count => `${count} contrôle${count === 1 ? '' : 's'} supprimé${count === 1 ? '' : 's'}.`,
    noGates: '(aucun contrôle qualité — exigez-en un avec /goal gate add <commande>)',
    gateListItem: (index, command, status) => `- ${index}. $ ${command}${status ? ` ${status}` : ''}`,
    gatePassing: '✓ réussit',
    gateFailing: (exitCode, attempt, maxRetries) => `✗ échoue (code ${exitCode}, tentative ${attempt}/${maxRetries})`
  }
} satisfies Pick<TranslationOverrides, 'goalStatus'>
