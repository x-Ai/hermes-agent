import { useStore } from '@nanostores/react'

import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { $introView } from '@/store/onboarding-intro'

import { skipIntro } from './intro'

export function OnboardingSkip() {
  const { t } = useI18n()
  const intro = useStore($introView) === 'intro'

  if (!intro) {
    return null
  }

  return (
    <Tip label={t.onboarding.skipSetupTip}>
      <button
        className="ml-auto text-[11px] text-(--ui-text-quaternary) transition-colors hover:text-(--ui-text-secondary)"
        onClick={skipIntro}
        type="button"
      >
        {t.onboarding.skipSetup}
      </button>
    </Tip>
  )
}
