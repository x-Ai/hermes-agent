import '@nous-research/ui/styles/fonts.css'

import { createRoot } from 'react-dom/client'

import { OverlayErrorBoundary } from '@/components/overlay-error-boundary'
import { I18nProvider } from '@/i18n'
import { isOnboardingEnabled } from '@/lib/onboarding-enabled'

import { IntroRevealSurface } from './intro-reveal-surface'

export function mountIntroReveal(): void {
  if (!isOnboardingEnabled()) {
    return
  }

  document.title = 'Hermes'
  // The intro fills a display the user sits back from; the app's 16 px root
  // is sized for a working window. Every intro measure is in rem, so one
  // root scale keeps the composition proportional (director: legibility).
  document.documentElement.style.fontSize = '150%'
  const root = document.getElementById('root')

  if (!root) {
    return
  }

  // StrictMode would double-start this disposable window's clock and sound.
  createRoot(root).render(
    <OverlayErrorBoundary label="intro-reveal">
      <I18nProvider configClient={null}>
        <IntroRevealSurface />
      </I18nProvider>
    </OverlayErrorBoundary>
  )

  // Native ready-to-show can precede the first React paint.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      window.hermesDesktop?.introReveal?.ready()
    })
  )
}
