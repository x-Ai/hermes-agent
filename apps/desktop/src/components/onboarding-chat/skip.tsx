import { useStore } from '@nanostores/react'

import { $chatOnboardingSolo, skipChatOnboarding } from '@/components/onboarding-chat/assembly'
import { useI18n } from '@/i18n'

export function OnboardingSkip() {
  const { t } = useI18n()
  const solo = useStore($chatOnboardingSolo)

  if (!solo) {
    return null
  }

  return (
    <button
      className="ml-auto text-[11px] text-(--ui-text-quaternary) transition-colors hover:text-(--ui-text-secondary)"
      onClick={skipChatOnboarding}
      type="button"
    >
      {t.guidedOnboarding.skipSetup}
    </button>
  )
}
