import type { Translations } from '@/i18n'
import { localizeGoalStatusText } from '@/lib/goal-status-localization'

// Slash commands whose backend output the transcript re-renders in the user's
// language, keyed by the command token the system line carries. Only
// producer-owned status lines are rewritten; anything else prints as the
// backend wrote it.
const OUTPUT_LOCALIZERS: Readonly<Record<string, (output: string, t: Translations) => string>> = {
  '/goal': (output, t) =>
    output
      .split('\n')
      .map(line => localizeGoalStatusText(line, t))
      .join('\n')
}

export function localizeSlashOutput(command: string, output: string, t: Translations): string {
  const localize = OUTPUT_LOCALIZERS[command.trim().split(/\s+/u)[0] ?? '']

  return localize ? localize(output, t) : output
}
