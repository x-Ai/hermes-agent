import { atom } from 'nanostores'

/** Invalidates the focused session's context snapshot after config.yaml changes. */
export const $contextBreakdownConfigRevision = atom(0)

export function invalidateContextBreakdownForConfig(): void {
  $contextBreakdownConfigRevision.set($contextBreakdownConfigRevision.get() + 1)
}
