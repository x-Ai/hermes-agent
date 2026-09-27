import { useEffect, useState } from 'react'

import { CAPABILITIES_ROUTE } from '@/app/routes'
import { WisdomNotificationsCard } from '@/components/wisdom-notifications-card'
import {
  acknowledgeWisdomNotifications,
  getWisdomInstallations,
  type ProfileScope,
  type WisdomNotification
} from '@/hermes'
import { useI18n } from '@/i18n'
import { notifyError } from '@/store/notifications'

export function WisdomNoticeCard({ profile }: { profile?: ProfileScope }) {
  const { t } = useI18n()
  const copy = t.skills.collective
  const [events, setEvents] = useState<WisdomNotification[]>([])

  useEffect(() => {
    let active = true

    const refresh = async () => {
      try {
        const result = await getWisdomInstallations(profile)

        if (active) {
          setEvents(result.delivery_mode === 'agent' ? [] : result.notifications)
        }
      } catch {
        // The notice is an enhancement to the transcript. An unavailable or
        // unconfigured Wisdom plane must not make ordinary chat unusable.
        // Keep the last confirmed projection so a transient poll cannot make
        // an actionable organization notification flicker out of the chat.
      }
    }

    void refresh()
    const timer = window.setInterval(() => void refresh(), 30_000)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [profile])

  if (events.length === 0) {
    return null
  }

  return (
    <WisdomNotificationsCard
      className="mb-(--conversation-turn-gap) bg-(--ui-chat-surface-background)"
      events={events}
      onMarkAllRead={async () => {
        try {
          await acknowledgeWisdomNotifications(profile)
          setEvents([])
        } catch (error) {
          notifyError(error, copy.acknowledgeNotificationsFailed)
        }
      }}
      onPlanAction={(action, event) => {
        const params = new URLSearchParams({
          tab: 'collective',
          wisdomAction: action,
          wisdomSkillId: event.skill_id
        })

        // The Collective tab lives on the Capabilities page; a stale `#/skills` target falls
        // through to a new chat and silently drops the Install/Review action.
        window.location.hash = `#${CAPABILITIES_ROUTE}?${params.toString()}`
      }}
    />
  )
}
