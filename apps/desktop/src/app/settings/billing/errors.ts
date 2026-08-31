import { translateNow } from '@/i18n'

import type { BillingRefusal } from './api'

export interface BillingRefusalPresentation {
  action: { type: 'none' } | { type: 'portal'; url?: string } | { type: 'retry' } | { type: 'step_up' }
  message: string
  title: string
}

const portalAction = (url?: string): BillingRefusalPresentation['action'] => ({ type: 'portal', url })

const retryMessage = (refusal: BillingRefusal): string => {
  const minutes = refusal.retryAfter ? Math.max(1, Math.round(refusal.retryAfter / 60)) : undefined

  return translateNow('billingPage.refusal.rateLimitMessage', minutes)
}

const stripeRetryMessage = (refusal: BillingRefusal): string => {
  const minutes = refusal.retryAfter ? Math.max(1, Math.round(refusal.retryAfter / 60)) : undefined

  return translateNow('billingPage.refusal.stripeMessage', minutes)
}

export const resolveRefusal = (refusal: BillingRefusal): BillingRefusalPresentation => {
  switch (refusal.kind) {
    case 'consent_required':
      return {
        action: portalAction(refusal.portalUrl),
        message: translateNow('billingPage.refusal.consentMessage'),
        title: translateNow('billingPage.refusal.consentTitle')
      }

    case 'insufficient_scope':
      return {
        action: { type: 'step_up' },
        message: translateNow('billingPage.refusal.scopeMessage'),
        title: translateNow('billingPage.refusal.scopeTitle')
      }
    case 'remote_spending_revoked': {
      const who =
        refusal.actor === 'admin'
          ? translateNow('billingPage.refusal.revokedByAdmin')
          : translateNow('billingPage.refusal.revokedByUser')

      return {
        action: portalAction(refusal.portalUrl),
        message: translateNow('billingPage.refusal.revokedReconnect', who),
        title: translateNow('billingPage.refusal.revokedTitle')
      }
    }

    case 'session_revoked':
      return {
        action: portalAction(refusal.portalUrl),
        message: translateNow('billingPage.refusal.sessionMessage'),
        title: translateNow('billingPage.refusal.sessionTitle')
      }

    case 'cli_billing_disabled':

    case 'remote_spending_disabled':
      return {
        action: portalAction(refusal.portalUrl),
        message: translateNow('billingPage.refusal.remoteSpendingOffMessage'),
        title: translateNow('billingPage.refusal.remoteSpendingOffTitle')
      }

    case 'role_required':
      return {
        action: portalAction(refusal.portalUrl),
        message: translateNow('billingPage.refusal.roleMessage'),
        title: translateNow('billingPage.refusal.roleTitle')
      }

    case 'idempotency_conflict':
      return {
        action: { type: 'none' },
        message: translateNow('billingPage.refusal.freshTopUpMessage'),
        title: translateNow('billingPage.refusal.freshTopUpTitle')
      }

    case 'no_payment_method':
      return {
        action: portalAction(refusal.portalUrl),
        message: translateNow('billingPage.refusal.noSavedCardMessage'),
        title: translateNow('billingPage.refusal.noSavedCardTitle')
      }

    case 'org_access_denied':
      return {
        action: { type: 'none' },
        message: translateNow('billingPage.refusal.orgAccessMessage'),
        title: translateNow('billingPage.refusal.orgAccessTitle')
      }
    case 'monthly_cap_exceeded': {
      const remaining = refusal.payload?.remainingUsd

      return {
        action: portalAction(refusal.portalUrl),
        message:
          remaining != null
            ? translateNow('billingPage.refusal.monthlyCapRemaining', remaining)
            : translateNow('billingPage.refusal.monthlyCapMessage'),
        title: translateNow('billingPage.refusal.monthlyCapTitle')
      }
    }

    case 'rate_limited':

    case 'temporarily_unavailable':
      return {
        action: { type: 'retry' },
        message: retryMessage(refusal),
        title: translateNow('billingPage.refusal.rateLimitTitle')
      }

    case 'stripe_unavailable':
      return {
        action: { type: 'retry' },
        message: stripeRetryMessage(refusal),
        title: translateNow('billingPage.refusal.stripeTitle')
      }

    case 'upgrade_cap_exceeded':
      return {
        action: { type: 'none' },
        message: translateNow('billingPage.refusal.planLimitMessage'),
        title: translateNow('billingPage.refusal.planLimitTitle')
      }

    case 'endpoint_unavailable':
      return {
        action: { type: 'retry' },
        message: refusal.message || translateNow('billingPage.refusal.endpointMessage'),
        title: translateNow('billingPage.refusal.endpointTitle')
      }

    case 'timeout':
      return {
        action: { type: 'retry' },
        message: refusal.message || translateNow('billingPage.refusal.timeoutMessage'),
        title: translateNow('billingPage.refusal.timeoutTitle')
      }

    case 'transport':
      return {
        action: { type: 'retry' },
        message: refusal.message || translateNow('billingPage.refusal.transportMessage'),
        title: translateNow('billingPage.refusal.transportTitle')
      }

    default:
      return {
        action: { type: 'none' },
        message: refusal.message || translateNow('billingPage.refusal.genericMessage'),
        title: translateNow('billingPage.refusal.genericTitle')
      }
  }
}
