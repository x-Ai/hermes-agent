/** Hermes' reasoning levels, in ascending order — mirrors the backend's
 *  VALID_REASONING_EFFORTS (hermes_constants.py). `none` is not a level: it's
 *  thinking disabled. */
export const REASONING_EFFORTS = ['minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra'] as const

export type ReasoningEffort = (typeof REASONING_EFFORTS)[number]

/** The scale plus the off state — the full set a config value may hold. */
export const REASONING_EFFORT_VALUES = ['none', ...REASONING_EFFORTS] as const

export type ReasoningEffortValue = (typeof REASONING_EFFORT_VALUES)[number]

/** Hermes' built-in level when neither the surface nor the profile config
 *  specifies one (mirrors the backend's own fallback). */
export const DEFAULT_REASONING_EFFORT: ReasoningEffort = 'medium'

/** True for a real level (case-insensitive, trimmed); `none` is not a level. */
export const isReasoningEffort = (value: string): value is ReasoningEffort =>
  REASONING_EFFORTS.includes(value.trim().toLowerCase() as ReasoningEffort)

/** Canonical low→high ordering for nearest-level clamping — mirrors the backend's
 *  `EFFORT_LADDER` (agent/reasoning_effort.py), `none` included so a published
 *  disable level sorts below every real level. */
export const EFFORT_LADDER: readonly ReasoningEffortValue[] = REASONING_EFFORT_VALUES

/** A route's accepted levels as the gateway reports them (`supported_efforts` /
 *  `reasoning_efforts`), normalized onto the ladder vocabulary. `null` when the
 *  route is unknown OR nothing recognizable was published — callers then keep the
 *  whole ladder, never an empty one. */
export function normalizeSupportedEfforts(
  supported: null | readonly string[] | undefined
): null | ReasoningEffortValue[] {
  if (!supported) {
    return null
  }

  const levels = Array.from(
    new Set(
      supported
        .map(level => level.trim().toLowerCase())
        .filter((level): level is ReasoningEffortValue => EFFORT_LADDER.includes(level as ReasoningEffortValue))
    )
  )

  return levels.length ? levels : null
}

/** The level a route sends for `effort` given its accepted `supported` set — the
 *  backend's `clamp_effort` policy: verbatim when accepted (or when the set is
 *  unknown / the level is bespoke), else the nearest WEAKER accepted level, and
 *  only when nothing weaker exists the weakest accepted one. `none` is never a
 *  degradation target: clamping an enabled ask onto "off" would silently disable
 *  thinking. */
export function clampEffort(effort: string, supported: null | readonly string[] | undefined): string {
  const requested = effort.trim().toLowerCase()
  const accepted = normalizeSupportedEfforts(supported)

  if (!requested || !accepted || accepted.includes(requested as ReasoningEffortValue)) {
    return effort
  }

  if (!EFFORT_LADDER.includes(requested as ReasoningEffortValue)) {
    return effort
  }

  const candidates = accepted.filter(level => level !== 'none')

  if (!candidates.length) {
    return effort
  }

  const rank = (level: string) => EFFORT_LADDER.indexOf(level as ReasoningEffortValue)
  const below = candidates.filter(level => rank(level) < rank(requested))

  return below.length
    ? below.reduce((best, level) => (rank(level) > rank(best) ? level : best))
    : candidates.reduce((best, level) => (rank(level) < rank(best) ? level : best))
}
