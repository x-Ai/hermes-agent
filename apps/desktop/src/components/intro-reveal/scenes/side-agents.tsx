import type { Translations } from '@/i18n'

import { INTRO_BEATS } from '../timeline'

import { BLUE, BLUE_FAINT, EASE, NOUS_SHADOW } from './style'
import { decoded } from './text'

const EVERYWHERE_T = INTRO_BEATS.find(b => b.id === 'everywhere')!.t

interface SideAgentsProps {
  active: boolean
  copy: Translations['introReveal']['sideAgents']
  side: 'left' | 'right'
  tick: number
}

export function SideAgents({ active, copy, side, tick }: SideAgentsProps) {
  const sideCard = (title: string, line1: string, line2: string, offset: string, delayMs = 0, tilt = 0) => (
    <div
      className="w-full rounded-xl p-5"
      style={{
        background: 'rgba(12, 13, 16, 0.82)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: NOUS_SHADOW,
        opacity: active ? 1 : 0,
        transform: active
          ? `translateZ(-90px) rotateY(${tilt}deg) translateY(0) scale(1)`
          : `translateZ(-90px) rotateY(${tilt}deg) translateY(${offset}) scale(0.94)`,
        transition: `opacity 760ms ${EASE} ${delayMs}ms, transform 760ms ${EASE} ${delayMs}ms`,
        willChange: 'transform, opacity'
      }}
    >
      <div
        className="mb-3 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.18em] text-white/50"
        style={{ fontFamily: "'Collapse', sans-serif" }}
      >
        <span
          className="inline-block size-1.5 rounded-full"
          style={{ animation: 'intro-dot 1.6s ease-in-out infinite', background: BLUE }}
        />
        {title}
      </div>
      <div className="text-[0.95rem] leading-6 text-white/85">{line1}</div>
      <div
        className="mt-1 text-[0.85rem] leading-6"
        style={{ color: BLUE_FAINT, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {active ? decoded(line2, EVERYWHERE_T + delayMs + 500, tick, 700) : line2}
      </div>
    </div>
  )

  return side === 'left' ? (
    <div className="flex w-[19vw] min-w-[240px] flex-col gap-4 self-start pt-[6vh]">
      <div style={{ animation: 'intro-float-a 5.2s ease-in-out infinite alternate' }}>
        {sideCard(copy.research.title, copy.research.line1, copy.research.line2, '26px', 0, 7)}
      </div>
      <div style={{ animation: 'intro-float-b 6.1s ease-in-out infinite alternate' }}>
        {sideCard(copy.groceries.title, copy.groceries.line1, copy.groceries.line2, '38px', 220, 7)}
      </div>
    </div>
  ) : (
    <div className="flex w-[19vw] min-w-[240px] flex-col gap-4 self-end pb-[5vh]">
      <div style={{ animation: 'intro-float-c 5.7s ease-in-out infinite alternate' }}>
        {sideCard(copy.inbox.title, copy.inbox.line1, copy.inbox.line2, '34px', 120, -7)}
      </div>
      <div style={{ animation: 'intro-float-a 6.6s ease-in-out infinite alternate' }}>
        {sideCard(copy.morning.title, copy.morning.line1, copy.morning.line2, '30px', 340, -7)}
      </div>
    </div>
  )
}
