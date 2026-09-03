/**
 * Plugin-scoped i18n for Bot Mode — bundles registered under the plugin id via
 * `ctx.i18n.register`, never touching core `en.ts`. Mirrors the kanban plugin:
 * `usePluginI18n` returns a stringly-typed `t(key, …)`, and `useBots()` binds it
 * to the message SHAPE so components keep typed `b.roster.search` access.
 *
 * Only strings Bot Mode OWNS live here. Generic verbs (Cancel, Delete, Remove,
 * Retry, Close, Loading…) and shared vocabulary core already ships in every
 * locale — weekday names, Daily/Hourly, Scheduled jobs — resolve against core
 * via `useI18n()` / `translateNow()`. Duplicating those here would be a
 * second, worse translation that drifts.
 *
 * Three kinds of literal deliberately stay hardcoded, and none of them is a
 * missed key:
 *
 *  - **Prompts sent to a model**, not shown as chrome: the room-picture image
 *    prompt and the scheduled-routine instruction. They are addressed to the
 *    model, which reads English best.
 *  - **Syntax and identifiers**: cron expressions and their examples, React
 *    keys, workspace ids.
 *  - **`'You'`**, the author marker on room-log entries. It remains persisted
 *    and compared as a stable sentinel; rendering translates it separately in
 *    `group-activity.ts` without changing stored room history.
 *
 * Locales follow kanban: `en` / `ja` / `zh` / `zh-hant`. Arabic falls through
 * the resolution chain (active locale → this plugin's `en` → the key) the
 * same way a missing string in any locale does. Nouns match core: ボット /
 * 智能体 / 智慧體, プロファイル / 配置档案 / 設定檔, ゲートウェイ / 网关 / 閘道.
 */

import { type PluginLocaleBundles, type PluginTranslate, usePluginI18n } from '@hermes/plugin-sdk'
import { useMemo } from 'react'

import { getPluginCtx } from './shared'

type BotsMessages = {
  /** Left rail: the bot + group-chat roster. */
  roster: {
    title: string
    search: string
    searchPlaceholder: string
    newBotOrGroup: string
    newMenu: string
    activityToastsOn: string
    activityToastsOff: string
    newMessageFor: (name: string) => string
    newActivityFor: (name: string) => string
    openChatToSee: string
    gatewayFallback: string
    couldNotReach: (target: string) => string
    couldNotOpenChat: (name: string) => string
    allGateways: string
    currentGateway: string
    filter: string
    filterActive: (count: number) => string
    filtersActive: (count: number) => string
    hiddenLabel: string
    refreshFailed: string
    reconnecting: string
    gatewayError: string
    thisDevice: string
    attentionAuth: string
    attentionQuota: string
    attentionMissingConfig: string
    attentionBlocked: string
    groupChats: string
    emptyTitle: string
    emptyDesc: string
    noMatchQuery: (query: string) => string
    noMatchQueryOn: (query: string, gateway: string) => string
    noMatchFiltersOn: (gateway: string) => string
    noMatchFilters: string
    clearFilters: string
    allHidden: string
    allHiddenDesc: string
    showHidden: string
    noHiddenMatch: string
    hiddenFromRoster: string
    pinned: string
    needsAttention: string
    needsInput: string
    /** The kind filter's three options, in menu order. */
    botsAndGroups: string
    botsOnly: string
    groupsOnly: string
    /** The activity filter's four options, in menu order. */
    anyActivity: string
    activeNow: string
    recentlyActive: string
    older: string
    /** How a row's owning gateway is doing — see `botSourceStatus`. */
    gatewayRemoved: string
    onDemand: string
    ready: string
    statusUnknown: string
    unavailable: string
    retryNow: string
    rosterUnavailable: (reason: string) => string
    waitingForGateway: string
  }
  /** User-made roster sections (folders the user files bots into). */
  sections: {
    newSection: string
    newTitle: string
    renameTitle: string
    nameLabel: string
    namePlaceholder: string
    create: string
    rename: string
    moveUp: string
    moveDown: string
    unassigned: string
    options: (name: string) => string
    headingTip: string
    emptyHint: string
    moveTo: string
    newSectionEllipsis: string
    removeFromSection: string
    deleted: (name: string, count: number) => string
    undo: string
  }
  /** Creating, editing and removing a bot. */
  bot: {
    newTitle: string
    newDescription: string
    nameLabel: string
    titleLabel: string
    titlePlaceholder: string
    descriptionLabel: string
    creating: string
    createAction: string
    created: (name: string) => string
    createdOn: (name: string, target: string) => string
    draftDiscarded: (name: string) => string
    couldNotCleanDraft: (name: string) => string
    createOn: string
    currentConnection: (name: string) => string
    remoteLocation: (target: string) => string
    tabGeneral: string
    tabCapabilities: string
    tabSkills: string
    tabTools: string
    tabMcp: string
    inheritedFromLaunchProfile: string
    soulOptional: string
    shareKeys: string
    shareKeysDesc: string
    createEmpty: string
    nameTakenForCapabilities: string
    nameFirstForCapabilities: string
    skillsNeedNewDesktop: string
    capabilityCatalogNeedsGateway: string
    createEmptySkillsNotice: string
    catalogFrom: (source: string) => string
    defaultToolsetBehavior: string
    catalog: string
    catalogInstalled: string
    configuredServersDesc: string
    pin: string
    unpin: string
    pinChanged: (name: string, pinned: boolean) => string
    hide: string
    unhide: string
    hiddenChanged: (name: string, hidden: boolean) => string
    metadataLoadFailed: string
    loadFailed: string
    groupsLoadFailed: string
    groups: (names: string) => string
    manageGroups: string
    duplicating: (name: string) => string
    duplicated: (name: string, source: string) => string
    deleteDescription: (name: string, path?: string) => string
    deleting: string
    deleted: string
    deletedProfile: (name: string) => string
    cloneFromProfile: string
    cloneFromProfileOn: (target: string) => string
    defaultProfileName: string
    freshProfile: string
    editTitle: string
    editDescription: (name: string, profile: string) => string
    editMenu: string
    updated: (name: string) => string
    advancedSectionsFailed: (sections: string) => string
    helpPromptPlaceholder: string
    descriptionHint: string
    newChatWith: string
    /** Re-opens the forever-chat on purpose. A plain row click only returns to
     *  the tabs already open, so a closed Bot Chat needs an explicit ask. */
    openBotChat: string
    duplicate: string
    duplicateFailed: string
    noFreeDuplicateName: string
    defaultProfileCannotDelete: string
    sourceScopedDeleteUnsupported: string
    couldNotDeleteProfile: (name: string) => string
    deleteTitle: string
    removeFromAllGroups: string
    createFirstHint: string
    createFailed: string
    advanced: string
    advancedHint: string
    advancedFailed: string
    openAnotherChatUnsupported: string
    remoteConnectionsUnsupported: string
    storedSessionsUnsupported: string
    updateGatewayTitle: string
    updateGatewayMessage: (gateway: string) => string
    workspaceSelectionRequired: string
    /** Stands under the bot's name in a chat it has not spoken in yet. */
    chatEmpty: string
    chatNeverResetsTitle: string
    chatNeverResetsMessage: string
    /** First line of a brand-new bot's forever-chat — see `kickoffText`. */
    kickoff: string
  }
  /** Avatar picker: shapes, blobs, pets, uploads, generation. */
  avatar: {
    auto: string
    autoTitle: string
    lockTitle: string
    unlock: string
    lockFace: string
    lockedHint: string
    followsNameHint: string
    noImageModel: string
    checkingImageBackend: string
    chooseImage: string
    noPets: string
    noPetsMatch: string
    searchPets: (count: number) => string
    classicShapes: string
    blobFromName: string
    unlockFollowsName: string
    randomize: string
    /** The picker's four tabs, in order. */
    tabBot: string
    tabGenerate: string
    upload: string
    tabPet: string
    removeImage: string
    removeBackToShape: string
    describePlaceholder: string
    describeHint: string
    matchTheName: string
    pickPet: string
    petLoadFailed: string
    imageTooLarge: string
    generationFailed: string
    savedLocally: string
    savedLocallyDescriptionFailed: string
    generate: string
    generating: string
  }
  /** Group chats: the room, its composer, threads and activity feed. */
  group: {
    newTitle: string
    newGroupPlaceholder: string
    createAndJoin: string
    noBotsYet: string
    pickAtLeastTwo: string
    createWithCount: (count: number) => string
    groupCreated: (name: string, count: number) => string
    addedToGroup: (bot: string, group: string) => string
    removedFromGroup: (bot: string, group: string) => string
    openGroupChat: string
    noBotsInGroup: string
    hideFullHandle: string
    showFullHandle: string
    ownAnswerPlaceholder: string
    answerPlaceholder: string
    sending: string
    you: string
    availableCount: (available: number, total: number) => string
    attachedFile: string
    attachedImage: string
    attachmentFallback: string
    pastedImage: string
    attachmentTooLarge: (name: string) => string
    emptyResponse: string
    newConversationHint: string
    manageDesc: string
    manageTitle: string
    settingsTitle: string
    settingsDesc: string
    nameLabel: string
    searchToAdd: string
    searchToAddPlaceholder: string
    removeFromSelection: string
    disbandTitle: string
    deleteTitle: string
    deleteAction: string
    composerPlaceholder: string
    attachHint: string
    newThread: string
    reply: string
    replyInThread: string
    replyInThreadPlaceholder: string
    openThread: string
    collapseThread: string
    collapseThreadLabel: string
    activity: string
    noActivityYet: string
    showActivity: string
    hideActivity: string
    activityActorBot: string
    activityDidSomething: string
    activityBy: (member: string, action: string) => string
    activityLabels: {
      queued: string
      working: string
      replied: string
      passed: string
      timedOut: string
      failed: string
      cancelled: string
      settled: string
      capped: string
      delivered: string
      held: string
      stopped: string
    }
    stop: string
    stopHint: string
    allHeldStatus: (count: number) => string
    heldMembersStatus: (members: string) => string
    holdReleaseHint: string
    needsYourInput: string
    pictureGenerationFailed: string
    nameTaken: (name: string) => string
    noFreeName: string
    memberCount: (count: number) => string
    settingsHint: (group: string) => string
    settingsLabel: (group: string) => string
    disbandHint: (group: string) => string
    disbandLabel: (group: string) => string
    disbandAction: string
    disbanding: string
    disbandDone: string
    disbanded: (group: string) => string
    /** Wraps the bolded group name, so the name can lead the sentence in
     *  languages that put it there — see core's cron.deleteDesc* pair. */
    disbandDescPrefix: string
    disbandDescSuffix: (count: number) => string
    stopped: (group: string) => string
    removeAttachment: string
    threadFallback: string
    replyCount: (replies: number) => string
    dropToThread: string
    dropToRoom: string
    waitingForAnswer: string
    memberThinking: (name: string) => string
    roomWorking: string
    messageRoom: (group: string) => string
    newThreadPlaceholder: (group: string) => string
    everyoneMeta: string
    commandApproval: string
    answerFailed: (handle: string, error: string) => string
    wantsToRunCommand: (handle: string) => string
    asks: (handle: string) => string
    answerTo: (member: string) => string
  }
  /** Skills hub + MCP setup surfaces embedded in the bot editor. */
  tools: {
    skillsHub: string
    skillsHubShort: string
    filterSkills: string
    searchHub: string
    noMcpServers: string
    provider: string
    model: string
    providerCustom: string
    modelCustom: string
    backToDropdowns: string
    inheritLaunchProfile: string
    enterManually: string
    gatewayDefault: string
    modelNameExample: string
    modelSwitchFailed: string
    confirm: string
    fullConfigNeedsGateway: string
    remoteCapabilitiesNeedDesktop: string
    capabilitiesImmediate: string
    soulConfig: string
    skillsEnabled: (enabled: number, total: number) => string
    toolsetsEnabled: (enabled: number, total: number) => string
    mcpServers: string
    catalog: string
    catalogInstalled: string
    searching: string
    searchAction: string
    searchingHub: string
    noHubSkills: string
    added: string
    hideHubBrowser: string
    browseFullHub: string
    installing: (name: string) => string
    installHint: string
    skillInstalled: (name: string) => string
    skillInstallFailed: (name: string) => string
    setupDone: string
    saveAndTest: string
    working: string
    retry: string
    setupFailed: string
    needsSetup: (requires: string) => string
    signIn: string
    setUp: string
    authorizing: string
    couldNotAddServer: string
    noTargetProfile: string
    failedToSet: (key: string) => string
    serverTestFailed: string
    couldNotStartOAuth: string
    oauthCallbackFailed: string
    completeSignIn: string
    oauthFailed: string
    configured: (name: string) => string
    authenticated: (name: string) => string
  }

  /** Bot-scoped scheduled jobs. Generic scheduling chrome (weekday names,
   *  Daily/Hourly, the job verbs) resolves against core's `cron` section. */
  cron: {
    untitledJob: string
    detailDescription: string
    statusLabel: string
    scheduleLabel: string
    repeatLabel: string
    modelLabel: string
    activeLabel: string
    pausedLabel: string
    scheduleRawLabel: string
    nextRunLabel: string
    lastRunLabel: string
    lastResultLabel: string
    resultSucceeded: string
    resultFailed: string
    resultDeliveryFailed: string
    resultBlockedConfig: string
    deliversToLabel: string
    workingDirectoryLabel: string
    legacyPaused: string
    minutesFromNow: string
    hoursFromNow: string
    daysFromNow: string
    nameNulError: string
    instructionNulError: string
    filterHint: string
    needsRosterFirst: string
    staleNotice: string
    readFailure: string
    createDesc: (bot: string) => string
    instruction: string
    whenToRun: string
    dayOfMonth: string
    sendResultsTo: string
    runHistoryOnly: string
    botChatTarget: (bot: string) => string
    continuity: string
    stopAfter: string
    runsForeverHint: string
    onceIn: (when: string) => string
    everyNDays: (days: number) => string
    everyNHours: (hours: number) => string
    everyNMinutes: (minutes: number) => string
    /** The frequency picker's eight options, in menu order. */
    freqOnce: string
    freqHourly: string
    freqDaily: string
    freqWeekdays: string
    freqWeekly: string
    freqMonthly: string
    freqInterval: string
    freqAdvanced: string
    unitMinutes: string
    unitHours: string
    unitDays: string
    /** One-line plain-language read-back of the picker's current state. */
    runsOnce: (count: number, unit: string) => string
    runsHourly: string
    runsDaily: (time: string) => string
    runsWeekdays: (time: string) => string
    runsWeekly: (day: string, time: string) => string
    runsMonthly: (day: string, time: string) => string
    runsInterval: (count: number, unit: string) => string
    runsRaw: string
    timesTotal: (count: number) => string
  }
}

const en: BotsMessages = {
  roster: {
    title: 'Bots',
    search: 'Search bots and group chats',
    searchPlaceholder: 'Search bots and group chats…',
    newBotOrGroup: 'New bot or group chat',
    newMenu: 'New…',
    activityToastsOn: 'Activity toasts on — click to silence',
    activityToastsOff: 'Activity toasts off — click to enable',
    newMessageFor: name => `🤖 New message for ${name}`,
    newActivityFor: name => `${name} has new activity`,
    openChatToSee: 'Open the chat to see it.',
    gatewayFallback: 'the gateway',
    couldNotReach: target => `Could not reach ${target}`,
    couldNotOpenChat: name => `Could not open ${name}’s chat — try again`,
    allGateways: 'All gateways',
    currentGateway: 'Current gateway',
    filter: 'Filter roster',
    filterActive: count => `Filter roster, ${count} active`,
    filtersActive: count => `Filters (${count} active)`,
    hiddenLabel: 'Hidden',
    refreshFailed: 'Roster refresh failed — showing the last good list.',
    reconnecting: ' Waiting for the gateway to reconnect…',
    gatewayError: 'gateway error',
    thisDevice: 'This device',
    attentionAuth: 'Sign in again for this profile',
    attentionQuota: 'Quota or balance exhausted',
    attentionMissingConfig: 'Provider not configured — run hermes model',
    attentionBlocked: 'Bot is blocked — see its last message',
    groupChats: 'Group chats',
    emptyTitle: 'No bots yet',
    emptyDesc: 'Create your first bot.',
    noMatchQuery: query => `No bots or group chats match “${query}”`,
    noMatchQueryOn: (query, gateway) => `No bots or group chats match “${query}” on ${gateway}`,
    noMatchFiltersOn: gateway => `No bots or group chats match these filters on ${gateway}`,
    noMatchFilters: 'No bots or group chats match these filters.',
    clearFilters: 'Clear filters',
    allHidden: 'All bots are hidden',
    allHiddenDesc: 'They keep working and retain their history.',
    showHidden: 'Show hidden bots',
    noHiddenMatch: 'No hidden bots match these filters.',
    hiddenFromRoster: 'Hidden from the roster',
    pinned: 'Pinned',
    needsAttention: 'needs attention',
    needsInput: 'Needs your input',
    botsAndGroups: 'Bots and group chats',
    botsOnly: 'Bots only',
    groupsOnly: 'Group chats only',
    anyActivity: 'Any activity',
    activeNow: 'Active now',
    recentlyActive: 'Recently active',
    older: 'Older',
    gatewayRemoved: 'Gateway removed',
    onDemand: 'On demand',
    ready: 'Ready',
    statusUnknown: 'Status unknown',
    unavailable: 'Unavailable',
    retryNow: 'Retry now',
    rosterUnavailable: reason =>
      `Roster unavailable: ${reason}. If your gateway predates profiles.list, update Hermes and restart the gateway.`,
    waitingForGateway:
      'Waiting for the gateway connection… (remote gateways can take a few seconds; retries automatically)'
  },
  sections: {
    newSection: 'New section',
    newTitle: 'New section',
    renameTitle: 'Rename section',
    nameLabel: 'Section name',
    namePlaceholder: 'e.g. Clients',
    create: 'Create',
    rename: 'Rename…',
    moveUp: 'Move up',
    moveDown: 'Move down',
    unassigned: 'Unassigned',
    options: name => `${name} section options`,
    headingTip: 'Drop bots here · double-click to rename',
    emptyHint: 'Drag bots here',
    moveTo: 'Move to section',
    newSectionEllipsis: 'New section…',
    removeFromSection: 'Remove from section',
    deleted: (name, count) =>
      count === 0
        ? `Deleted “${name}”`
        : `Deleted “${name}” — ${count} ${count === 1 ? 'bot' : 'bots'} moved to Unassigned`,
    undo: 'Undo'
  },
  bot: {
    newTitle: 'New bot',
    newDescription: 'A named teammate with its own memory, skills, and chat. It can message your other agents.',
    nameLabel: 'Name',
    titleLabel: 'Title',
    titlePlaceholder: 'Inbox Triage',
    descriptionLabel: 'Description',
    creating: 'Creating…',
    createAction: 'Create Bot',
    created: name => `Bot “${name}” created`,
    createdOn: (name, target) => `Bot “${name}” created on ${target}`,
    draftDiscarded: name => `Draft bot “${name}” discarded`,
    couldNotCleanDraft: name => `Could not clean up draft profile “${name}”`,
    createOn: 'Create on',
    currentConnection: name => `${name} (current)`,
    remoteLocation: target =>
      `The bot is created on ${target} and appears in the roster as a Connections bot. Chat routes to that machine.`,
    tabGeneral: 'General',
    tabCapabilities: 'Capabilities',
    tabSkills: 'Skills',
    tabTools: 'Tools',
    tabMcp: 'MCP',
    inheritedFromLaunchProfile: 'inherited from launch profile',
    soulOptional: 'SOUL.md (optional — replaces the generated persona)',
    shareKeys: 'Share keys & accounts with the main profile',
    shareKeysDesc:
      'Subscriptions, OAuth logins, and API keys stay shared (not copied), so token refreshes never invalidate each other. Uncheck for an isolated snapshot copy.',
    createEmpty: 'Create empty (skip bundled skills)',
    nameTakenForCapabilities: 'That name is taken — pick another before configuring capabilities.',
    nameFirstForCapabilities:
      'Name the bot first — a draft profile is created when you open this tab (discarded if you cancel).',
    skillsNeedNewDesktop: 'Skills need a newer Hermes Desktop.',
    capabilityCatalogNeedsGateway: 'Capability catalog needs a newer gateway (restart it after updating Hermes).',
    createEmptySkillsNotice: '“Create empty” is checked — no bundled skills will be installed.',
    catalogFrom: source => `Catalog from ${source} — unchecked skills are disabled after creation.`,
    defaultToolsetBehavior: 'Leaving all (or none) checked keeps the default toolset behavior.',
    catalog: 'catalog',
    catalogInstalled: 'catalog · installed',
    configuredServersDesc:
      'Configured servers copy from the main profile; catalog entries are the bundled MCP menu. Entries needing API keys route through setup first (credentials follow the shared keys setting).',
    pin: 'Pin to top',
    unpin: 'Unpin',
    pinChanged: (name, pinned) => `${name} ${pinned ? 'pinned to top' : 'unpinned'}`,
    hide: 'Hide',
    unhide: 'Unhide',
    hiddenChanged: (name, hidden) =>
      hidden
        ? `${name} hidden — use the eye button in the Bots header to see hidden bots`
        : `${name} is back in the roster`,
    metadataLoadFailed: 'Could not load bot metadata',
    loadFailed: 'Could not load bot',
    groupsLoadFailed: 'Could not load bot groups',
    groups: names => `Groups: ${names}…`,
    manageGroups: 'Manage groups…',
    duplicating: name => `Duplicating ${name}…`,
    duplicated: (name, source) => `Created ${name} — full copy of ${source}`,
    deleteDescription: (name, path) =>
      path
        ? `This will permanently delete the bot ${name} and its associated Hermes profile at ${path}. This cannot be undone.`
        : `This will permanently delete the bot ${name} and its associated Hermes profile. This cannot be undone.`,
    deleting: 'Deleting…',
    deleted: 'Deleted',
    deletedProfile: name => `Deleted profile ${name}`,
    cloneFromProfile: 'Clone from profile',
    cloneFromProfileOn: target => `Clone from profile (on ${target})`,
    defaultProfileName: 'Default',
    freshProfile: 'Fresh profile (bundled skills)',
    editTitle: 'Edit profile',
    editDescription: (name, profile) => `Appearance and role for ${name} (${profile}).`,
    editMenu: 'Edit…',
    updated: name => `${name} updated`,
    advancedSectionsFailed: sections => `Some sections failed: ${sections}`,
    helpPromptPlaceholder: 'What should this bot help with?',
    descriptionHint: 'Leave blank to generate from the bot’s name and description.',
    newChatWith: 'New chat with this bot',
    openBotChat: 'Open Bot Chat',
    duplicate: 'Duplicate',
    duplicateFailed: 'Duplicate failed',
    noFreeDuplicateName: 'No free name for the duplicate.',
    defaultProfileCannotDelete: 'The default profile cannot be deleted.',
    sourceScopedDeleteUnsupported: 'This Hermes Desktop version cannot delete a profile on that connection.',
    couldNotDeleteProfile: name => `Could not delete profile ${name}.`,
    deleteTitle: 'Delete bot and profile?',
    removeFromAllGroups: 'Remove from all groups',
    createFirstHint: 'Open the Bots pane and hit “New Bot”.',
    createFailed: 'Could not create the profile yet',
    advanced: 'Advanced',
    advancedHint: 'Advanced — model, skills, toolsets, SOUL.md',
    advancedFailed: 'Advanced configuration failed',
    openAnotherChatUnsupported: 'Update Hermes Desktop to open another Bot chat.',
    remoteConnectionsUnsupported: 'Update Hermes Desktop to chat with bots on other connections.',
    storedSessionsUnsupported: 'This Hermes Desktop version cannot open stored sessions.',
    updateGatewayTitle: 'Update this gateway to use Bot Mode',
    updateGatewayMessage: gateway => `Update ${gateway}, then try again.`,
    workspaceSelectionRequired: 'Select a bot or group first.',
    chatEmpty: 'Say something to get started.',
    chatNeverResetsTitle: 'This chat never resets',
    chatNeverResetsMessage:
      'Bot chats are one continuous conversation — compacting instead. For a throwaway session with this bot, use Sessions mode.',
    kickoff: 'Hey, tell me about yourself!'
  },
  avatar: {
    auto: 'Auto',
    autoTitle: 'Auto — the name decides',
    lockTitle: 'Keep this exact face even if the name changes',
    unlock: 'Unlock',
    lockFace: 'Lock face',
    lockedHint: 'Face locked — renaming won’t change it.',
    followsNameHint: 'Face follows the name.',
    noImageModel:
      'No image model available. If you just enabled one (or updated Hermes), restart the gateway: Ctrl+K → "Restart gateway".',
    checkingImageBackend: 'Checking image backend…',
    chooseImage: 'Choose an image…',
    noPets: 'No pets in the petdex gallery. Run `hermes pets` to explore.',
    noPetsMatch: 'No pets match.',
    searchPets: count => `Search ${count} pets…`,
    classicShapes: 'Classic shapes',
    blobFromName: 'Blob face — drawn from the bot’s name',
    unlockFollowsName: 'Unlock — the face follows the bot’s name again',
    randomize: 'Randomize',
    tabBot: 'Bot',
    tabGenerate: 'Generate',
    upload: 'Upload',
    tabPet: 'Pet',
    removeImage: 'Remove image — use shape',
    removeBackToShape: 'Remove — back to shape avatar',
    describePlaceholder: 'Describe your avatar…',
    describeHint: 'Leave blank to auto-generate from name/title/description + agent-messaging roster.',
    matchTheName: 'Match the name',
    pickPet: 'Pick a pet as this bot’s profile picture.',
    petLoadFailed: 'Could not load that pet — try another.',
    imageTooLarge: 'Image too large (max 15MB).',
    generationFailed: 'Avatar generation failed',
    savedLocally: 'Saved look locally; remote persistence failed',
    savedLocallyDescriptionFailed: 'Saved look locally; description update failed',
    generate: 'Generate',
    generating: 'Generating…'
  },
  group: {
    newTitle: 'New group chat',
    newGroupPlaceholder: 'Group name (e.g. Research)',
    createAndJoin: 'Create & join',
    noBotsYet: 'No bots yet — create one first.',
    pickAtLeastTwo: 'Pick at least 2 bots',
    createWithCount: count => `Create group${count ? ` (${count})` : ''}`,
    groupCreated: (name, count) => `“${name}” created with ${count} bots`,
    addedToGroup: (bot, group) => `${bot} added to “${group}”`,
    removedFromGroup: (bot, group) => `${bot} removed from “${group}”`,
    openGroupChat: 'Open Group Chat',
    noBotsInGroup: 'No bots in this group chat',
    hideFullHandle: 'Hide full handle',
    showFullHandle: 'Show full handle',
    ownAnswerPlaceholder: 'Or type your own answer…',
    answerPlaceholder: 'Type your answer…',
    sending: 'Sending…',
    you: 'You',
    availableCount: (available, total) => `${available} of ${total} available`,
    attachedFile: 'attached file',
    attachedImage: 'attached image',
    attachmentFallback: 'attachment',
    pastedImage: 'pasted image',
    attachmentTooLarge: name => `${name}: too large (max 15MB).`,
    emptyResponse:
      '⚠️ The model returned no response after processing tool results. This can happen with some models — try again or rephrase your question.',
    newConversationHint: 'New group conversations start in the group composer.',
    manageDesc: 'A bot can join multiple group chats. Memberships sync to every machine.',
    manageTitle: 'Manage groups',
    settingsTitle: 'Group settings',
    settingsDesc: 'Rename the group or set a room picture. Members and history are kept.',
    nameLabel: 'Group name',
    searchToAdd: 'Search bots to add',
    searchToAddPlaceholder: 'Search bots to add…',
    removeFromSelection: 'Remove from selection',
    disbandTitle: 'Disband group chat?',
    deleteTitle: 'Delete group chat?',
    deleteAction: 'Delete',
    composerPlaceholder: 'Say something — every bot in this group hears the room.',
    attachHint: 'Attach files — every responding bot sees them',
    newThread: 'New Thread',
    reply: 'Reply',
    replyInThread: 'Reply in thread',
    replyInThreadPlaceholder: 'Reply in thread…',
    openThread: 'Open this thread',
    collapseThread: 'Collapse thread',
    collapseThreadLabel: 'Collapse this thread',
    activity: 'Activity',
    noActivityYet: 'No activity in this turn yet.',
    showActivity: 'Show room activity',
    hideActivity: 'Hide room activity',
    activityActorBot: 'A bot',
    activityDidSomething: 'did something',
    activityBy: (member, action) => `${member} ${action}`,
    activityLabels: {
      queued: 'sent a message',
      working: 'is working…',
      replied: 'replied',
      passed: 'passed',
      timedOut: 'took too long',
      failed: 'hit an error',
      cancelled: 'turn interrupted by a newer message',
      settled: 'turn settled',
      capped: 'turn stopped at the round/message cap',
      delivered: 'delivered a late reply',
      held: 'is held (stopped by you) — @mention it or say resume to release',
      stopped: 'stopped the room — remaining turns are held until resumed'
    },
    stop: 'Stop',
    stopHint: 'Stop this run — interrupts the member on turn and holds the rest',
    allHeldStatus: count => `All ${count} bots are paused`,
    heldMembersStatus: members => `Paused: ${members}`,
    holdReleaseHint: 'Mention a paused bot or send @all resume to release them.',
    needsYourInput: 'A bot in this group chat needs your input',
    pictureGenerationFailed: 'Group picture generation failed',
    nameTaken: name => `A group named “${name}” already exists.`,
    noFreeName: 'No free name for the group.',
    memberCount: count => `${count} bots`,
    settingsHint: group => `Group settings — rename ${group} or set a room picture`,
    settingsLabel: group => `Group settings for ${group}`,
    disbandHint: group => `Disband the ${group} group chat`,
    disbandLabel: group => `Disband ${group}`,
    disbandAction: 'Disband',
    disbanding: 'Disbanding…',
    disbandDone: 'Disbanded',
    disbanded: group => `Disbanded “${group}”`,
    disbandDescPrefix: 'This removes the ',
    disbandDescSuffix: count =>
      ` grouping from its ${count} bots and clears the shared room log. The bots themselves and their per-group sessions are kept.`,
    stopped: group => `Stopped ${group} — remaining turns are held until you resume`,
    removeAttachment: 'Remove attachment',
    threadFallback: 'Thread',
    replyCount: replies => `${replies} ${replies === 1 ? 'reply' : 'replies'}`,
    dropToThread: 'Drop to attach to this thread reply',
    dropToRoom: 'Drop to attach — every responding bot sees it',
    waitingForAnswer: 'Waiting for your answer…',
    memberThinking: name => `${name} is thinking…`,
    roomWorking: 'The room is working…',
    messageRoom: group => `Message ${group}`,
    newThreadPlaceholder: group => `New thread in ${group}… (@name to direct, @everyone for all)`,
    everyoneMeta: 'Every bot in the room',
    commandApproval: 'command approval',
    answerFailed: (handle, error) => `Could not send the answer to @${handle}: ${error}`,
    wantsToRunCommand: handle => `@${handle} wants to run a command:`,
    asks: handle => `@${handle} asks:`,
    answerTo: member => `Answer @${member}`
  },
  tools: {
    skillsHub: 'Hermes Skills Hub',
    skillsHubShort: 'Skills Hub',
    filterSkills: 'Filter skills…',
    searchHub: 'Search the hub (community + well-known sources)…',
    noMcpServers: 'No MCP servers configured or in the catalog.',
    provider: 'Provider',
    model: 'Model',
    providerCustom: 'Provider (Custom)',
    modelCustom: 'Model (Custom)',
    backToDropdowns: '← Back to dropdowns',
    inheritLaunchProfile: 'Inherit (launch profile)',
    enterManually: '✏️ Enter manually…',
    gatewayDefault: 'gateway default',
    modelNameExample: 'e.g. model name',
    modelSwitchFailed: 'Model switch failed',
    confirm: 'Confirm',
    fullConfigNeedsGateway: 'Full configuration needs a newer gateway (restart it after updating Hermes).',
    remoteCapabilitiesNeedDesktop:
      'Remote capabilities require a newer desktop. Model and SOUL changes remain staged until you save.',
    capabilitiesImmediate: 'Capabilities (applies immediately — skills, tools, MCP)',
    soulConfig: 'SOUL.md (persona + agent-messaging protocol)',
    skillsEnabled: (enabled, total) => `Skills (${enabled}/${total} enabled)`,
    toolsetsEnabled: (enabled, total) => `Toolsets (${enabled}/${total} enabled — unchecking all restores the default)`,
    mcpServers: 'MCP servers',
    catalog: 'catalog',
    catalogInstalled: 'catalog · installed',
    searching: 'Searching…',
    searchAction: 'Search',
    searchingHub: 'Searching community + well-known sources — can take ~10s…',
    noHubSkills: 'No hub skills matched.',
    added: '✓ added',
    hideHubBrowser: 'hide the hub browser',
    browseFullHub: 'browse the full hub ▾',
    installing: name => `Installing “${name}”…`,
    installHint:
      'Hit "+ Add to this Agent" on any skill — it installs and appears in the list above. Drag the corner to resize.',
    skillInstalled: name => `Skill “${name}” installed`,
    skillInstallFailed: name => `Installing “${name}” failed`,
    setupDone: 'set up ✓',
    saveAndTest: 'Save & test',
    working: 'Working…',
    retry: 'retry',
    setupFailed: 'Setup failed',
    needsSetup: requires => `needs setup (${requires}) — restart the gateway to enable in-app setup`,
    signIn: 'Sign in…',
    setUp: 'Set up…',
    authorizing: 'Authorizing…',
    couldNotAddServer: 'Could not add server',
    noTargetProfile: 'No target profile',
    failedToSet: key => `Failed to set ${key}`,
    serverTestFailed: 'Server test failed after setup',
    couldNotStartOAuth: 'Could not start OAuth',
    oauthCallbackFailed: 'OAuth callback relay failed',
    completeSignIn: 'Complete sign-in in your browser…',
    oauthFailed: 'OAuth failed',
    configured: name => `${name} configured`,
    authenticated: name => `${name} authenticated`
  },
  cron: {
    untitledJob: 'Untitled job',
    detailDescription: 'What this job runs, and when it runs next.',
    statusLabel: 'Status',
    scheduleLabel: 'Schedule',
    repeatLabel: 'Repeat',
    modelLabel: 'Model',
    activeLabel: 'Active',
    pausedLabel: 'Paused',
    scheduleRawLabel: 'Schedule (raw)',
    nextRunLabel: 'Next run',
    lastRunLabel: 'Last run',
    lastResultLabel: 'Last result',
    resultSucceeded: 'Succeeded',
    resultFailed: 'Failed',
    resultDeliveryFailed: 'Ran, but delivery failed',
    resultBlockedConfig: 'Blocked by configuration (not run)',
    deliversToLabel: 'Delivers to',
    workingDirectoryLabel: 'Working directory',
    legacyPaused: 'Paused for security: delete and recreate this legacy job before running it again.',
    minutesFromNow: 'minutes from now',
    hoursFromNow: 'hours from now',
    daysFromNow: 'days from now',
    nameNulError: 'Job name cannot contain NUL (U+0000).',
    instructionNulError: 'Job instruction cannot contain NUL (U+0000).',
    filterHint:
      'Scheduled jobs exist in this profile but none are tagged for this bot. Name a job "[bot:<name>] …" to show it here, or see them in Cron below.',
    needsRosterFirst: 'This bot has to appear in the roster first.',
    staleNotice: 'Could not refresh scheduled jobs. Showing the last list we had.',
    readFailure: 'The list may still be there — this was a read failure, not a delete.',
    createDesc: bot => `A recurring task ${bot} runs on a schedule. Runs land in its own chat history.`,
    instruction: 'Instruction',
    whenToRun: 'When to run',
    dayOfMonth: 'Day of month',
    sendResultsTo: 'Send results to',
    runHistoryOnly: 'Run history only',
    botChatTarget: bot => `${bot}’s chat (bot responds)`,
    continuity: 'Continuity: each run sees the previous run’s output (dedupe, continue where it left off)',
    stopAfter: 'Stop after',
    runsForeverHint: 'runs (blank = forever)',
    onceIn: when => `Once (${when})`,
    everyNDays: days => `Every ${days} days`,
    everyNHours: hours => `Every ${hours}h`,
    everyNMinutes: minutes => `Every ${minutes}m`,
    freqOnce: 'Once, in…',
    freqHourly: 'Every hour',
    freqDaily: 'Every day',
    freqWeekdays: 'Weekdays',
    freqWeekly: 'Every week',
    freqMonthly: 'Every month',
    freqInterval: 'Interval',
    freqAdvanced: 'Advanced…',
    unitMinutes: 'minute(s)',
    unitHours: 'hour(s)',
    unitDays: 'day(s)',
    runsOnce: (count, unit) => `Runs once, ${count} ${unit} from now`,
    runsHourly: 'Runs at the top of every hour',
    runsDaily: time => `Runs every day at ${time}`,
    runsWeekdays: time => `Runs Monday–Friday at ${time}`,
    runsWeekly: (day, time) => `Runs every ${day} at ${time}`,
    runsMonthly: (day, time) => `Runs on day ${day} of each month at ${time}`,
    runsInterval: (count, unit) => `Runs every ${count} ${unit}`,
    runsRaw: 'Raw schedule — every Nm/Nh/Nd or 5-field cron',
    timesTotal: count => `, ${count} time(s) total`
  }
}

const ja: BotsMessages = {
  roster: {
    title: 'ボット',
    search: 'ボットとグループチャットを検索',
    searchPlaceholder: 'ボットとグループチャットを検索…',
    newBotOrGroup: '新しいボットまたはグループチャット',
    newMenu: '新規作成…',
    activityToastsOn: 'アクティビティ通知はオン — クリックでミュート',
    activityToastsOff: 'アクティビティ通知はオフ — クリックで有効化',
    newMessageFor: name => `🤖 ${name}への新しいメッセージ`,
    newActivityFor: name => `${name}に新しいアクティビティがあります`,
    openChatToSee: 'チャットを開いて確認してください。',
    gatewayFallback: 'ゲートウェイ',
    couldNotReach: target => `${target}に接続できませんでした`,
    couldNotOpenChat: name => `${name}のチャットを開けませんでした — もう一度お試しください`,
    allGateways: 'すべてのゲートウェイ',
    currentGateway: '現在のゲートウェイ',
    filter: '名簿を絞り込み',
    filterActive: count => `名簿を絞り込み、${count}件有効`,
    filtersActive: count => `フィルタ（${count}件有効）`,
    hiddenLabel: '非表示',
    refreshFailed: '名簿を更新できませんでした。最後に取得できたリストを表示しています。',
    reconnecting: ' ゲートウェイの再接続を待っています…',
    gatewayError: 'ゲートウェイエラー',
    thisDevice: 'このデバイス',
    attentionAuth: 'このプロファイルでもう一度サインインしてください',
    attentionQuota: '割り当てまたは残高を使い切りました',
    attentionMissingConfig: 'プロバイダーが未設定です — hermes model を実行してください',
    attentionBlocked: 'ボットがブロックされています — 最後のメッセージを確認してください',
    groupChats: 'グループチャット',
    emptyTitle: 'ボットはまだありません',
    emptyDesc: '最初のボットを作成しましょう。',
    noMatchQuery: query => `「${query}」に一致するボットやグループチャットはありません`,
    noMatchQueryOn: (query, gateway) => `${gateway} に「${query}」に一致するボットやグループチャットはありません`,
    noMatchFiltersOn: gateway => `${gateway} にこれらのフィルタに一致するボットやグループチャットはありません`,
    noMatchFilters: 'これらのフィルタに一致するボットやグループチャットはありません。',
    clearFilters: 'フィルタをクリア',
    allHidden: 'すべてのボットが非表示です',
    allHiddenDesc: '非表示でも動作を続け、履歴も残ります。',
    showHidden: '非表示のボットを表示',
    noHiddenMatch: 'これらのフィルタに一致する非表示ボットはありません。',
    hiddenFromRoster: '名簿から非表示',
    pinned: 'ピン留め',
    needsAttention: '要対応',
    needsInput: '入力が必要です',
    botsAndGroups: 'ボットとグループチャット',
    botsOnly: 'ボットのみ',
    groupsOnly: 'グループチャットのみ',
    anyActivity: 'すべてのアクティビティ',
    activeNow: '現在アクティブ',
    recentlyActive: '最近アクティブ',
    older: '以前',
    gatewayRemoved: 'ゲートウェイが削除されました',
    onDemand: 'オンデマンド',
    ready: '準備完了',
    statusUnknown: '状態不明',
    unavailable: '利用できません',
    retryNow: '今すぐ再試行',
    rosterUnavailable: reason =>
      `名簿を取得できません: ${reason}。ゲートウェイが profiles.list より前の場合は、Hermes を更新してゲートウェイを再起動してください。`,
    waitingForGateway: 'ゲートウェイ接続を待っています…（リモートは数秒かかることがあります。自動で再試行します）'
  },
  sections: {
    newSection: '新しいセクション',
    newTitle: '新しいセクション',
    renameTitle: 'セクション名を変更',
    nameLabel: 'セクション名',
    namePlaceholder: '例: クライアント',
    create: '作成',
    rename: '名前を変更…',
    moveUp: '上へ移動',
    moveDown: '下へ移動',
    unassigned: '未分類',
    options: name => `${name} セクションのオプション`,
    headingTip: 'ここにボットをドロップ · ダブルクリックで名前を変更',
    emptyHint: 'ここにボットをドラッグ',
    moveTo: 'セクションへ移動',
    newSectionEllipsis: '新しいセクション…',
    removeFromSection: 'セクションから外す',
    deleted: (name, count) =>
      count === 0
        ? `「${name}」を削除しました`
        : `「${name}」を削除しました — ${count} 件のボットを未分類に移動しました`,
    undo: '元に戻す'
  },
  bot: {
    newTitle: '新しいボット',
    newDescription:
      '独自のメモリ、スキル、チャットを持つ名前付きのチームメイトです。他のエージェントにメッセージを送れます。',
    nameLabel: '名前',
    titleLabel: 'タイトル',
    titlePlaceholder: '受信トレイの整理',
    descriptionLabel: '説明',
    creating: '作成中…',
    createAction: 'ボットを作成',
    created: name => `ボット「${name}」を作成しました`,
    createdOn: (name, target) => `${target}にボット「${name}」を作成しました`,
    draftDiscarded: name => `下書きボット「${name}」を破棄しました`,
    couldNotCleanDraft: name => `下書きプロファイル「${name}」を削除できませんでした`,
    createOn: '作成先',
    currentConnection: name => `${name}（現在）`,
    remoteLocation: target =>
      `ボットは ${target} 上に作成され、接続先ボットとして名簿に表示されます。チャットはそのマシンにルーティングされます。`,
    tabGeneral: '一般',
    tabCapabilities: '機能',
    tabSkills: 'スキル',
    tabTools: 'ツール',
    tabMcp: 'MCP',
    inheritedFromLaunchProfile: '起動プロファイルから継承',
    soulOptional: 'SOUL.md（任意 — 生成されたペルソナを置き換えます）',
    shareKeys: 'メインプロファイルとキーおよびアカウントを共有',
    shareKeysDesc:
      'サブスクリプション、OAuth ログイン、API キーはコピーせず共有されるため、トークン更新で互いが無効になることはありません。分離したスナップショットを作る場合はオフにしてください。',
    createEmpty: '空で作成（同梱スキルを省略）',
    nameTakenForCapabilities: 'その名前は使用済みです。機能を設定する前に別の名前を選んでください。',
    nameFirstForCapabilities:
      '先にボットへ名前を付けてください。このタブを開くと下書きプロファイルが作成され、キャンセル時に破棄されます。',
    skillsNeedNewDesktop: 'スキルを使用するには新しい Hermes Desktop が必要です。',
    capabilityCatalogNeedsGateway:
      '機能カタログには新しいゲートウェイが必要です（Hermes の更新後に再起動してください）。',
    createEmptySkillsNotice: '「空で作成」が選択されているため、同梱スキルはインストールされません。',
    catalogFrom: source => `${source} のカタログ — チェックを外したスキルは作成後に無効になります。`,
    defaultToolsetBehavior: 'すべて（または何も）選択した場合は、既定のツールセット動作が維持されます。',
    catalog: 'カタログ',
    catalogInstalled: 'カタログ · インストール済み',
    configuredServersDesc:
      '設定済みサーバーはメインプロファイルからコピーされ、カタログ項目は同梱 MCP メニューから取得されます。API キーが必要な項目は先にセットアップへ進みます（認証情報はキー共有設定に従います）。',
    pin: '上部にピン留め',
    unpin: 'ピン留めを解除',
    pinChanged: (name, pinned) => `${name}を${pinned ? '上部にピン留めしました' : 'ピン留めから外しました'}`,
    hide: '非表示',
    unhide: '再表示',
    hiddenChanged: (name, hidden) =>
      hidden ? `${name}を非表示にしました。ボット見出しの目のボタンで表示できます` : `${name}を名簿に戻しました`,
    metadataLoadFailed: 'ボットのメタデータを読み込めませんでした',
    loadFailed: 'ボットを読み込めませんでした',
    groupsLoadFailed: 'ボットのグループを読み込めませんでした',
    groups: names => `グループ：${names}…`,
    manageGroups: 'グループを管理…',
    duplicating: name => `${name}を複製中…`,
    duplicated: (name, source) => `${name}を作成しました — ${source}の完全なコピー`,
    deleteDescription: (name, path) =>
      path
        ? `ボット ${name} と ${path} にある関連 Hermes プロファイルを完全に削除します。この操作は元に戻せません。`
        : `ボット ${name} と関連 Hermes プロファイルを完全に削除します。この操作は元に戻せません。`,
    deleting: '削除中…',
    deleted: '削除しました',
    deletedProfile: name => `プロファイル ${name} を削除しました`,
    cloneFromProfile: 'プロファイルから複製',
    cloneFromProfileOn: target => `${target} 上のプロファイルから複製`,
    defaultProfileName: 'デフォルト',
    freshProfile: '新規プロファイル（同梱スキル）',
    editTitle: 'プロファイルを編集',
    editDescription: (name, profile) => `${name} の外観と役割（プロファイル：${profile}）。`,
    editMenu: '編集…',
    updated: name => `${name}を更新しました`,
    advancedSectionsFailed: sections => `一部の項目を更新できませんでした：${sections}`,
    helpPromptPlaceholder: 'このボットは何を手伝いますか？',
    descriptionHint: '空欄のままにすると、ボットの名前と説明から生成します。',
    newChatWith: 'このボットと新しいチャット',
    openBotChat: 'ボットチャットを開く',
    duplicate: '複製',
    duplicateFailed: '複製に失敗しました',
    noFreeDuplicateName: '複製に使える名前がありません。',
    defaultProfileCannotDelete: 'デフォルトプロファイルは削除できません。',
    sourceScopedDeleteUnsupported: 'このバージョンの Hermes Desktop では、その接続上のプロファイルを削除できません。',
    couldNotDeleteProfile: name => `プロファイル ${name} を削除できませんでした。`,
    deleteTitle: 'ボットとプロファイルを削除しますか？',
    removeFromAllGroups: 'すべてのグループから外す',
    createFirstHint: 'ボットパネルを開いて「新しいボット」を押してください。',
    createFailed: 'プロファイルをまだ作成できませんでした',
    advanced: '詳細設定',
    advancedHint: '詳細設定 — モデル、スキル、ツールセット、SOUL.md',
    advancedFailed: '詳細設定に失敗しました',
    openAnotherChatUnsupported: '別のボットチャットを開くには Hermes Desktop を更新してください。',
    remoteConnectionsUnsupported: '他の接続上のボットとチャットするには Hermes Desktop を更新してください。',
    storedSessionsUnsupported: 'このバージョンの Hermes Desktop では保存済みセッションを開けません。',
    updateGatewayTitle: 'ボットモードを使うにはこのゲートウェイを更新してください',
    updateGatewayMessage: gateway => `${gateway}を更新してから、もう一度お試しください。`,
    workspaceSelectionRequired: '先にボットまたはグループを選択してください。',
    chatEmpty: '何か書いて始めましょう。',
    chatNeverResetsTitle: 'このチャットはリセットされません',
    chatNeverResetsMessage:
      'ボットチャットは1つの会話として続くため、代わりに圧縮します。このボットとの一時的なセッションにはセッションモードを使用してください。',
    kickoff: 'こんにちは、自己紹介をしてください！'
  },
  avatar: {
    auto: '自動',
    autoTitle: '自動 — 名前から決定',
    lockTitle: '名前を変更してもこの顔を保持',
    unlock: 'ロック解除',
    lockFace: '顔をロック',
    lockedHint: '顔はロック済みです。名前を変えても変化しません。',
    followsNameHint: '顔は名前に合わせて変化します。',
    noImageModel:
      '利用できる画像モデルがありません。モデルを有効化した直後（または Hermes の更新直後）は、ゲートウェイを再起動してください：Ctrl+K →「ゲートウェイを再起動」。',
    checkingImageBackend: '画像バックエンドを確認中…',
    chooseImage: '画像を選択…',
    noPets: 'petdex ギャラリーにペットがありません。`hermes pets` を実行して探してください。',
    noPetsMatch: '一致するペットはありません。',
    searchPets: count => `${count}匹のペットを検索…`,
    classicShapes: 'クラシックシェイプ',
    blobFromName: 'ブロブ顔 — ボットの名前から描画',
    unlockFollowsName: 'ロック解除 — 顔がボットの名前に再び追従します',
    randomize: 'ランダム',
    tabBot: 'ボット',
    tabGenerate: '生成',
    upload: 'アップロード',
    tabPet: 'ペット',
    removeImage: '画像を削除してシェイプを使う',
    removeBackToShape: '削除 — シェイプアバターに戻す',
    describePlaceholder: 'アバターを説明…',
    describeHint: '空欄のままにすると、名前・タイトル・説明と agent-messaging の名簿から自動生成します。',
    matchTheName: '名前に合わせる',
    pickPet: 'このボットのプロフィール画像としてペットを選びます。',
    petLoadFailed: 'そのペットを読み込めませんでした。別のペットを試してください。',
    imageTooLarge: '画像が大きすぎます（最大 15MB）。',
    generationFailed: 'アバターの生成に失敗しました',
    savedLocally: '見た目はローカルに保存されましたが、リモートへの保存に失敗しました',
    savedLocallyDescriptionFailed: '見た目はローカルに保存されましたが、説明の更新に失敗しました',
    generate: '生成',
    generating: '生成中…'
  },
  group: {
    newTitle: '新しいグループチャット',
    newGroupPlaceholder: 'グループ名（例：リサーチ）',
    createAndJoin: '作成して参加',
    noBotsYet: 'ボットはまだありません。先に作成してください。',
    pickAtLeastTwo: 'ボットを2体以上選択してください',
    createWithCount: count => `グループを作成${count ? `（${count}）` : ''}`,
    groupCreated: (name, count) => `「${name}」をボット${count}体で作成しました`,
    addedToGroup: (bot, group) => `${bot}を「${group}」に追加しました`,
    removedFromGroup: (bot, group) => `${bot}を「${group}」から外しました`,
    openGroupChat: 'グループチャットを開く',
    noBotsInGroup: 'このグループチャットにはボットがいません',
    hideFullHandle: '完全なハンドルを隠す',
    showFullHandle: '完全なハンドルを表示',
    ownAnswerPlaceholder: 'または自分の回答を入力…',
    answerPlaceholder: '回答を入力…',
    sending: '送信中…',
    you: 'あなた',
    availableCount: (available, total) => `${total}体中${available}体が利用可能`,
    attachedFile: '添付ファイル',
    attachedImage: '添付画像',
    attachmentFallback: '添付ファイル',
    pastedImage: '貼り付けた画像',
    attachmentTooLarge: name => `${name}：サイズが大きすぎます（最大15MB）。`,
    emptyResponse:
      '⚠️ ツール結果の処理後にモデルから応答がありませんでした。一部のモデルで発生することがあります。もう一度試すか、質問を言い換えてください。',
    newConversationHint: '新しいグループ会話はグループ作成画面から始めます。',
    manageDesc: 'ボットは複数のグループチャットに参加できます。メンバーシップはすべてのマシンに同期されます。',
    manageTitle: 'グループを管理',
    settingsTitle: 'グループ設定',
    settingsDesc: 'グループ名の変更や部屋の画像の設定ができます。メンバーと履歴は保持されます。',
    nameLabel: 'グループ名',
    searchToAdd: '追加するボットを検索',
    searchToAddPlaceholder: '追加するボットを検索…',
    removeFromSelection: '選択から外す',
    disbandTitle: 'グループチャットを解散しますか？',
    deleteTitle: 'グループチャットを削除しますか？',
    deleteAction: '削除',
    composerPlaceholder: '何か書いてください — このグループのすべてのボットが部屋の内容を受け取ります。',
    attachHint: 'ファイルを添付 — 応答するすべてのボットが見ます',
    newThread: '新しいスレッド',
    reply: '返信',
    replyInThread: 'スレッドで返信',
    replyInThreadPlaceholder: 'スレッドで返信…',
    openThread: 'このスレッドを開く',
    collapseThread: 'スレッドを折りたたむ',
    collapseThreadLabel: 'このスレッドを折りたたむ',
    activity: 'アクティビティ',
    noActivityYet: 'このターンのアクティビティはまだありません。',
    showActivity: '部屋のアクティビティを表示',
    hideActivity: '部屋のアクティビティを隠す',
    activityActorBot: 'ボット',
    activityDidSomething: '何かを実行しました',
    activityBy: (member, action) => `${member}が${action}`,
    activityLabels: {
      queued: 'メッセージを送信しました',
      working: '作業中です…',
      replied: '返信しました',
      passed: 'パスしました',
      timedOut: '時間がかかりすぎました',
      failed: 'エラーが発生しました',
      cancelled: '新しいメッセージによりターンが中断されました',
      settled: 'ターンが完了しました',
      capped: 'ラウンド／メッセージ上限でターンを停止しました',
      delivered: '遅れて届いた返信を配信しました',
      held: '保留中です（あなたが停止）— @メンションするか「resume」と入力して解除してください',
      stopped: 'ルームを停止しました — 再開するまで残りのターンは保留されます'
    },
    stop: '停止',
    stopHint: 'この実行を停止 — ターン中のメンバーを中断し、残りを保留します',
    allHeldStatus: count => `すべてのボット（${count}体）が一時停止中`,
    heldMembersStatus: members => `一時停止中: ${members}`,
    holdReleaseHint: '一時停止中のボットにメンションするか、@all resume を送信して再開します。',
    needsYourInput: 'このグループチャットのボットが入力を待っています',
    pictureGenerationFailed: 'グループ画像の生成に失敗しました',
    nameTaken: name => `「${name}」という名前のグループはすでに存在します。`,
    noFreeName: 'グループに使える名前がありません。',
    memberCount: count => `ボット${count}体`,
    settingsHint: group => `グループ設定 — ${group}の名前変更やルーム画像の設定`,
    settingsLabel: group => `${group}のグループ設定`,
    disbandHint: group => `${group}グループチャットを解散`,
    disbandLabel: group => `${group}を解散`,
    disbandAction: '解散',
    disbanding: '解散中…',
    disbandDone: '解散しました',
    disbanded: group => `「${group}」を解散しました`,
    disbandDescPrefix: '',
    disbandDescSuffix: count =>
      `のグループ分けをボット${count}体から解除し、共有ルームログを消去します。ボット自体と各グループのセッションは保持されます。`,
    stopped: group => `${group}を停止しました — 残りのターンは再開するまで保留されます`,
    removeAttachment: '添付を削除',
    threadFallback: 'スレッド',
    replyCount: replies => `返信${replies}件`,
    dropToThread: 'ドロップしてこのスレッド返信に添付',
    dropToRoom: 'ドロップして添付 — 応答するすべてのボットが見られます',
    waitingForAnswer: 'あなたの回答を待っています…',
    memberThinking: name => `${name}が考えています…`,
    roomWorking: 'ルームが作業中です…',
    messageRoom: group => `${group}にメッセージ`,
    newThreadPlaceholder: group => `${group}で新しいスレッド…（@名前で個別、@everyoneで全員）`,
    everyoneMeta: 'ルーム内のすべてのボット',
    commandApproval: 'コマンドの承認',
    answerFailed: (handle, error) => `@${handle}に回答を送信できませんでした: ${error}`,
    wantsToRunCommand: handle => `@${handle}がコマンドを実行しようとしています:`,
    asks: handle => `@${handle}からの質問:`,
    answerTo: member => `@${member}に回答`
  },
  tools: {
    skillsHub: 'Hermes スキルハブ',
    skillsHubShort: 'スキルハブ',
    filterSkills: 'スキルを絞り込み…',
    searchHub: 'ハブを検索（コミュニティと既知のソース）…',
    noMcpServers: '設定済みまたはカタログ内の MCP サーバーはありません。',
    provider: 'プロバイダー',
    model: 'モデル',
    providerCustom: 'プロバイダー（カスタム）',
    modelCustom: 'モデル（カスタム）',
    backToDropdowns: '← ドロップダウンに戻る',
    inheritLaunchProfile: '継承（起動プロファイル）',
    enterManually: '✏️ 手動入力…',
    gatewayDefault: 'ゲートウェイの既定値',
    modelNameExample: '例：モデル名',
    modelSwitchFailed: 'モデルの切り替えに失敗しました',
    confirm: '確認',
    fullConfigNeedsGateway: '完全な設定には新しいゲートウェイが必要です（Hermes の更新後に再起動してください）。',
    remoteCapabilitiesNeedDesktop:
      'リモート機能には新しいデスクトップが必要です。モデルと SOUL の変更は保存するまで保留されます。',
    capabilitiesImmediate: '機能（すぐに適用 — スキル、ツール、MCP）',
    soulConfig: 'SOUL.md（ペルソナ + エージェント間メッセージングプロトコル）',
    skillsEnabled: (enabled, total) => `スキル（${enabled}/${total} 有効）`,
    toolsetsEnabled: (enabled, total) => `ツールセット（${enabled}/${total} 有効 — すべて外すと既定に戻ります）`,
    mcpServers: 'MCP サーバー',
    catalog: 'カタログ',
    catalogInstalled: 'カタログ · インストール済み',
    searching: '検索中…',
    searchAction: '検索',
    searchingHub: 'コミュニティと既知のソースを検索中 — 約10秒かかる場合があります…',
    noHubSkills: '一致するハブスキルはありません。',
    added: '✓ 追加済み',
    hideHubBrowser: 'ハブブラウザーを隠す',
    browseFullHub: 'ハブ全体を閲覧 ▾',
    installing: name => `「${name}」をインストール中…`,
    installHint:
      '任意のスキルで「+ このエージェントに追加」を押すと、インストールされて上の一覧に表示されます。隅をドラッグしてサイズを変更できます。',
    skillInstalled: name => `スキル「${name}」をインストールしました`,
    skillInstallFailed: name => `「${name}」のインストールに失敗しました`,
    setupDone: 'セットアップ済み ✓',
    saveAndTest: '保存してテスト',
    working: '処理中…',
    retry: '再試行',
    setupFailed: 'セットアップに失敗しました',
    needsSetup: requires => `セットアップが必要（${requires}）— アプリ内設定を有効にするにはゲートウェイを再起動`,
    signIn: 'サインイン…',
    setUp: 'セットアップ…',
    authorizing: '認証中…',
    couldNotAddServer: 'サーバーを追加できませんでした',
    noTargetProfile: '対象プロファイルがありません',
    failedToSet: key => `${key} を設定できませんでした`,
    serverTestFailed: 'セットアップ後のサーバーテストに失敗しました',
    couldNotStartOAuth: 'OAuth を開始できませんでした',
    oauthCallbackFailed: 'OAuth コールバックの中継に失敗しました',
    completeSignIn: 'ブラウザーでサインインを完了してください…',
    oauthFailed: 'OAuth に失敗しました',
    configured: name => `${name} を設定しました`,
    authenticated: name => `${name} を認証しました`
  },
  cron: {
    untitledJob: '無題のジョブ',
    detailDescription: 'このジョブの実行内容と次回の実行時刻です。',
    statusLabel: '状態',
    scheduleLabel: 'スケジュール',
    repeatLabel: '繰り返し',
    modelLabel: 'モデル',
    activeLabel: '有効',
    pausedLabel: '一時停止',
    scheduleRawLabel: 'スケジュール（生データ）',
    nextRunLabel: '次回の実行',
    lastRunLabel: '前回の実行',
    lastResultLabel: '前回の結果',
    resultSucceeded: '成功',
    resultFailed: '失敗',
    resultDeliveryFailed: '実行済みですが、配信に失敗しました',
    resultBlockedConfig: '設定によりブロック（未実行）',
    deliversToLabel: '配信先',
    workingDirectoryLabel: '作業ディレクトリ',
    legacyPaused: 'セキュリティのため一時停止中です。再実行する前に、この旧形式のジョブを削除して作り直してください。',
    minutesFromNow: '分後',
    hoursFromNow: '時間後',
    daysFromNow: '日後',
    nameNulError: 'ジョブ名に NUL（U+0000）は使用できません。',
    instructionNulError: 'ジョブの指示に NUL（U+0000）は使用できません。',
    filterHint:
      'このプロファイルには定期実行ジョブがありますが、このボット向けのタグが付いたものはありません。ジョブ名を「[bot:<名前>] …」にするとここに表示されます。下のCronでも確認できます。',
    needsRosterFirst: 'このボットは先に名簿に表示される必要があります。',
    staleNotice: '定期実行ジョブを更新できませんでした。最後に取得したリストを表示しています。',
    readFailure: 'リストはまだ存在している可能性があります — これは読み取りの失敗で、削除ではありません。',
    createDesc: bot => `${bot}がスケジュールに沿って実行する定期タスクです。実行結果は専用のチャット履歴に残ります。`,
    instruction: '指示',
    whenToRun: '実行するタイミング',
    dayOfMonth: '日付',
    sendResultsTo: '結果の送信先',
    runHistoryOnly: '実行履歴のみ',
    botChatTarget: bot => `${bot}のチャット（ボットが応答）`,
    continuity: '継続: 各実行が前回の出力を参照します（重複を避け、続きから実行）',
    stopAfter: '停止回数',
    runsForeverHint: '回実行（空欄 = 無制限）',
    onceIn: when => `1回のみ（${when}）`,
    everyNDays: days => `${days}日ごと`,
    everyNHours: hours => `${hours}時間ごと`,
    everyNMinutes: minutes => `${minutes}分ごと`,
    freqOnce: '1回のみ、…後',
    freqHourly: '毎時',
    freqDaily: '毎日',
    freqWeekdays: '平日',
    freqWeekly: '毎週',
    freqMonthly: '毎月',
    freqInterval: '間隔',
    freqAdvanced: '詳細…',
    unitMinutes: '分',
    unitHours: '時間',
    unitDays: '日',
    runsOnce: (count, unit) => `今から${count}${unit}後に1回実行します`,
    runsHourly: '毎時0分に実行します',
    runsDaily: time => `毎日${time}に実行します`,
    runsWeekdays: time => `月曜〜金曜の${time}に実行します`,
    runsWeekly: (day, time) => `毎週${day}の${time}に実行します`,
    runsMonthly: (day, time) => `毎月${day}日の${time}に実行します`,
    runsInterval: (count, unit) => `${count}${unit}ごとに実行します`,
    runsRaw: '生のスケジュール — Nm/Nh/Nd または5フィールドのcron',
    timesTotal: count => `、合計${count}回`
  }
}

const zh: BotsMessages = {
  roster: {
    title: '智能体',
    search: '搜索智能体和群聊',
    searchPlaceholder: '搜索智能体和群聊…',
    newBotOrGroup: '新建智能体或群聊',
    newMenu: '新建…',
    activityToastsOn: '活动通知已开启 — 点击静音',
    activityToastsOff: '活动通知已关闭 — 点击启用',
    newMessageFor: name => `🤖 ${name} 收到新消息`,
    newActivityFor: name => `${name} 有新活动`,
    openChatToSee: '打开聊天即可查看。',
    gatewayFallback: '网关',
    couldNotReach: target => `无法连接到${target}`,
    couldNotOpenChat: name => `无法打开“${name}”的聊天 — 请重试`,
    allGateways: '所有网关',
    currentGateway: '当前网关',
    filter: '筛选名单',
    filterActive: count => `筛选名单，已启用 ${count} 项`,
    filtersActive: count => `筛选（已启用 ${count} 项）`,
    hiddenLabel: '已隐藏',
    refreshFailed: '智能体名单刷新失败，正在显示上次成功加载的列表',
    reconnecting: ' 正在等待网关重新连接…',
    gatewayError: '网关错误',
    thisDevice: '此设备',
    attentionAuth: '请重新登录此配置档案',
    attentionQuota: '配额或余额已耗尽',
    attentionMissingConfig: '尚未配置提供商 — 请运行 hermes model',
    attentionBlocked: '智能体已阻塞 — 请查看它的最后一条消息',
    groupChats: '群聊',
    emptyTitle: '还没有智能体',
    emptyDesc: '创建你的第一个智能体。',
    noMatchQuery: query => `没有智能体或群聊匹配“${query}”`,
    noMatchQueryOn: (query, gateway) => `${gateway} 上没有智能体或群聊匹配“${query}”`,
    noMatchFiltersOn: gateway => `${gateway} 上没有智能体或群聊匹配这些筛选条件`,
    noMatchFilters: '没有智能体或群聊匹配这些筛选条件。',
    clearFilters: '清除筛选',
    allHidden: '所有智能体都已隐藏',
    allHiddenDesc: '它们会继续运行，并保留各自的历史。',
    showHidden: '显示已隐藏的智能体',
    noHiddenMatch: '没有已隐藏的智能体匹配这些筛选条件。',
    hiddenFromRoster: '已从名单中隐藏',
    pinned: '已置顶',
    needsAttention: '需要处理',
    needsInput: '需要你输入',
    botsAndGroups: '智能体和群聊',
    botsOnly: '仅智能体',
    groupsOnly: '仅群聊',
    anyActivity: '任何活动',
    activeNow: '正在活动',
    recentlyActive: '最近活跃',
    older: '更早',
    gatewayRemoved: '网关已移除',
    onDemand: '按需',
    ready: '就绪',
    statusUnknown: '状态未知',
    unavailable: '不可用',
    retryNow: '立即重试',
    rosterUnavailable: reason => `无法获取名单：${reason}。如果网关早于 profiles.list，请更新 Hermes 并重启网关。`,
    waitingForGateway: '正在等待网关连接…（远程网关可能需要几秒；会自动重试）'
  },
  sections: {
    newSection: '新建分区',
    newTitle: '新建分区',
    renameTitle: '重命名分区',
    nameLabel: '分区名称',
    namePlaceholder: '例如：客户',
    create: '创建',
    rename: '重命名…',
    moveUp: '上移',
    moveDown: '下移',
    unassigned: '未分类',
    options: name => `${name} 分区选项`,
    headingTip: '将机器人拖放到此处 · 双击重命名',
    emptyHint: '将机器人拖到此处',
    moveTo: '移动到分区',
    newSectionEllipsis: '新建分区…',
    removeFromSection: '移出分区',
    deleted: (name, count) => (count === 0 ? `已删除“${name}”` : `已删除“${name}” — ${count} 个机器人已移至未分类`),
    undo: '撤销'
  },
  bot: {
    newTitle: '新建智能体',
    newDescription: '一个拥有自己记忆、技能和聊天的具名队友。它可以向你的其他智能体发送消息',
    nameLabel: '名称',
    titleLabel: '标题',
    titlePlaceholder: '收件箱整理',
    descriptionLabel: '描述',
    creating: '创建中…',
    createAction: '创建智能体',
    created: name => `已创建智能体“${name}”`,
    createdOn: (name, target) => `已在 ${target} 上创建智能体“${name}”`,
    draftDiscarded: name => `已丢弃智能体草稿“${name}”`,
    couldNotCleanDraft: name => `无法清理草稿配置档案“${name}”`,
    createOn: '创建位置',
    currentConnection: name => `${name}（当前）`,
    remoteLocation: target => `智能体将在 ${target} 上创建，并作为连接中的智能体显示在名单中；聊天会路由到该设备`,
    tabGeneral: '常规',
    tabCapabilities: '能力',
    tabSkills: '技能',
    tabTools: '工具',
    tabMcp: 'MCP',
    inheritedFromLaunchProfile: '继承自启动配置档案',
    soulOptional: 'SOUL.md（可选，将替换自动生成的角色设定）',
    shareKeys: '与主配置档案共享密钥和账号',
    shareKeysDesc:
      '订阅、OAuth 登录和 API 密钥保持共享而非复制，因此令牌刷新不会使其他配置档案失效。取消勾选可创建隔离的快照副本',
    createEmpty: '创建空白配置档案（跳过内置技能）',
    nameTakenForCapabilities: '该名称已被占用，请先选择其他名称再配置能力',
    nameFirstForCapabilities: '请先为智能体命名；打开此标签时会创建草稿配置档案（取消时将删除）',
    skillsNeedNewDesktop: '技能需要更新版本的 Hermes Desktop',
    capabilityCatalogNeedsGateway: '能力目录需要更新版本的网关（更新 Hermes 后请重启网关）',
    createEmptySkillsNotice: '已勾选“创建空白配置档案” — 不会安装内置技能',
    catalogFrom: source => `目录来源：${source} — 未勾选的技能会在创建后停用`,
    defaultToolsetBehavior: '全部勾选或全部不勾选时，将保留默认工具集行为',
    catalog: '目录',
    catalogInstalled: '目录 · 已安装',
    configuredServersDesc:
      '已配置的服务器会从主配置档案复制；目录条目来自内置 MCP 菜单。需要 API 密钥的条目会先进入设置流程（凭据遵循共享密钥设置）',
    pin: '置顶',
    unpin: '取消置顶',
    pinChanged: (name, pinned) => `${name}${pinned ? ' 已置顶' : ' 已取消置顶'}`,
    hide: '隐藏',
    unhide: '取消隐藏',
    hiddenChanged: (name, hidden) =>
      hidden ? `${name} 已隐藏 — 可使用智能体标题栏中的眼睛按钮查看隐藏的智能体` : `${name} 已重新显示在名单中`,
    metadataLoadFailed: '无法加载智能体元数据',
    loadFailed: '无法加载智能体',
    groupsLoadFailed: '无法加载智能体群组',
    groups: names => `群组：${names}…`,
    manageGroups: '管理群组…',
    duplicating: name => `正在复制 ${name}…`,
    duplicated: (name, source) => `已创建 ${name} — ${source} 的完整副本`,
    deleteDescription: (name, path) =>
      path
        ? `这将永久删除智能体 ${name} 及其位于 ${path} 的关联 Hermes 配置档案，此操作无法撤销`
        : `这将永久删除智能体 ${name} 及其关联 Hermes 配置档案，此操作无法撤销`,
    deleting: '删除中…',
    deleted: '已删除',
    deletedProfile: name => `已删除配置档案 ${name}`,
    cloneFromProfile: '从配置档克隆',
    cloneFromProfileOn: target => `从配置档克隆（位于 ${target}）`,
    defaultProfileName: '默认',
    freshProfile: '全新配置档（内置技能）',
    editTitle: '编辑配置档案',
    editDescription: (name, profile) => `${name} 的外观与角色（配置档案：${profile}）`,
    editMenu: '编辑…',
    updated: name => `${name} 已更新`,
    advancedSectionsFailed: sections => `部分配置更新失败：${sections}`,
    helpPromptPlaceholder: '这个智能体应该帮你做什么？',
    descriptionHint: '留空则根据智能体的名称和描述生成。',
    newChatWith: '与此智能体开新聊天',
    openBotChat: '打开智能体聊天',
    duplicate: '复制',
    duplicateFailed: '复制失败',
    noFreeDuplicateName: '没有可用于副本的名称。',
    defaultProfileCannotDelete: '无法删除默认配置档案。',
    sourceScopedDeleteUnsupported: '当前版本的 Hermes Desktop 无法删除该连接上的配置档案。',
    couldNotDeleteProfile: name => `无法删除配置档案 ${name}。`,
    deleteTitle: '删除智能体和配置档案？',
    removeFromAllGroups: '从所有群组中移除',
    createFirstHint: '打开智能体面板，点击“新建智能体”。',
    createFailed: '暂时无法创建配置档案',
    advanced: '高级',
    advancedHint: '高级 — 模型、技能、工具集、SOUL.md',
    advancedFailed: '高级配置失败',
    openAnotherChatUnsupported: '请更新 Hermes Desktop 以打开另一个智能体聊天。',
    remoteConnectionsUnsupported: '请更新 Hermes Desktop 以与其他连接上的智能体聊天。',
    storedSessionsUnsupported: '当前版本的 Hermes Desktop 无法打开已保存的会话。',
    updateGatewayTitle: '请更新此网关以使用智能体模式',
    updateGatewayMessage: gateway => `请更新${gateway}，然后重试。`,
    workspaceSelectionRequired: '请先选择一个智能体或群聊。',
    chatEmpty: '说点什么开始吧。',
    chatNeverResetsTitle: '此聊天永不重置',
    chatNeverResetsMessage: '智能体聊天是一段连续对话，因此会改为压缩。如需与此智能体进行临时会话，请使用会话模式',
    kickoff: '你好，介绍一下你自己吧！'
  },
  avatar: {
    auto: '自动',
    autoTitle: '自动 — 由智能体名称决定',
    lockTitle: '即使名称改变，也保留当前头像',
    unlock: '解锁',
    lockFace: '锁定头像',
    lockedHint: '头像已锁定 — 重命名不会改变它',
    followsNameHint: '头像随名称变化',
    noImageModel: '无可用的图像模型。如果你刚刚启用了一个模型（或更新了 Hermes），请重启网关：Ctrl+K →“重启网关”',
    checkingImageBackend: '正在检查图像后端…',
    chooseImage: '选择图片…',
    noPets: '宠物图鉴中没有宠物。运行 `hermes pets` 来探索',
    noPetsMatch: '没有匹配的宠物',
    searchPets: count => `搜索 ${count} 只宠物…`,
    classicShapes: '经典形状',
    blobFromName: '斑点脸 — 根据智能体名称绘制',
    unlockFollowsName: '解锁 — 面孔再次跟随智能体名称',
    randomize: '随机',
    tabBot: '智能体',
    tabGenerate: '生成',
    upload: '上传',
    tabPet: '宠物',
    removeImage: '移除图片，改用形状',
    removeBackToShape: '移除 — 回到形状头像',
    describePlaceholder: '描述你的头像…',
    describeHint: '留空则根据名称/标题/描述和 agent-messaging 名册自动生成。',
    matchTheName: '匹配名称',
    pickPet: '选择一只宠物作为此智能体的头像。',
    petLoadFailed: '无法加载该宠物 — 请换一只试试。',
    imageTooLarge: '图片过大（最大 15MB）。',
    generationFailed: '头像生成失败',
    savedLocally: '外观已保存在本地；远程持久化失败',
    savedLocallyDescriptionFailed: '外观已保存在本地；描述更新失败',
    generate: '生成',
    generating: '生成中…'
  },
  group: {
    newTitle: '新建群聊',
    newGroupPlaceholder: '群组名称（例如：研究）',
    createAndJoin: '创建并加入',
    noBotsYet: '还没有智能体，请先创建一个',
    pickAtLeastTwo: '请至少选择 2 个智能体',
    createWithCount: count => `创建群聊${count ? `（${count}）` : ''}`,
    groupCreated: (name, count) => `已创建“${name}”，包含 ${count} 个智能体`,
    addedToGroup: (bot, group) => `${bot} 已加入“${group}”`,
    removedFromGroup: (bot, group) => `${bot} 已从“${group}”中移除`,
    openGroupChat: '打开群聊',
    noBotsInGroup: '此群聊中没有智能体',
    hideFullHandle: '隐藏完整账号',
    showFullHandle: '显示完整账号',
    ownAnswerPlaceholder: '或者输入你自己的回答…',
    answerPlaceholder: '输入你的回答…',
    sending: '发送中…',
    you: '你',
    availableCount: (available, total) => `${total} 个中有 ${available} 个可用`,
    attachedFile: '附件',
    attachedImage: '附加图片',
    attachmentFallback: '附件',
    pastedImage: '粘贴的图片',
    attachmentTooLarge: name => `${name}过大（最大 15MB）。`,
    emptyResponse: '⚠️ 模型处理工具结果后没有返回响应。某些模型可能出现此情况 — 请重试或换一种方式提问。',
    newConversationHint: '请在群聊创建界面中开始新的群聊',
    manageDesc: '一个智能体可以加入多个群聊。成员关系会同步到每台设备。',
    manageTitle: '管理群组',
    settingsTitle: '群组设置',
    settingsDesc: '重命名群组或设置房间图片。成员和历史都会保留。',
    nameLabel: '群组名称',
    searchToAdd: '搜索要添加的智能体',
    searchToAddPlaceholder: '搜索要添加的智能体…',
    removeFromSelection: '从选择中移除',
    disbandTitle: '解散群聊？',
    deleteTitle: '删除群聊？',
    deleteAction: '删除',
    composerPlaceholder: '说点什么 — 这个群里的每个智能体都会听到。',
    attachHint: '附加文件 — 每个回应的智能体都能看到',
    newThread: '新帖子',
    reply: '回复',
    replyInThread: '在帖子中回复',
    replyInThreadPlaceholder: '在帖子中回复…',
    openThread: '打开此帖子',
    collapseThread: '收起帖子',
    collapseThreadLabel: '收起此帖子',
    activity: '活动',
    noActivityYet: '本回合还没有活动。',
    showActivity: '显示房间活动',
    hideActivity: '隐藏房间活动',
    activityActorBot: '某个智能体',
    activityDidSomething: '执行了操作',
    activityBy: (member, action) => `${member}${action}`,
    activityLabels: {
      queued: '发送了一条消息',
      working: '正在处理…',
      replied: '已回复',
      passed: '已跳过',
      timedOut: '处理超时',
      failed: '遇到错误',
      cancelled: '新消息中断了当前轮次',
      settled: '本轮已结束',
      capped: '达到轮次或消息上限，本轮已停止',
      delivered: '已送达延迟回复',
      held: '已暂停（由你停止）— @提及它或发送“resume”即可恢复',
      stopped: '已停止房间 — 恢复前，其余轮次将保持暂停'
    },
    stop: '停止',
    stopHint: '停止本次运行 — 中断当前回合的成员，并暂停其余成员',
    allHeldStatus: count => `全部 ${count} 个智能体已暂停`,
    heldMembersStatus: members => `已暂停：${members}`,
    holdReleaseHint: '提及已暂停的智能体，或发送 @all resume 以恢复它们。',
    needsYourInput: '此群聊中有智能体需要你输入',
    pictureGenerationFailed: '群组图片生成失败',
    nameTaken: name => `已存在名为“${name}”的群聊。`,
    noFreeName: '没有可用于群组的名称。',
    memberCount: count => `${count} 个智能体`,
    settingsHint: group => `群聊设置 — 重命名 ${group} 或设置房间图片`,
    settingsLabel: group => `${group} 的群聊设置`,
    disbandHint: group => `解散 ${group} 群聊`,
    disbandLabel: group => `解散 ${group}`,
    disbandAction: '解散',
    disbanding: '正在解散…',
    disbandDone: '已解散',
    disbanded: group => `已解散“${group}”`,
    disbandDescPrefix: '',
    disbandDescSuffix: count =>
      ` 的分组将从 ${count} 个智能体中移除，并清空共享房间日志。智能体本身及其各群聊会话都会保留。`,
    stopped: group => `已停止 ${group} — 其余轮次将保留到你恢复为止`,
    removeAttachment: '移除附件',
    threadFallback: '讨论串',
    replyCount: replies => `${replies} 条回复`,
    dropToThread: '拖放以附加到此讨论串回复',
    dropToRoom: '拖放以附加 — 每个回应的智能体都能看到',
    waitingForAnswer: '等待你的回答…',
    memberThinking: name => `${name} 正在思考…`,
    roomWorking: '房间正在处理…',
    messageRoom: group => `发消息给 ${group}`,
    newThreadPlaceholder: group => `在 ${group} 中开启新讨论串…（@名称指定，@everyone 全体）`,
    everyoneMeta: '房间里的所有智能体',
    commandApproval: '命令批准',
    answerFailed: (handle, error) => `无法将回答发送给 @${handle}：${error}`,
    wantsToRunCommand: handle => `@${handle} 想执行一个命令：`,
    asks: handle => `@${handle} 的提问：`,
    answerTo: member => `回答 @${member}`
  },
  tools: {
    skillsHub: 'Hermes 技能中心',
    skillsHubShort: '技能中心',
    filterSkills: '筛选技能…',
    searchHub: '搜索技能中心（社区和常见来源）…',
    noMcpServers: '未配置 MCP 服务器，目录中也没有。',
    provider: '提供商',
    model: '模型',
    providerCustom: '提供商（自定义）',
    modelCustom: '模型（自定义）',
    backToDropdowns: '← 返回下拉选项',
    inheritLaunchProfile: '继承（启动配置档案）',
    enterManually: '✏️ 手动输入…',
    gatewayDefault: '网关默认值',
    modelNameExample: '例如：模型名称',
    modelSwitchFailed: '模型切换失败',
    confirm: '确认',
    fullConfigNeedsGateway: '完整配置需要更新版本的网关（更新 Hermes 后请重启网关）',
    remoteCapabilitiesNeedDesktop: '远程能力需要更新版本的桌面应用。模型和 SOUL 更改会暂存到保存时再应用',
    capabilitiesImmediate: '能力（立即应用：技能、工具、MCP）',
    soulConfig: 'SOUL.md（角色设定 + 智能体消息协议）',
    skillsEnabled: (enabled, total) => `技能（已启用 ${enabled}/${total}）`,
    toolsetsEnabled: (enabled, total) => `工具集（已启用 ${enabled}/${total} — 全部取消勾选可恢复默认值）`,
    mcpServers: 'MCP 服务器',
    catalog: '目录',
    catalogInstalled: '目录 · 已安装',
    searching: '搜索中…',
    searchAction: '搜索',
    searchingHub: '正在搜索社区和常见来源 — 可能需要约 10 秒…',
    noHubSkills: '没有匹配的技能中心技能',
    added: '✓ 已添加',
    hideHubBrowser: '隐藏技能中心浏览器',
    browseFullHub: '浏览完整技能中心 ▾',
    installing: name => `正在安装“${name}”…`,
    installHint: '点击任意技能上的“+ 添加到此智能体”，安装后它会显示在上方列表中。拖动角落可调整大小',
    skillInstalled: name => `技能“${name}”已安装`,
    skillInstallFailed: name => `安装“${name}”失败`,
    setupDone: '已设置 ✓',
    saveAndTest: '保存并测试',
    working: '处理中…',
    retry: '重试',
    setupFailed: '设置失败',
    needsSetup: requires => `需要设置（${requires}）— 重启网关以启用应用内设置`,
    signIn: '登录…',
    setUp: '设置…',
    authorizing: '正在授权…',
    couldNotAddServer: '无法添加服务器',
    noTargetProfile: '没有目标配置档案',
    failedToSet: key => `无法设置 ${key}`,
    serverTestFailed: '设置后服务器测试失败',
    couldNotStartOAuth: '无法启动 OAuth',
    oauthCallbackFailed: 'OAuth 回调转发失败',
    completeSignIn: '请在浏览器中完成登录…',
    oauthFailed: 'OAuth 失败',
    configured: name => `${name} 已配置`,
    authenticated: name => `${name} 已通过身份验证`
  },
  cron: {
    untitledJob: '未命名任务',
    detailDescription: '查看此定时任务的内容及下次运行时间',
    statusLabel: '状态',
    scheduleLabel: '计划',
    repeatLabel: '重复',
    modelLabel: '模型',
    activeLabel: '已启用',
    pausedLabel: '已暂停',
    scheduleRawLabel: '原始计划',
    nextRunLabel: '下次运行',
    lastRunLabel: '上次运行',
    lastResultLabel: '上次结果',
    resultSucceeded: '成功',
    resultFailed: '失败',
    resultDeliveryFailed: '已运行，但结果发送失败',
    resultBlockedConfig: '配置阻止了运行（未执行）',
    deliversToLabel: '发送至',
    workingDirectoryLabel: '工作目录',
    legacyPaused: '出于安全考虑已暂停：请删除并重新创建此旧版定时任务后再运行',
    minutesFromNow: '分钟后',
    hoursFromNow: '小时后',
    daysFromNow: '天后',
    nameNulError: '任务名称不能包含 NUL（U+0000）',
    instructionNulError: '任务指令不能包含 NUL（U+0000）',
    filterHint:
      '此配置档案中有定时任务，但没有一个标记给这个智能体。将任务命名为“[bot:<名称>] …”即可显示在这里，也可以在下方的 Cron 中查看。',
    needsRosterFirst: '这个智能体需要先出现在名册中。',
    staleNotice: '无法刷新定时任务。显示的是上一次获取的列表。',
    readFailure: '列表可能仍然存在 — 这是一次读取失败，不是删除。',
    createDesc: bot => `由 ${bot} 按计划运行的重复任务。运行结果会保存在它自己的聊天记录中。`,
    instruction: '指令',
    whenToRun: '运行时间',
    dayOfMonth: '每月日期',
    sendResultsTo: '结果发送到',
    runHistoryOnly: '仅运行历史',
    botChatTarget: bot => `${bot} 的聊天（智能体会回应）`,
    continuity: '连续性：每次运行都能看到上次的输出（去重，从上次的地方继续）',
    stopAfter: '停止条件',
    runsForeverHint: '次运行（留空 = 永久）',
    onceIn: when => `一次（${when}）`,
    everyNDays: days => `每 ${days} 天`,
    everyNHours: hours => `每 ${hours} 小时`,
    everyNMinutes: minutes => `每 ${minutes} 分钟`,
    freqOnce: '一次，在…之后',
    freqHourly: '每小时',
    freqDaily: '每天',
    freqWeekdays: '工作日',
    freqWeekly: '每周',
    freqMonthly: '每月',
    freqInterval: '间隔',
    freqAdvanced: '高级…',
    unitMinutes: '分钟',
    unitHours: '小时',
    unitDays: '天',
    runsOnce: (count, unit) => `从现在起 ${count} ${unit}后运行一次`,
    runsHourly: '每小时整点运行',
    runsDaily: time => `每天 ${time} 运行`,
    runsWeekdays: time => `周一至周五 ${time} 运行`,
    runsWeekly: (day, time) => `每${day} ${time} 运行`,
    runsMonthly: (day, time) => `每月 ${day} 日 ${time} 运行`,
    runsInterval: (count, unit) => `每 ${count} ${unit}运行`,
    runsRaw: '原始计划 — every Nm/Nh/Nd 或 5 段 cron',
    timesTotal: count => `，共 ${count} 次`
  }
}

const zhHant: BotsMessages = {
  roster: {
    title: '智慧體',
    search: '搜尋智慧體和群組聊天',
    searchPlaceholder: '搜尋智慧體和群組聊天…',
    newBotOrGroup: '新增智慧體或群組聊天',
    newMenu: '新增…',
    activityToastsOn: '活動通知已開啟 — 點選靜音',
    activityToastsOff: '活動通知已關閉 — 點選啟用',
    newMessageFor: name => `🤖 ${name} 收到新訊息`,
    newActivityFor: name => `${name} 有新活動`,
    openChatToSee: '開啟聊天即可查看。',
    gatewayFallback: '閘道',
    couldNotReach: target => `無法連線到${target}`,
    couldNotOpenChat: name => `無法開啟「${name}」的聊天 — 請重試`,
    allGateways: '所有閘道',
    currentGateway: '目前閘道',
    filter: '篩選名單',
    filterActive: count => `篩選名單，已啟用 ${count} 項`,
    filtersActive: count => `篩選（已啟用 ${count} 項）`,
    hiddenLabel: '已隱藏',
    refreshFailed: '智慧體名單重新整理失敗，正在顯示上次成功載入的清單。',
    reconnecting: ' 正在等待閘道重新連線…',
    gatewayError: '閘道錯誤',
    thisDevice: '此裝置',
    attentionAuth: '請重新登入此設定檔',
    attentionQuota: '配額或餘額已用盡',
    attentionMissingConfig: '尚未設定供應商 — 請執行 hermes model',
    attentionBlocked: '智慧體已阻塞 — 請查看它的最後一則訊息',
    groupChats: '群組聊天',
    emptyTitle: '還沒有智慧體',
    emptyDesc: '建立你的第一個智慧體。',
    noMatchQuery: query => `沒有智慧體或群組聊天符合「${query}」`,
    noMatchQueryOn: (query, gateway) => `${gateway} 上沒有智慧體或群組聊天符合「${query}」`,
    noMatchFiltersOn: gateway => `${gateway} 上沒有智慧體或群組聊天符合這些篩選條件`,
    noMatchFilters: '沒有智慧體或群組聊天符合這些篩選條件。',
    clearFilters: '清除篩選',
    allHidden: '所有智慧體都已隱藏',
    allHiddenDesc: '它們會繼續運作，並保留各自的歷史。',
    showHidden: '顯示已隱藏的智慧體',
    noHiddenMatch: '沒有已隱藏的智慧體符合這些篩選條件。',
    hiddenFromRoster: '已從名單中隱藏',
    pinned: '已釘選',
    needsAttention: '需要處理',
    needsInput: '需要您的輸入',
    botsAndGroups: '智慧體和群組聊天',
    botsOnly: '僅智慧體',
    groupsOnly: '僅群組聊天',
    anyActivity: '任何活動',
    activeNow: '目前活躍',
    recentlyActive: '最近活躍',
    older: '更早',
    gatewayRemoved: '閘道已移除',
    onDemand: '隨需',
    ready: '就緒',
    statusUnknown: '狀態未知',
    unavailable: '不可用',
    retryNow: '立即重試',
    rosterUnavailable: reason => `無法取得名單：${reason}。如果閘道早於 profiles.list，請更新 Hermes 並重新啟動閘道。`,
    waitingForGateway: '正在等待閘道連線…（遠端閘道可能需要幾秒；會自動重試）'
  },
  sections: {
    newSection: '新增分區',
    newTitle: '新增分區',
    renameTitle: '重新命名分區',
    nameLabel: '分區名稱',
    namePlaceholder: '例如：客戶',
    create: '建立',
    rename: '重新命名…',
    moveUp: '上移',
    moveDown: '下移',
    unassigned: '未分類',
    options: name => `${name} 分區選項`,
    headingTip: '將機器人拖放到此處 · 雙擊重新命名',
    emptyHint: '將機器人拖到此處',
    moveTo: '移動到分區',
    newSectionEllipsis: '新增分區…',
    removeFromSection: '移出分區',
    deleted: (name, count) => (count === 0 ? `已刪除「${name}」` : `已刪除「${name}」— ${count} 個機器人已移至未分類`),
    undo: '復原'
  },
  bot: {
    newTitle: '新增智慧體',
    newDescription: '一個擁有自己記憶、技能和聊天的具名隊友。它可以向你的其他智慧體傳送訊息。',
    nameLabel: '名稱',
    titleLabel: '標題',
    titlePlaceholder: '收件匣整理',
    descriptionLabel: '描述',
    creating: '建立中…',
    createAction: '建立智慧體',
    created: name => `已建立智慧體「${name}」`,
    createdOn: (name, target) => `已在 ${target} 上建立智慧體「${name}」`,
    draftDiscarded: name => `已捨棄智慧體草稿「${name}」`,
    couldNotCleanDraft: name => `無法清理草稿設定檔「${name}」`,
    createOn: '建立位置',
    currentConnection: name => `${name}（目前）`,
    remoteLocation: target => `智慧體將在 ${target} 上建立，並作為連線中的智慧體顯示在名單中；聊天會路由到該裝置。`,
    tabGeneral: '一般',
    tabCapabilities: '功能',
    tabSkills: '技能',
    tabTools: '工具',
    tabMcp: 'MCP',
    inheritedFromLaunchProfile: '繼承自啟動設定檔',
    soulOptional: 'SOUL.md（可選，將取代自動產生的角色設定）',
    shareKeys: '與主設定檔共享金鑰和帳號',
    shareKeysDesc:
      '訂閱、OAuth 登入和 API 金鑰會保持共享而非複製，因此權杖更新不會使其他設定檔失效。取消勾選可建立隔離的快照副本。',
    createEmpty: '建立空白設定檔（略過內建技能）',
    nameTakenForCapabilities: '該名稱已被使用，請先選擇其他名稱再設定功能。',
    nameFirstForCapabilities: '請先為智慧體命名；開啟此分頁時會建立草稿設定檔（取消時將刪除）。',
    skillsNeedNewDesktop: '技能需要較新版本的 Hermes Desktop。',
    capabilityCatalogNeedsGateway: '功能目錄需要較新版本的閘道（更新 Hermes 後請重新啟動閘道）。',
    createEmptySkillsNotice: '已勾選「建立空白設定檔」— 不會安裝內建技能。',
    catalogFrom: source => `目錄來源：${source} — 未勾選的技能會在建立後停用。`,
    defaultToolsetBehavior: '全部勾選或全部不勾選時，將保留預設工具集行為。',
    catalog: '目錄',
    catalogInstalled: '目錄 · 已安裝',
    configuredServersDesc:
      '已設定的伺服器會從主設定檔複製；目錄項目來自內建 MCP 選單。需要 API 金鑰的項目會先進入設定流程（憑證遵循共享金鑰設定）。',
    pin: '釘選到頂端',
    unpin: '取消釘選',
    pinChanged: (name, pinned) => `${name}${pinned ? ' 已釘選到頂端' : ' 已取消釘選'}`,
    hide: '隱藏',
    unhide: '取消隱藏',
    hiddenChanged: (name, hidden) =>
      hidden ? `${name} 已隱藏 — 可使用智慧體標題列中的眼睛按鈕查看隱藏的智慧體` : `${name} 已重新顯示在名單中`,
    metadataLoadFailed: '無法載入智慧體中繼資料',
    loadFailed: '無法載入智慧體',
    groupsLoadFailed: '無法載入智慧體群組',
    groups: names => `群組：${names}…`,
    manageGroups: '管理群組…',
    duplicating: name => `正在複製 ${name}…`,
    duplicated: (name, source) => `已建立 ${name} — ${source} 的完整副本`,
    deleteDescription: (name, path) =>
      path
        ? `這將永久刪除智慧體 ${name} 及其位於 ${path} 的關聯 Hermes 設定檔，此操作無法復原。`
        : `這將永久刪除智慧體 ${name} 及其關聯 Hermes 設定檔，此操作無法復原。`,
    deleting: '刪除中…',
    deleted: '已刪除',
    deletedProfile: name => `已刪除設定檔 ${name}`,
    cloneFromProfile: '從設定檔複製',
    cloneFromProfileOn: target => `從設定檔複製（位於 ${target}）`,
    defaultProfileName: '預設',
    freshProfile: '全新設定檔（內建技能）',
    editTitle: '編輯設定檔',
    editDescription: (name, profile) => `${name} 的外觀與角色（設定檔：${profile}）`,
    editMenu: '編輯…',
    updated: name => `${name} 已更新`,
    advancedSectionsFailed: sections => `部分設定更新失敗：${sections}`,
    helpPromptPlaceholder: '這個智慧體應該幫你做什麼？',
    descriptionHint: '留空則依智慧體的名稱和描述產生。',
    newChatWith: '與此智慧體開新聊天',
    openBotChat: '開啟智慧體聊天',
    duplicate: '複製',
    duplicateFailed: '複製失敗',
    noFreeDuplicateName: '沒有可用於副本的名稱。',
    defaultProfileCannotDelete: '無法刪除預設設定檔。',
    sourceScopedDeleteUnsupported: '目前版本的 Hermes Desktop 無法刪除該連線上的設定檔。',
    couldNotDeleteProfile: name => `無法刪除設定檔 ${name}。`,
    deleteTitle: '刪除智慧體和設定檔？',
    removeFromAllGroups: '從所有群組中移除',
    createFirstHint: '開啟智慧體面板，點「新增智慧體」。',
    createFailed: '暫時無法建立設定檔',
    advanced: '進階',
    advancedHint: '進階 — 模型、技能、工具集、SOUL.md',
    advancedFailed: '進階設定失敗',
    openAnotherChatUnsupported: '請更新 Hermes Desktop 以開啟另一個智慧體聊天。',
    remoteConnectionsUnsupported: '請更新 Hermes Desktop 以與其他連線上的智慧體聊天。',
    storedSessionsUnsupported: '目前版本的 Hermes Desktop 無法開啟已儲存的工作階段。',
    updateGatewayTitle: '請更新此閘道以使用智慧體模式',
    updateGatewayMessage: gateway => `請更新${gateway}，然後重試。`,
    workspaceSelectionRequired: '請先選擇一個智慧體或群組聊天。',
    chatEmpty: '說點什麼開始吧。',
    chatNeverResetsTitle: '此聊天永不重設',
    chatNeverResetsMessage:
      '智慧體聊天是一段連續對話，因此會改為壓縮。如需與此智慧體進行臨時工作階段，請使用工作階段模式。',
    kickoff: '你好，介紹一下你自己吧！'
  },
  avatar: {
    auto: '自動',
    autoTitle: '自動 — 由智慧體名稱決定',
    lockTitle: '即使名稱改變，也保留目前頭像',
    unlock: '解鎖',
    lockFace: '鎖定頭像',
    lockedHint: '頭像已鎖定 — 重新命名不會改變它。',
    followsNameHint: '頭像會隨名稱變化。',
    noImageModel: '沒有可用的圖片模型。如果你剛啟用模型（或更新 Hermes），請重新啟動閘道：Ctrl+K →「重新啟動閘道」。',
    checkingImageBackend: '正在檢查圖片後端…',
    chooseImage: '選擇圖片…',
    noPets: '寵物圖鑑中沒有寵物。執行 `hermes pets` 來探索。',
    noPetsMatch: '沒有符合的寵物。',
    searchPets: count => `搜尋 ${count} 隻寵物…`,
    classicShapes: '經典形狀',
    blobFromName: '斑點臉 — 依智慧體名稱繪製',
    unlockFollowsName: '解鎖 — 面孔再次跟隨智慧體名稱',
    randomize: '隨機',
    tabBot: '智慧體',
    tabGenerate: '生成',
    upload: '上傳',
    tabPet: '寵物',
    removeImage: '移除圖片，改用形狀',
    removeBackToShape: '移除 — 回到形狀頭像',
    describePlaceholder: '描述你的頭像…',
    describeHint: '留空則依名稱／標題／描述與 agent-messaging 名冊自動產生。',
    matchTheName: '符合名稱',
    pickPet: '選擇一隻寵物作為此智慧體的頭像。',
    petLoadFailed: '無法載入該寵物 — 請換一隻試試。',
    imageTooLarge: '圖片過大（最大 15MB）。',
    generationFailed: '頭像產生失敗',
    savedLocally: '外觀已儲存在本機；遠端持久化失敗',
    savedLocallyDescriptionFailed: '外觀已儲存在本機；描述更新失敗',
    generate: '生成',
    generating: '生成中…'
  },
  group: {
    newTitle: '新增群組聊天',
    newGroupPlaceholder: '群組名稱（例如：研究）',
    createAndJoin: '建立並加入',
    noBotsYet: '還沒有智慧體，請先建立一個。',
    pickAtLeastTwo: '請至少選擇 2 個智慧體',
    createWithCount: count => `建立群組聊天${count ? `（${count}）` : ''}`,
    groupCreated: (name, count) => `已建立「${name}」，包含 ${count} 個智慧體`,
    addedToGroup: (bot, group) => `${bot} 已加入「${group}」`,
    removedFromGroup: (bot, group) => `${bot} 已從「${group}」中移除`,
    openGroupChat: '開啟群組聊天',
    noBotsInGroup: '此群組聊天中沒有智慧體',
    hideFullHandle: '隱藏完整帳號',
    showFullHandle: '顯示完整帳號',
    ownAnswerPlaceholder: '或輸入你自己的回答…',
    answerPlaceholder: '輸入你的回答…',
    sending: '傳送中…',
    you: '你',
    availableCount: (available, total) => `${total} 個中有 ${available} 個可用`,
    attachedFile: '附件',
    attachedImage: '附加圖片',
    attachmentFallback: '附件',
    pastedImage: '貼上的圖片',
    attachmentTooLarge: name => `${name}過大（最大 15MB）。`,
    emptyResponse: '⚠️ 模型處理工具結果後沒有傳回回應。部分模型可能發生此情況 — 請重試或換一種方式提問。',
    newConversationHint: '請在群組聊天建立介面中開始新的群組聊天。',
    manageDesc: '一個智慧體可以加入多個群組聊天。成員關係會同步到每台裝置。',
    manageTitle: '管理群組',
    settingsTitle: '群組設定',
    settingsDesc: '重新命名群組或設定房間圖片。成員和歷史都會保留。',
    nameLabel: '群組名稱',
    searchToAdd: '搜尋要加入的智慧體',
    searchToAddPlaceholder: '搜尋要加入的智慧體…',
    removeFromSelection: '從選取中移除',
    disbandTitle: '解散群組聊天？',
    deleteTitle: '刪除群組聊天？',
    deleteAction: '刪除',
    composerPlaceholder: '說點什麼 — 這個群組裡的每個智慧體都會聽到。',
    attachHint: '附加檔案 — 每個回應的智慧體都能看到',
    newThread: '新討論串',
    reply: '回覆',
    replyInThread: '在討論串中回覆',
    replyInThreadPlaceholder: '在討論串中回覆…',
    openThread: '開啟此討論串',
    collapseThread: '收合討論串',
    collapseThreadLabel: '收合此討論串',
    activity: '活動',
    noActivityYet: '本回合還沒有活動。',
    showActivity: '顯示房間活動',
    hideActivity: '隱藏房間活動',
    activityActorBot: '某個智慧體',
    activityDidSomething: '執行了操作',
    activityBy: (member, action) => `${member}${action}`,
    activityLabels: {
      queued: '傳送了一則訊息',
      working: '正在處理…',
      replied: '已回覆',
      passed: '已略過',
      timedOut: '處理逾時',
      failed: '遇到錯誤',
      cancelled: '新訊息中斷了目前回合',
      settled: '本回合已結束',
      capped: '已達回合或訊息上限，本回合已停止',
      delivered: '已送達延遲回覆',
      held: '已暫停（由你停止）— @提及它或傳送「resume」即可恢復',
      stopped: '已停止房間 — 恢復前，其餘回合將保持暫停'
    },
    stop: '停止',
    stopHint: '停止本次執行 — 中斷目前回合的成員，並暫停其餘成員',
    allHeldStatus: count => `全部 ${count} 個智慧體已暫停`,
    heldMembersStatus: members => `已暫停：${members}`,
    holdReleaseHint: '提及已暫停的智慧體，或傳送 @all resume 以恢復它們。',
    needsYourInput: '此群組聊天中有智慧體需要您的輸入',
    pictureGenerationFailed: '群組圖片產生失敗',
    nameTaken: name => `已存在名為「${name}」的群組聊天。`,
    noFreeName: '沒有可用於群組的名稱。',
    memberCount: count => `${count} 個智慧體`,
    settingsHint: group => `群組設定 — 重新命名 ${group} 或設定房間圖片`,
    settingsLabel: group => `${group} 的群組設定`,
    disbandHint: group => `解散 ${group} 群組聊天`,
    disbandLabel: group => `解散 ${group}`,
    disbandAction: '解散',
    disbanding: '正在解散…',
    disbandDone: '已解散',
    disbanded: group => `已解散「${group}」`,
    disbandDescPrefix: '',
    disbandDescSuffix: count =>
      ` 的分組將從 ${count} 個智慧體中移除，並清空共享房間日誌。智慧體本身及其各群組工作階段都會保留。`,
    stopped: group => `已停止 ${group} — 其餘回合將保留到你恢復為止`,
    removeAttachment: '移除附件',
    threadFallback: '討論串',
    replyCount: replies => `${replies} 則回覆`,
    dropToThread: '拖放以附加到此討論串回覆',
    dropToRoom: '拖放以附加 — 每個回應的智慧體都能看到',
    waitingForAnswer: '等待你的回答…',
    memberThinking: name => `${name} 正在思考…`,
    roomWorking: '房間正在處理…',
    messageRoom: group => `傳訊息給 ${group}`,
    newThreadPlaceholder: group => `在 ${group} 中開啟新討論串…（@名稱指定，@everyone 全體）`,
    everyoneMeta: '房間裡的所有智慧體',
    commandApproval: '命令核准',
    answerFailed: (handle, error) => `無法將回答傳送給 @${handle}：${error}`,
    wantsToRunCommand: handle => `@${handle} 想執行一個命令：`,
    asks: handle => `@${handle} 的提問：`,
    answerTo: member => `回覆 @${member}`
  },
  tools: {
    skillsHub: 'Hermes 技能中心',
    skillsHubShort: '技能中心',
    filterSkills: '篩選技能…',
    searchHub: '搜尋技能中心（社群和常見來源）…',
    noMcpServers: '未設定 MCP 伺服器，目錄中也沒有。',
    provider: '供應商',
    model: '模型',
    providerCustom: '供應商（自訂）',
    modelCustom: '模型（自訂）',
    backToDropdowns: '← 返回下拉選單',
    inheritLaunchProfile: '繼承（啟動設定檔）',
    enterManually: '✏️ 手動輸入…',
    gatewayDefault: '閘道預設值',
    modelNameExample: '例如：模型名稱',
    modelSwitchFailed: '模型切換失敗',
    confirm: '確認',
    fullConfigNeedsGateway: '完整設定需要較新版本的閘道（更新 Hermes 後請重新啟動閘道）。',
    remoteCapabilitiesNeedDesktop: '遠端功能需要較新版本的桌面應用程式。模型和 SOUL 變更會暫存到儲存時再套用。',
    capabilitiesImmediate: '功能（立即套用：技能、工具、MCP）',
    soulConfig: 'SOUL.md（角色設定 + 智慧體訊息協定）',
    skillsEnabled: (enabled, total) => `技能（已啟用 ${enabled}/${total}）`,
    toolsetsEnabled: (enabled, total) => `工具集（已啟用 ${enabled}/${total} — 全部取消勾選可恢復預設值）`,
    mcpServers: 'MCP 伺服器',
    catalog: '目錄',
    catalogInstalled: '目錄 · 已安裝',
    searching: '搜尋中…',
    searchAction: '搜尋',
    searchingHub: '正在搜尋社群和常見來源 — 可能需要約 10 秒…',
    noHubSkills: '沒有符合的技能中心技能。',
    added: '✓ 已加入',
    hideHubBrowser: '隱藏技能中心瀏覽器',
    browseFullHub: '瀏覽完整技能中心 ▾',
    installing: name => `正在安裝「${name}」…`,
    installHint: '點選任一技能上的「+ 加入此智慧體」，安裝後它會顯示在上方清單中。拖曳角落可調整大小。',
    skillInstalled: name => `技能「${name}」已安裝`,
    skillInstallFailed: name => `安裝「${name}」失敗`,
    setupDone: '已設定 ✓',
    saveAndTest: '儲存並測試',
    working: '處理中…',
    retry: '重試',
    setupFailed: '設定失敗',
    needsSetup: requires => `需要設定（${requires}）— 重新啟動閘道以啟用應用程式內設定`,
    signIn: '登入…',
    setUp: '設定…',
    authorizing: '正在授權…',
    couldNotAddServer: '無法加入伺服器',
    noTargetProfile: '沒有目標設定檔',
    failedToSet: key => `無法設定 ${key}`,
    serverTestFailed: '設定後伺服器測試失敗',
    couldNotStartOAuth: '無法啟動 OAuth',
    oauthCallbackFailed: 'OAuth 回呼轉送失敗',
    completeSignIn: '請在瀏覽器中完成登入…',
    oauthFailed: 'OAuth 失敗',
    configured: name => `${name} 已設定`,
    authenticated: name => `${name} 已通過身分驗證`
  },
  cron: {
    untitledJob: '未命名工作',
    detailDescription: '查看此排程工作的內容及下次執行時間。',
    statusLabel: '狀態',
    scheduleLabel: '排程',
    repeatLabel: '重複',
    modelLabel: '模型',
    activeLabel: '已啟用',
    pausedLabel: '已暫停',
    scheduleRawLabel: '原始排程',
    nextRunLabel: '下次執行',
    lastRunLabel: '上次執行',
    lastResultLabel: '上次結果',
    resultSucceeded: '成功',
    resultFailed: '失敗',
    resultDeliveryFailed: '已執行，但結果傳送失敗',
    resultBlockedConfig: '設定阻止了執行（未執行）',
    deliversToLabel: '傳送至',
    workingDirectoryLabel: '工作目錄',
    legacyPaused: '基於安全考量已暫停：請刪除並重新建立此舊版工作後再執行。',
    minutesFromNow: '分鐘後',
    hoursFromNow: '小時後',
    daysFromNow: '天後',
    nameNulError: '工作名稱不能包含 NUL（U+0000）。',
    instructionNulError: '工作指示不能包含 NUL（U+0000）。',
    filterHint:
      '此設定檔中有排程工作，但沒有任何一個標記給這個智慧體。將工作命名為「[bot:<名稱>] …」即可顯示在這裡，也可以在下方的 Cron 中查看。',
    needsRosterFirst: '這個智慧體需要先出現在名冊中。',
    staleNotice: '無法重新整理排程工作。顯示的是上一次取得的清單。',
    readFailure: '清單可能仍然存在 — 這是一次讀取失敗，不是刪除。',
    createDesc: bot => `由 ${bot} 按排程執行的重複工作。執行結果會保存在它自己的聊天紀錄中。`,
    instruction: '指示',
    whenToRun: '執行時間',
    dayOfMonth: '每月日期',
    sendResultsTo: '結果傳送到',
    runHistoryOnly: '僅執行紀錄',
    botChatTarget: bot => `${bot} 的聊天（智慧體會回應）`,
    continuity: '連續性：每次執行都能看到上次的輸出（去重，從上次的地方繼續）',
    stopAfter: '停止條件',
    runsForeverHint: '次執行（留空 = 永久）',
    onceIn: when => `一次（${when}）`,
    everyNDays: days => `每 ${days} 天`,
    everyNHours: hours => `每 ${hours} 小時`,
    everyNMinutes: minutes => `每 ${minutes} 分鐘`,
    freqOnce: '一次，在…之後',
    freqHourly: '每小時',
    freqDaily: '每天',
    freqWeekdays: '工作日',
    freqWeekly: '每週',
    freqMonthly: '每月',
    freqInterval: '間隔',
    freqAdvanced: '進階…',
    unitMinutes: '分鐘',
    unitHours: '小時',
    unitDays: '天',
    runsOnce: (count, unit) => `從現在起 ${count} ${unit}後執行一次`,
    runsHourly: '每小時整點執行',
    runsDaily: time => `每天 ${time} 執行`,
    runsWeekdays: time => `週一至週五 ${time} 執行`,
    runsWeekly: (day, time) => `每${day} ${time} 執行`,
    runsMonthly: (day, time) => `每月 ${day} 日 ${time} 執行`,
    runsInterval: (count, unit) => `每 ${count} ${unit}執行`,
    runsRaw: '原始排程 — every Nm/Nh/Nd 或 5 段 cron',
    timesTotal: count => `，共 ${count} 次`
  }
}

/** Registered via `ctx.i18n.register` at plugin load (disposer tracked). */
export const BOTS_LOCALES: PluginLocaleBundles = { en, ja, zh, 'zh-hant': zhHant }

// Bind the message SHAPE to a plugin translator: string leaves resolve now,
// function leaves forward their args through t(path, …).
type Bound<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => string
    ? (...args: A) => string
    : T[K] extends object
      ? Bound<T[K]>
      : string
}

function bind<T extends object>(t: PluginTranslate, template: T, prefix = ''): Bound<T> {
  const out = {} as Record<string, unknown>

  for (const [key, value] of Object.entries(template)) {
    const path = prefix ? `${prefix}.${key}` : key
    out[key] =
      typeof value === 'function'
        ? (...args: unknown[]) => t(path, ...args)
        : value && typeof value === 'object'
          ? bind(t, value as object, path)
          : t(path)
  }

  return out as Bound<T>
}

export type BotsText = Bound<BotsMessages>

/** The Bot Mode strings for the active locale — one hook every component reads. */
export function useBots(): BotsText {
  const t = usePluginI18n('hermes-bots')

  return useMemo(() => bind(t, en), [t])
}

/** Resolve a dotted path against the English bundle — the floor for a read
 *  that beats `ctx.i18n` into existence, so an unresolved key never ships as
 *  the literal `cron.runsHourly`. */
function english(key: string, ...args: unknown[]): string {
  const leaf = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], en)

  return typeof leaf === 'function' ? (leaf as (...a: unknown[]) => string)(...args) : String(leaf ?? key)
}

let bound: { text: BotsText; translate: PluginTranslate } | null = null

/** `useBots` for the module-level functions a hook can't reach — the schedule
 *  summarizers and label helpers that render inside components but aren't
 *  components. Non-reactive on its own; every caller is invoked during a
 *  render that a core `useI18n()` already subscribes to, so a locale switch
 *  still repaints. Cached on translator identity: `bind` walks the whole tree,
 *  and these run per row. */
export function botsText(): BotsText {
  const translate = getPluginCtx()?.i18n?.t ?? english

  if (bound?.translate !== translate) {
    bound = { text: bind(translate, en), translate }
  }

  return bound.text
}
