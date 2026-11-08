import { expect, it } from 'vitest'

import { BOTS_LOCALES } from './i18n'
import { translateBotsIn } from './i18n-test-helper'

// The shared group views, creation/member/settings dialogs, and roster consume
// these namespaces. Requiring each English key catches additions as well as gaps.
const namespaces = ['group', 'canonical', 'crossGateway', 'roster', 'sections'] as const

it.each([
  ['fr', 'Section « Notes » supprimée', 'bot sans section', 'bots sans section'],
  ['es', 'Sección «Notes» eliminada', 'bot sin sección', 'bots sin sección']
])('names the deleted section with feminine agreement in %s', (locale, sentence, singular, plural) => {
  const t = translateBotsIn(locale)
  expect([0, 1, 2].map(count => t('sections.deleted', 'Notes', count))).toEqual([
    sentence, `${sentence} — 1 ${singular}`, `${sentence} — 2 ${plural}`
  ])
})

const sharedKeys = {
  bot: ['newChatWith', 'newTitle', 'thisDevice', 'removeFromAllGroups', 'openBotChat', 'openBotChatInNewTab', 'openingChat',
    'pinToTop', 'unpin', 'pinnedToast', 'unpinnedToast', 'hide', 'unhide', 'hiddenToast', 'unhiddenToast',
    'groupsMenu', 'manageGroups', 'metadataLoadFailed', 'loadFailed', 'groupsLoadFailed', 'attentionFallback',
    'attentionProviderAuth', 'attentionQuota', 'attentionMissingConfig', 'attentionBlocked', 'editMenu', 'duplicate', 'duplicateFailed'],
  avatar: ['upload', 'generate', 'generating'],
  screen: ['menu', 'autoOpenMenu', 'autoOpenOnToast', 'autoOpenOffToast']
}

// This fork's own Bot Mode keys (working directories, @handles, hosted group chats, context usage,
// traces and roster notices) are not part of upstream's French, German and Spanish group surface,
// so they still read English there. The list only shrinks: a new English key must be translated.
const FORK_ENGLISH_FALLBACK: Record<string, ReadonlySet<string> | undefined> = Object.fromEntries(
  ['fr', 'de', 'es'].map(locale => [locale, new Set([
    'group.attachmentFailed',
    'group.cancel',
    'group.canonicalActionFailed',
    'group.canonicalAttachmentsUnsupported',
    'group.canonicalMembersFixed',
    'group.canonicalSendFailed',
    'group.contextUsageCacheHit',
    'group.contextUsageCompressions',
    'group.contextUsageHint',
    'group.contextUsageNoMembers',
    'group.contextUsageNone',
    'group.contextUsageRefresh',
    'group.contextUsageRefreshing',
    'group.contextUsageThreads',
    'group.contextUsageTitle',
    'group.contextUsageTokensPerSecond',
    'group.emptyResponse',
    'group.handleHint',
    'group.handleInvalid',
    'group.handleLabel',
    'group.handlePlaceholder',
    'group.handleTaken',
    'group.hideFullHandle',
    'group.hostOnGateway',
    'group.hostOnGatewayAction',
    'group.hostOnGatewayBusy',
    'group.hostOnGatewayDescription',
    'group.hostOnGatewayTitle',
    'group.hostedOnGateway',
    'group.hostedRoom',
    'group.legacyRoomName',
    'group.manageMembersAria',
    'group.manageMembersCount',
    'group.memberWorkspacePlaceholder',
    'group.memberWorkspaceRemotePlaceholder',
    'group.mentionMeta',
    'group.noFreeName',
    'group.openGroupChat',
    'group.replyToMember',
    'group.routedAttachmentsBlocked',
    'group.routedAttachmentsUnreadable',
    'group.routedToGroup',
    'group.sessionCheckFailed',
    'group.showFullHandle',
    'group.threadWorkspace',
    'group.traceFailed',
    'group.traceLabel',
    'group.traceLive',
    'group.traceOmitted',
    'group.traceThought',
    'group.traceTools',
    'group.workspaceApplyFailed',
    'group.workspaceClear',
    'group.workspaceHint',
    'group.workspaceInvalid',
    'group.workspaceLabel',
    'group.workspacePick',
    'group.workspacePlaceholder',
    'group.workspaceSource',
    'roster.newActivity',
    'roster.newMessageFor',
    'roster.openChatToSee',
    'roster.reconnecting',
    'roster.refreshFailed'
  ])])
)

function requireOwnTranslations(english: unknown, localized: unknown, path: string, fallback?: ReadonlySet<string>) {
  if (fallback?.has(path.slice(path.indexOf('.') + 1))) {
    return
  }

  expect(localized, path).toBeDefined()
  expect(typeof localized, path).toBe(typeof english)

  if (english && typeof english === 'object') {
    for (const [key, value] of Object.entries(english)) {
      requireOwnTranslations(value, (localized as Record<string, unknown> | undefined)?.[key], `${path}.${key}`, fallback)
    }
  }
}

it.each(['ar', 'ru', 'fr', 'de', 'es', 'ja', 'zh', 'zh-hant'])('owns every group-screen translation in %s without English fallback', locale => {
  const bundle = BOTS_LOCALES[locale] as Record<string, Record<string, unknown>>
  const english = BOTS_LOCALES.en as Record<string, Record<string, unknown>>

  for (const namespace of namespaces) {
    requireOwnTranslations(english[namespace], bundle[namespace], `${locale}.${namespace}`, FORK_ENGLISH_FALLBACK[locale])
  }

  for (const [namespace, keys] of Object.entries(sharedKeys)) {
    for (const key of keys) {
      requireOwnTranslations(english[namespace][key], bundle[namespace]?.[key], `${locale}.${namespace}.${key}`)
    }
  }
})
