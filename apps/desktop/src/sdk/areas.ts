// Contribution-area constants the SDK barrel re-exports whole: host-owned
// areas with no feature module of their own, plus area contracts whose module
// lives in core but has no other public door.

import type { ReadableAtom } from 'nanostores'
import type { ReactNode } from 'react'

export const PANES_AREA = 'panes'
export const STATUSBAR_AREAS = { left: 'statusBar.left', right: 'statusBar.right' } as const
/** Titlebar slots are PERMANENT mount points: a component registered here
 *  stays mounted across chat ↔ page navigation, so `useEffect` setup/cleanup
 *  runs once per registration, not once per route. Page-owned controls that
 *  should exist only while a page is up go to `WORKSPACE_PAGE_HEADER_AREA`. */
export const TITLEBAR_AREAS = { center: 'titleBar.center', left: 'titleBar.left', right: 'titleBar.right' } as const


/** The statusbar's session readouts — the context-usage chip (label, detail,
 *  popover) and the cache-hit-rate / tokens-per-second items beside it — go
 *  to the first contribution here whose `active` atom is true: a plugin whose
 *  main-area workspace is not a session (a Bot Mode group room, whose members
 *  run in hidden sessions the core never measures) describes ITS sessions
 *  while it is in front, and the focused session's figures return the moment
 *  it isn't. Consumer: `app/shell/hooks/use-statusbar-readouts.tsx`. */
export const STATUSBAR_CONTEXT_USAGE_AREA = 'statusBar.contextUsage'

/** `data` payload of a `STATUSBAR_CONTEXT_USAGE_AREA` contribution. */
export interface ContextUsageOverrideContribution {
  /** True while the surface this override describes is on screen. */
  active: ReadableAtom<boolean>
  /** The `cache-hit-rate` item while active, e.g. `87%`; absent or '' paints its placeholder. */
  cacheHit?: ReadableAtom<string>
  /** Optional trailing detail, e.g. `[████░░░░░░] 4%`. */
  detail?: ReadableAtom<string>
  /** The chip's text, e.g. `~45k/1M`; '' paints the chip's waiting placeholder. */
  label: ReadableAtom<string>
  /** The popover body; mounted only while the chip's menu is open. */
  panel: () => ReactNode
  /** The `tokens-per-second` item while active, e.g. `42 t/s`; absent or '' paints its placeholder. */
  tokensPerSecond?: ReadableAtom<string>
}
/** Per-card labels on Kanban tiles: register a `KANBAN_CARD_AREAS.badges`
 *  data contribution whose `decorate({ id, status, tenant, assignee },
 *  { tenants })` returns `{ label, tone?, tooltip? }` (or a few, or `null`). Core paints
 *  them as text chips in the card's badge row, ordered by plugin id, capped
 *  per plugin, removed with the plugin. Never touch the board's markup.
 *  `KanbanCardBadges` is the row the board itself renders. */
export {
  KANBAN_CARD_AREAS,
  KANBAN_CARD_BADGE_HUES,
  KANBAN_CARD_BADGE_LIMITS,
  type KanbanCard,
  type KanbanCardBadge,
  type KanbanCardBadgeContribution,
  type KanbanCardBadgeHue,
  KanbanCardBadges,
  type KanbanCardBadgeTone,
  type KanbanCardBoard
} from '@/contrib/kanban-card-badges'
/** Draw the `MEDIA:` files your package's OWN tools produced, in place of the
 *  built-in player (ownership is checked against the backend's tool registry). */
export {
  TOOL_MEDIA_RENDERER_AREA,
  type ToolMediaFile,
  type ToolMediaRendererContribution,
  type ToolMediaRendererProps
} from '@/lib/tool-media-renderers'