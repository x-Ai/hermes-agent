/**
 * Message SHAPE for Bot Mode's plugin-scoped i18n bundles (see `./i18n.ts`).
 */

import { type CanonicalGroupMessages } from './canonical-group-locales'
import { type GroupCreateCopy } from './i18n_group_create'

export type BotsMessages = {
  canonical: { [K in keyof CanonicalGroupMessages]: string }
  /** Left rail: the bot + group-chat roster. */
  editor: {
    fullConfigHint: string
    liveCapabilities: string
    editSoul: string
    remoteCapabilitiesHint: string
    skillsEnabled: (enabled: number, total: number) => string
    toolsetsEnabled: (enabled: number, total: number) => string
    mcpServers: string
    providerCustom: string
    modelCustom: string
    backToDropdowns: string
    inheritLaunch: string
    enterManually: string
    gatewayDefault: string
    modelNameExample: string
    modelSwitchFailed: string
    newDescription: string
    name: string
    title: string
    description: string
    createOn: string
    general: string
    capabilities: string
    skills: string
    tools: string
    cloneFrom: string
    freshProfile: string
    inheritedModel: string
    soul: string
    shareKeys: string
    shareKeysOn: (target: string, defaultProfileName: string) => string
    shareKeysHint: string
    needsModel: string
    configureModel: string
    createEmpty: string
    nameTakenHint: string
    nameFirstHint: string
    newerDesktop: string
    newerGateway: string
    emptySkillsHint: string
    defaultToolsHint: string
    catalog: string
    catalogInstalled: string
    mcpHint: string
    creating: string
    createBot: string
    auto: string
    autoHint: string
    unlock: string
    lockFace: string
    lockedHint: string
    unlockedHint: string
    noImageModel: string
    checkingImage: string
    chooseImage: string
    editDescription: (name: string, profile: string) => string
    nameTaken: (name: string) => string
    nameTakenOn: (name: string, target: string) => string
    currentConnection: (name: string) => string
    remoteHint: (target: string) => string
    cloneFromOn: (target: string) => string
    catalogHint: (source: string) => string
    sectionsFailed: (sections: string) => string
    updated: (name: string) => string
    created: (name: string) => string
    createdOn: (name: string, target: string) => string
  }
  roster: {
    search: string
    searchPlaceholder: string
    newBotOrGroup: string
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
    refreshFailed: string
    reconnecting: string
    hidden: string
    allGateways: string
    currentGateway: string
    title: string
    activityToastsOn: string
    activityToastsOff: string
    newMenu: string
    activeFilters: (count: number) => string
    filterRoster: string
    filterRosterActive: (count: number) => string
    newMessageFor: (name: string) => string
    newActivity: (name: string) => string
    openChatToSee: string
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
    editTitle: string
    defaultProfileName: string
    editDescription: (name: string, profile: string) => string
    editMenu: string
    helpPromptPlaceholder: string
    descriptionHint: string
    newChatWith: string
    /** Re-opens the forever-chat on purpose. A plain row click only returns to
     *  the tabs already open, so a closed Bot Chat needs an explicit ask. */
    openBotChat: string
    openBotChatInNewTab: string
    /** Screen-reader label for the row spinner while a cold bot chat opens. */
    openingChat: string
    /** Row context menu: pin/hide toggles, their toasts, and the groups entry. */
    pinToTop: string
    unpin: string
    pinnedToast: (name: string) => string
    unpinnedToast: (name: string) => string
    hide: string
    unhide: string
    hiddenToast: (name: string) => string
    unhiddenToast: (name: string) => string
    groupsMenu: (groups: string) => string
    manageGroups: string
    metadataLoadFailed: string
    loadFailed: string
    groupsLoadFailed: string
    thisDevice: string
    /** Roster badge tooltips per attention class; `attentionFallback` when the class is unknown. */
    attentionFallback: string
    attentionProviderAuth: string
    attentionQuota: string
    attentionMissingConfig: string
    attentionBlocked: string
    duplicate: string
    duplicateFailed: string
    noFreeDuplicateName: string
    defaultProfileCannotDelete: string
    sourceScopedDeleteUnsupported: string
    couldNotDeleteProfile: (name: string) => string
    duplicating: (name: string) => string
    duplicated: (name: string, source: string) => string
    draftDiscarded: (name: string) => string
    draftCleanupFailed: (name: string) => string
    updated: (name: string) => string
    someSectionsFailed: (sections: string) => string
    recentSessionOpenFailed: string
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
    workspaceSelectionRequired: string
    /** Bot-open failure toasts (canonical-chat.ts notifyBotOpenFailure). The
     *  raw RPC/connection error travels in the toast `detail`, never here. */
    openNeedsUpdateTitle: string
    openNeedsUpdateMessage: (connectionLabel: string) => string
    openUnreachableTitle: string
    openUnreachableMessage: string
    openChatFailedTitle: (botName: string) => string
    openChatFailedMessage: string
    openGateways: string
    neverResetsTitle: string
    neverResetsBody: string
    /** Stands under the bot's name in a chat it has not spoken in yet. */
    chatEmpty: string
    /** First line of a brand-new bot's forever-chat — see `kickoffText`. */
    kickoff: string
    description: string
    nameLabel: string
    titleLabel: string
    titlePlaceholder: string
    descriptionLabel: string
    createOn: string
    generalTab: string
    capabilitiesTab: string
    capabilitiesImmediateLabel: string
    skillsTab: string
    toolsetsTab: string
    cloneFromProfile: string
    cloneFromRemoteProfile: (target: string) => string
    freshProfile: string
    soulLabel: string
    soulProtocolLabel: string
    shareAuth: string
    shareAuthDescription: string
    createEmpty: string
    nameTakenBeforeCapabilities: string
    nameFirstBeforeCapabilities: string
    skillsNeedNewerDesktop: string
    capabilitiesNeedNewerGateway: string
    createEmptyNotice: string
    defaultToolsetsHint: string
    mcpCopyHint: string
    creating: string
    createBot: string
    openRecentSession: string
    fullConfigNeedsNewerGateway: string
    remoteCapabilitiesNeedNewerDesktop: string
    deleting: string
    deleted: string
    deleteDescriptionPrefix: string
    deleteDescriptionMiddle: string
    deleteDescriptionSuffix: string
    profileDeleted: (name: string) => string
  }
  /** Avatar picker: shapes, blobs, pets, uploads, generation. */
  avatar: {
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
    auto: string
    autoNameDecision: string
    unlock: string
    lockFace: string
    faceLocked: string
    faceFollowsName: string
    noImageModel: string
    checkingImageBackend: string
    chooseImage: string
    noPets: string
    petSearch: (count: number) => string
    noPetMatches: string
  }
  /** Group chats: the room, its composer, threads and activity feed. */
  group: GroupCreateCopy & {
    newTitle: string
    manageDesc: string
    manageTitle: string
    settingsTitle: string
    settingsDesc: string
    nameLabel: string
    holdDetection: string
    holdDetectionHint: string
    compressHistory: string
    compressHistoryHint: (member: string) => string
    compressing: (member: string) => string
    compressDone: (member: string, compressed: number, detail: string) => string
    compressNothing: (member: string) => string
    compressFailed: (member: string, error: string) => string
    searchToAdd: string
    searchToAddPlaceholder: string
    removeFromSelection: string
    disbandTitle: string
    deleteTitle: string
    deleteAction: string
    composerPlaceholder: string
    slashCommandsUnsupported: string
    attachmentFallback: string
    pastedImage: string
    attachmentTooLarge: (name: string) => string
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
    activitySlotWait: (member: string) => string
    activityLabels: Record<
      | 'queued'
      | 'working'
      | 'replied'
      | 'passed'
      | 'timedOut'
      | 'failed'
      | 'cancelled'
      | 'settled'
      | 'capped'
      | 'delivered'
      | 'held'
      | 'stopped',
      string
    >
    stop: string
    stopHint: string
    allHeldStatus: (count: number) => string
    heldMembersStatus: (members: string) => string
    holdReleaseHint: string
    needsYourInput: string
    noMembersToSend: (group: string) => string
    pictureGenerationFailed: string
    nameTaken: (name: string) => string
    memberCount: (count: number) => string
    /** The reader's own lines in a room: the transcript speaker and the roster preview. */
    you: string
    /** How many of a room's members are reachable right now. */
    availableCount: (available: number, total: number) => string
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
    ownAnswerPlaceholder: string
    answerPlaceholder: string
    sending: string
    answerTo: (member: string) => string
    openGroupChat: string
    memberAdded: (member: string, group: string) => string
    memberRemoved: (member: string, group: string) => string
    createdWith: (group: string, count: number) => string
    manageMembers: string
    manageMembersAria: string
    manageMembersDescription: (max: number, group: string) => string
    manageMembersCount: (count: number) => string
    cancel: string
    saveMembers: string
    createAndJoin: string
    newGroupPlaceholder: string
    groupNamePlaceholder: string
    noBots: string
    noBotsMatch: (query: string) => string
    noBotsYet: string
    deleting: string
    deleted: string
    deleteDescription: (name: string) => string
    deletedGroup: (name: string) => string
    attachmentFailed: (file: string, member: string) => string
    emptyResponse: string
    noFreeName: string
  }
  /** Skills hub + MCP setup surfaces embedded in the bot editor. */
  tools: {
    installHint: (name: string) => string
    installed: (name: string) => string
    installFailed: (name: string) => string
    searchHint: string
    resizeHint: string
    addServerFailed: string
    noTarget: string
    setKeyFailed: (name: string) => string
    configured: (name: string) => string
    authenticated: (name: string) => string
    testFailed: string
    completeSignIn: string
    needsSetup: (name: string) => string
    setUpDone: string
    saveTest: string
    authorizing: string
    working: string
    setupFailed: string
    signIn: string
    setUp: string
    skillsHub: string
    skillsHubShort: string
    filterSkills: string
    searchHub: string
    noMcpServers: string
    setupDone: string
    saveAndTest: string
    retry: string
    searchingHub: string
    noHubMatches: string
    added: string
    noTargetProfile: string
    needsSetupRestart: (requirements: string) => string
    hideHubBrowser: string
    browseFullHub: string
    installingSkill: (name: string) => string
    hubBrowserHint: string
    searching: string
    search: string
    skillInstalled: (name: string) => string
    skillInstallFailed: (name: string) => string
  }

  /** Bot Screen: the bot's headless desktop on the gateway host, live in a pane. */
  screen: {
    title: string
    menu: string
    unsupportedTitle: string
    unsupportedBody: string
    notInstalledTitle: string
    notInstalledBody: string
    installHint: string
    install: string
    installing: string
    installCancelled: string
    installFailed: string
    noPackageManager: string
    portalTitle: string
    portalOpen: string
    heroStopped: string
    heroNotInstalled: string
    heroConnecting: string
    heroStale: string
    heroSuppressed: string
    heroOpenLive: string
    heroInstall: string
    heroStart: string
    portalWatching: string
    portalYouControl: string
    portalOtherControls: string
    portalStopped: string
    portalNotInstalled: string
    portalUnsupported: string
    portalUnavailable: string
    /** Managed runtimes (Hermes Cloud): updates are the platform's job, not the user's. */
    portalUnavailableManaged: string
    managedNotIncludedTitle: string
    managedNotIncludedBody: string
    unavailableTitle: string
    autoOpenMenu: string
    autoOpenOnToast: (name: string) => string
    autoOpenOffToast: (name: string) => string
    stoppedTitle: string
    stoppedBody: string
    placementSandbox: (backend: string) => string
    imageSwitchTitle: string
    imageSwitchBody: (current: string, target: string) => string
    imageSwitchApprove: string
    imageSwitchKeep: string
    start: string
    attaching: string
    streamLost: string
    reconnect: string
    takeOver: string
    handBack: string
    handBackForce: string
    handBackForceHint: string
    openNeedsUpdate: string
    youControl: string
    otherControls: string
    agentControls: string
    controlTaken: string
    needsHttps: string
  }

  /** Bot-scoped scheduled jobs. Generic scheduling chrome (weekday names,
   *  Daily/Hourly, the job verbs) resolves against core's `cron` section. */
  cron: {
    untitled: string
    nameNul: string
    instructionNul: string
    minutesFromNow: string
    hoursFromNow: string
    daysFromNow: string
    stopAfter: string
    runsHint: string
    detailDescription: string
    status: string
    active: string
    paused: string
    schedule: string
    rawSchedule: string
    repeat: string
    nextRun: string
    overdueSince: string
    lastRun: string
    lastResult: string
    workdir: string
    succeeded: string
    failed: string
    deliveryFailed: string
    blockedConfig: string
    legacyUnsafe: string
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
    legacyPaused: string
    schedulePlaceholder: string
    runsForever: string
    minutes: string
    hours: string
    days: string
  }
  modelPicker: {
    provider: string
    model: string
    customProvider: string
    customModel: string
    backToDropdowns: string
    inheritLaunchProfile: string
    enterManually: string
    gatewayDefault: string
    modelPlaceholder: string
  }
}
