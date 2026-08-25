/**
 * Plugin-scoped i18n for hermes-bots — Bot Mode localization.
 *
 * Bundles shipped under the plugin id via ctx.i18n.register,
 * never touching core en.ts.
 */

import { type PluginLocaleBundles, usePluginI18n } from '@hermes/plugin-sdk'

type BotsMessages = {
  // Common actions
  cancel: string
  save: string
  create: string
  delete: string
  back: string
  close: string
  retry: string
  send: string
  retryLabel: string
  signIn: string
  setUpAction: string
  authorizing: string

  // Bot roster
  bots: string
  noBots: string
  noBotsDesc: string
  searchBots: string
  noBotsMatch: (query: string) => string
  newAgent: string
  newGroupChat: string
  activityToastsOn: string
  activityToastsOff: string
  botChatsHidden: string
  botChatsShown: string
  hideHiddenBotsAgain: string
  showHiddenBotsCount: (count: number) => string
  hideHiddenBots: string
  showHiddenBots: string
  hiddenBotUnread: string
  allBotsHidden: string
  retryNow: string
  newMenu: string
  newAgentOrGroup: string
  rosterRefreshFailed: string
  waitingForGateway: string
  rosterUnavailable: (message: string) => string
  gatewayError: string
  newMessageFor: (name: string) => string
  newActivityFor: (name: string) => string
  openChatToSee: string
  thisDevice: string
  hermesGateway: string

  // Bot actions
  editProfile: string
  duplicate: string
  newChatWithAgent: string
  pin: string
  unpin: string
  pinnedTitle: string
  sessions: string
  moveToGroup: string
  group: (name: string) => string
  manageGroups: string
  groups: (names: string) => string
  unread: string
  activeRecently: string
  openAgentChat: (name: string) => string
  noConversations: string
  updateForRemoteAgents: string
  remoteSourceLabel: string
  livesOn: (source: string) => string
  lastMessageFrom: (name: string) => string
  hiddenFromRoster: string
  hideBot: string
  unhideBot: string
  botHidden: (name: string) => string
  botUnhidden: (name: string) => string

  // Bot chat
  botChat: string
  activeNow: string
  needsYou: string
  openChat: string
  openContinuousChatDescription: string
  chatNeverResets: string
  chatNeverResetsDesc: string

  // Profile editing
  editProfileTitle: string
  name: string
  title: string
  description: string
  whatHelp: string
  advanced: string
  advancedConfig: string
  saving: string
  appearanceAndRole: (displayName: string, profile: string) => string

  // Avatar
  bot: string
  generate: string
  upload: string
  pet: string
  removeImage: string
  describeAvatar: string
  avatarAuto: string
  avatarAutoTitle: string
  avatarRandomize: string
  avatarUnlockTitle: string
  avatarLockTitle: string
  avatarUnlock: string
  avatarLockFace: string
  avatarLockedHint: string
  avatarFollowsNameHint: string
  avatarClassicShapes: string
  avatarBlobTitle: string
  generating: string
  leaveBlankGenerate: string
  choosePet: string
  removePet: string
  noPetsMatch: string
  noPets: string
  chooseImage: string
  searchPets: (count: number) => string
  inheritLaunchProfile: string
  enterManually: string
  backToDropdowns: string
  gatewayDefault: string
  fullConfigNeedsNewGateway: string
  capabilitiesImmediate: string
  soulConfig: string
  skillsEnabled: (enabled: number, total: number) => string
  toolsetsEnabled: (enabled: number, total: number) => string
  mcpServers: string
  catalog: string
  catalogInstalled: string
  modelNameExample: string

  // New agent dialog
  newAgentTitle: string
  newAgentDesc: string
  namePlaceholder: string
  titlePlaceholder: string
  descPlaceholder: string
  general: string
  capabilities: string
  skills: string
  toolsets: string
  tools: string
  mcp: string
  cloneFromProfile: string
  cloneFromProfileOn: (target: string) => string
  createOn: string
  currentConnection: (name: string) => string
  remoteAgentLocationHint: (target: string) => string
  freshProfile: string
  createEmpty: string
  filterSkills: string
  noMcpServers: string
  creating: string
  createAgent: string
  agentCreated: (name: string) => string
  agentCreatedOn: (name: string, target: string) => string
  couldNotCleanDraft: (name: string) => string
  catalogFrom: (source: string) => string
  defaultToolsetBehavior: string
  agentExists: (name: string) => string
  agentExistsOn: (name: string, target: string) => string
  inheritedFromLaunchProfile: string
  soulOptional: string
  soulPlaceholder: string
  shareKeys: string
  shareKeysDesc: string
  createEmptyLabel: string
  nameTakenForCapabilities: string
  nameFirstForCapabilities: string
  capabilityCatalogNeedsGateway: string
  configuredServersDesc: string

  // Cronjobs
  cronjobs: string
  cronjobsUnavailableUntilRoster: string
  newCronjob: string
  cronjobName: string
  instruction: string
  instructionPlaceholder: string
  whenToRun: string
  sendResultsTo: string
  runHistoryOnly: string
  botChatResponds: (name: string) => string
  stopAfter: string
  runs: string
  scheduling: string
  createCronjob: string
  createCronjobForBot: string
  routineFilterHint: string
  couldNotLoad: string
  cronjobDetails: string
  routineDetailDescription: string
  active: string
  status: string
  schedule: string
  scheduleRaw: string
  repeat: string
  nextRunLabel: string
  lastRun: string
  lastResult: string
  deliversTo: string
  workingDirectory: string
  cronjobsDesc: string
  recurringTaskDesc: (name: string) => string
  continuity: string
  deleteCronjob: string
  legacyCronjobPaused: string
  cronjobNameNul: string
  cronjobInstructionNul: string
  paused: string
  nextRun: (time: string) => string
  onceShort: (amount: string, unit: string) => string
  everyDays: (count: number) => string
  everyHours: (count: number) => string
  everyMinutes: (count: number) => string

  // Schedule options
  once: string
  hourly: string
  daily: string
  weekdays: string
  weekly: string
  monthly: string
  interval: string
  advancedSchedule: string
  minutesFromNow: string
  hoursFromNow: string
  daysFromNow: string
  minutes: string
  hours: string
  days: string
  rawSchedule: string
  runsOnce: (amount: string, unit: string) => string
  runsHourly: (cap: string) => string
  runsDaily: (time: string) => string
  runsWeekdays: (time: string) => string
  runsWeekly: (day: string, time: string) => string
  runsMonthly: (day: string, time: string) => string
  runsInterval: (amount: string, unit: string) => string
  totalRuns: (count: string) => string

  // Weekdays
  monday: string
  tuesday: string
  wednesday: string
  thursday: string
  friday: string
  saturday: string
  sunday: string

  // Sessions
  filterSessions: string
  couldNotLoadSessions: string
  noSessionsMatch: string
  noSessions: string
  untitledSession: string
  noMessages: string
  profileSessions: (name: string) => string
  showingRecentSessions: (count: number) => string
  noMatchingRecentSessions: (count: number) => string
  desktopCannotOpenSessions: string

  // Group chat
  newGroupChatTitle: string
  searchBotsToAdd: string
  removeFromSelection: string
  groupName: string
  sayToGroup: string
  roomWorking: string
  pickBotsForRoom: (max: number) => string
  noBotsYetCreateFirst: string
  pickAtLeastTwo: string
  createGroup: (count?: number) => string
  groupChatTitle: (name: string) => string
  botsCount: (count: number) => string
  you: string
  messageGroup: (name: string) => string
  messageGroupPlaceholder: (name: string) => string
  disbandGroupChat: (name: string) => string
  disbandGroupChatTitle: string
  disbandGroupChatDesc: (name: string, count: number) => string
  disband: string
  disbanding: string
  disbanded: string
  disbandedGroup: (name: string) => string
  hideFullHandle: string
  showFullHandle: string

  // Group management
  moveToGroupTitle: string
  moveToGroupDesc: string
  manageGroupsTitle: string
  manageGroupsDesc: string
  createAndJoin: string
  removeFromAllGroups: string
  addedToGroup: (bot: string, group: string) => string
  removedFromNamedGroup: (bot: string, group: string) => string
  newGroupPlaceholder: string
  groupNameLabel: string
  newGroup: string
  removeFromGroup: (name: string) => string
  movedToGroup: (bot: string, group: string) => string
  removedFromGroup: (bot: string) => string
  groupNeedsYouTitle: string
  openGroupChat: (name: string) => string
  inGroup: (handle: string, group: string) => string
  inGroups: (handle: string, groups: string[]) => string

  // Delete confirmation
  deleteBotTitle: string
  deleteBotDesc: (name: string, path: string) => string
  deleting: string
  deleted: string
  deletedProfile: (name: string) => string

  // Status messages
  needsSetup: (requires: string) => string
  setUp: string
  saveAndTest: string
  working: string
  setupFailed: (message?: string) => string

  // Skills Hub
  skillsHub: string
  hermesSkillsHub: string
  searchHub: string
  searching: string
  searchingShort: string
  noHubSkills: string
  added: string

  // Empty states
  noAgentsYet: string
  createFirstTeammate: string

  // Error messages - MCP Setup
  couldNotAddServer: string
  noTargetProfile: string
  failedToSet: (key: string) => string
  serverTestFailed: string
  couldNotStartOAuth: string
  completeSignIn: string
  oauthFailed: string
  configured: (name: string) => string
  authenticated: (name: string) => string

  // Error messages - Avatar
  avatarGenerationFailed: string
  attachment: string
  attachmentTooLarge: (name: string) => string
  generationFailed: string
  groupPictureGenerationFailed: string
  couldNotLoadPet: string
  imageTooLarge: string

  // Error messages - Bot operations
  duplicateFailed: string
  groupAlreadyExists: (name: string) => string
  noFreeDuplicateName: string
  advancedConfigFailed: string
  couldNotCreateProfile: string
  couldNotCreateAgent: string
  couldNotDeleteProfile: (name: string) => string
  couldNotReach: (source: string) => string
  couldNotOpenAgentChat: (name: string) => string
  remoteMessaged: (handle: string, source: string) => string
  remoteNoReply: (handle: string, source: string) => string
  remoteMentionHint: (handle: string) => string

  // Error messages - Sessions
  couldNotOpenSession: string
  couldNotLoadSessionsError: string

  // Error messages - Cronjobs
  cronjobUpdateFailed: string
  couldNotRefreshCronjobs: string

  // Success messages
  created: (name: string, original?: string) => string
  updated: (name: string) => string
  pinned: (name: string, isPinned: boolean) => string
  duplicating: (name: string) => string
  skillInstalled: (name: string) => string
  draftDiscarded: (name: string) => string
  cronjobScheduled: (name: string) => string
  groupCreated: (name: string, count: number) => string

  // Partial success/warnings
  savedLocallyRemoteFailed: string
  savedLocallyDescFailed: string
  someSectionsFailed: (sections: string) => string

  // Instructions
  openBotsPane: string
  scrollForMore: (shown: number, total: number) => string

  // MCP Setup UI
  setUpCheckmark: string
  noImageModel: string
  restartGateway: string

  // Provider & Model
  provider: string
  model: string
  providerCustom: string
  modelCustom: string

  // Advanced
  dayOfMonth: string
  runsAtTopOfHour: (cap: string) => string

  // Misc
  conversation: string
  remoteSource: string
  untitledCronjob: string
  installing: (name: string) => string
  installAndAdd: (name: string) => string
  hitAddToAgent: string
  search: string
  hideHubBrowser: string
  browseFullHub: string
  installingFailed: (name: string) => string

  // Plugin chrome / metadata
  pluginName: string
  pluginDescription: string
}

const en: BotsMessages = {
  cancel: 'Cancel',
  save: 'Save',
  create: 'Create',
  delete: 'Delete',
  back: 'Back',
  close: 'Close',
  retry: 'retry',
  send: 'Send',
  retryLabel: 'Retry',
  signIn: 'Sign in…',
  setUpAction: 'Set up…',
  authorizing: 'Authorizing…',

  bots: 'BOTS',
  noBots: 'No agents yet',
  noBotsDesc: 'Create your first teammate.',
  searchBots: 'Search bots…',
  noBotsMatch: query => `No bots match "${query}"`,
  newAgent: 'New Agent',
  newGroupChat: 'New Group Chat',
  activityToastsOn: 'Activity toasts on — click to silence',
  activityToastsOff: 'Activity toasts off — click to enable',
  botChatsHidden: 'Bot Chats hidden from Sessions — click to show',
  botChatsShown: 'Bot Chats shown in Sessions — click to hide',
  hideHiddenBotsAgain: 'Hide hidden bots again',
  showHiddenBotsCount: count => `Show ${count} hidden bot${count === 1 ? '' : 's'}`,
  hideHiddenBots: 'Hide hidden bots',
  showHiddenBots: 'Show hidden bots',
  hiddenBotUnread: 'A hidden bot has unread activity',
  allBotsHidden: 'All bots are hidden — use the eye button above to show them.',
  retryNow: 'Retry now',
  newMenu: 'New…',
  newAgentOrGroup: 'New agent or group chat',
  rosterRefreshFailed: 'Roster refresh failed — showing the last good list.',
  waitingForGateway: 'Waiting for the gateway to reconnect…',
  rosterUnavailable: message =>
    `Roster unavailable: ${message}. If your gateway predates profiles.list, update Hermes and restart the gateway.`,
  gatewayError: 'gateway error',
  newMessageFor: name => `🤖 New message for ${name}`,
  newActivityFor: name => `${name} has new activity`,
  openChatToSee: 'Open the chat to see it.',
  thisDevice: 'This device',
  hermesGateway: 'Hermes gateway',

  editProfile: 'Edit Profile',
  duplicate: 'Duplicate',
  newChatWithAgent: 'New chat with this agent',
  pin: 'Pin to top',
  unpin: 'Unpin',
  pinnedTitle: 'Pinned',
  sessions: 'Sessions',
  moveToGroup: 'Move to group…',
  group: name => `Group: ${name}…`,
  manageGroups: 'Manage groups…',
  groups: names => `Groups: ${names}…`,
  unread: 'unread',
  activeRecently: 'Active in the last 90s',
  openAgentChat: name => `Open ${name}'s chat`,
  noConversations: 'No conversations yet — say hi',
  updateForRemoteAgents: 'Update Hermes Desktop to chat with agents on other connections.',
  remoteSourceLabel: 'the remote source',
  livesOn: source => `Lives on ${source}`,
  lastMessageFrom: name => `Last message came from @${name} (bot-to-bot)`,
  hiddenFromRoster: 'Hidden from the roster',
  hideBot: 'Hide Bot',
  unhideBot: 'Unhide Bot',
  botHidden: name => `${name} hidden — use the eye button in the Bots header to see hidden bots`,
  botUnhidden: name => `${name} is back in the roster`,

  botChat: 'Bot Chat',
  activeNow: 'Active now',
  needsYou: 'needs you',
  openChat: 'Open chat',
  openContinuousChatDescription:
    'Open this bot’s continuous chat. Its background work keeps running when you switch away.',
  chatNeverResets: 'This chat never resets',
  chatNeverResetsDesc:
    'Bot chats are one continuous conversation — compacting instead. For a throwaway session with this agent, use Sessions mode.',

  editProfileTitle: 'Edit Profile',
  name: 'Name',
  title: 'Title',
  description: 'Description',
  whatHelp: 'What should this agent help with?',
  advanced: 'Advanced',
  advancedConfig: 'Advanced — model, skills, toolsets, SOUL.md',
  saving: 'Saving…',
  appearanceAndRole: (displayName, profile) => `Appearance and role for ${displayName} (${profile}).`,

  bot: 'Bot',
  generate: 'Generate',
  upload: 'Upload',
  pet: 'Pet',
  removeImage: 'Remove image — use shape',
  describeAvatar: 'Describe your avatar…',
  avatarAuto: 'Auto',
  avatarAutoTitle: 'Auto — the name decides',
  avatarRandomize: 'Randomize',
  avatarUnlockTitle: 'Unlock — the face follows the agent’s name again',
  avatarLockTitle: 'Keep this exact face even if the name changes',
  avatarUnlock: 'Unlock',
  avatarLockFace: 'Lock face',
  avatarLockedHint: 'Face locked — renaming won’t change it.',
  avatarFollowsNameHint: 'Face follows the name.',
  avatarClassicShapes: 'Classic shapes',
  avatarBlobTitle: 'Blob face — drawn from the agent’s name',
  generating: 'Generating…',
  leaveBlankGenerate: "Leave blank to generate from the agent's name and description.",
  choosePet: "Pick a pet as this agent's profile picture.",
  removePet: 'Remove — back to shape avatar',
  noPetsMatch: 'No pets match.',
  noPets: 'No pets in the petdex gallery. Run `hermes pets` to explore.',
  chooseImage: 'Choose an image…',
  searchPets: count => `Search ${count} pets…`,
  inheritLaunchProfile: 'Inherit (launch profile)',
  enterManually: '✏️ Enter manually…',
  backToDropdowns: '← Back to dropdowns',
  gatewayDefault: 'gateway default',
  fullConfigNeedsNewGateway: 'Full configuration needs a newer gateway (restart it after updating Hermes).',
  capabilitiesImmediate: 'Capabilities (applies immediately — skills, tools, MCP)',
  soulConfig: 'SOUL.md (persona + agent-messaging protocol)',
  skillsEnabled: (enabled, total) => `Skills (${enabled}/${total} enabled)`,
  toolsetsEnabled: (enabled, total) => `Toolsets (${enabled}/${total} enabled — unchecking all restores the default)`,
  mcpServers: 'MCP servers',
  catalog: 'catalog',
  catalogInstalled: 'catalog · installed',
  modelNameExample: 'e.g. model name',

  newAgentTitle: 'New Agent',
  newAgentDesc: 'A named teammate with its own memory, skills, and chat. It can message your other agents.',
  namePlaceholder: 'inbox-triage',
  titlePlaceholder: 'Inbox Triage',
  descPlaceholder: 'What should this Bot help with?',
  general: 'General',
  capabilities: 'Capabilities',
  skills: 'Skills',
  toolsets: 'Tools',
  tools: 'Tools',
  mcp: 'MCP',
  cloneFromProfile: 'Clone from profile',
  cloneFromProfileOn: target => `Clone from profile (on ${target})`,
  createOn: 'Create on',
  currentConnection: name => `${name} (current)`,
  remoteAgentLocationHint: target =>
    `The agent is created on ${target} and appears in the roster as a Connections bot. Chat routes to that machine.`,
  freshProfile: 'Fresh profile (bundled skills)',
  createEmpty: '"Create empty" is checked — no bundled skills will be installed.',
  filterSkills: 'Filter skills…',
  noMcpServers: 'No MCP servers configured or in the catalog.',
  creating: 'Creating…',
  createAgent: 'Create Agent',
  agentCreated: name => `Agent "${name}" created`,
  agentCreatedOn: (name, target) => `Agent "${name}" created on ${target}`,
  couldNotCleanDraft: name => `Could not clean up draft profile "${name}"`,
  catalogFrom: source => `Catalog from ${source} — unchecked skills are disabled after creation.`,
  defaultToolsetBehavior: 'Leaving all (or none) checked keeps the default toolset behavior.',
  agentExists: name => `An agent named "${name}" already exists.`,
  agentExistsOn: (name, target) => `An agent named "${name}" already exists on ${target}.`,
  inheritedFromLaunchProfile: 'inherited from launch profile',
  soulOptional: 'SOUL.md (optional — replaces the generated persona)',
  soulPlaceholder: 'Leave blank to auto-generate from name/title/description + agent-messaging roster.',
  shareKeys: 'Share keys & accounts with the main profile',
  shareKeysDesc:
    'Subscriptions, OAuth logins, and API keys stay shared (not copied), so token refreshes never invalidate each other. Uncheck for an isolated snapshot copy.',
  createEmptyLabel: 'Create empty (skip bundled skills)',
  nameTakenForCapabilities: 'That name is taken — pick another before configuring capabilities.',
  nameFirstForCapabilities:
    'Name the agent first — a draft profile is created when you open this tab (discarded if you cancel).',
  capabilityCatalogNeedsGateway: 'Capability catalog needs a newer gateway (restart it after updating Hermes).',
  configuredServersDesc:
    'Configured servers copy from the main profile; catalog entries are the bundled MCP menu. Entries needing API keys route through setup first (credentials follow the shared keys setting).',

  cronjobs: 'Cronjobs',
  cronjobsUnavailableUntilRoster: 'Cronjobs are unavailable until this agent appears in the roster.',
  newCronjob: 'New Cronjob',
  cronjobName: 'Name this cronjob',
  instruction: 'Instruction',
  instructionPlaceholder: 'What should this cronjob do each time it runs?',
  whenToRun: 'When to run',
  sendResultsTo: 'Send results to',
  runHistoryOnly: 'Run history only',
  botChatResponds: name => `${name}\u2019s chat (bot responds)`,
  stopAfter: 'Stop after',
  runs: 'runs (blank = forever)',
  scheduling: 'Scheduling…',
  createCronjob: 'Create Cronjob',
  createCronjobForBot: 'Create a cronjob for this bot',
  routineFilterHint:
    'Cronjobs exist in this profile but none are tagged for this bot. Name a job "[bot:<name>] …" to show it here, or see them in Cron below.',
  couldNotLoad: 'Could not load cronjobs. The list may still be there.',
  cronjobDetails: 'Cronjob details',
  routineDetailDescription: 'What this cronjob runs, and when it runs next.',
  active: 'Active',
  status: 'Status',
  schedule: 'Schedule',
  scheduleRaw: 'Schedule (raw)',
  repeat: 'Repeat',
  nextRunLabel: 'Next run',
  lastRun: 'Last run',
  lastResult: 'Last result',
  deliversTo: 'Delivers to',
  workingDirectory: 'Working directory',
  cronjobsDesc: 'Cronjobs are recurring tasks this agent runs on a schedule.',
  recurringTaskDesc: name => `A recurring task ${name} runs on a schedule. Runs land in its own chat history.`,
  continuity: 'Continuity: each run sees the previous run’s output (dedupe, continue where it left off)',
  deleteCronjob: 'Delete cronjob',
  legacyCronjobPaused: 'Paused for security: delete and recreate this legacy cronjob before running it again.',
  cronjobNameNul: 'Cronjob name cannot contain NUL (U+0000).',
  cronjobInstructionNul: 'Cronjob instruction cannot contain NUL (U+0000).',
  paused: 'paused',
  nextRun: time => `next ${time}`,
  onceShort: (amount, unit) => `Once (${amount}${unit})`,
  everyDays: count => (count === 1 ? 'Daily' : `Every ${count} days`),
  everyHours: count => (count === 1 ? 'Hourly' : `Every ${count}h`),
  everyMinutes: count => `Every ${count}m`,

  once: 'Once, in…',
  hourly: 'Every hour',
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekly: 'Every week',
  monthly: 'Every month',
  interval: 'Interval',
  advancedSchedule: 'Advanced…',
  minutesFromNow: 'minutes from now',
  hoursFromNow: 'hours from now',
  daysFromNow: 'days from now',
  minutes: 'minutes',
  hours: 'hours',
  days: 'days',
  rawSchedule: 'Raw schedule — every Nm/Nh/Nd or 5-field cron',
  runsOnce: (amount, unit) => `Runs once, ${amount} ${unit} from now`,
  runsHourly: cap => `Runs at the top of every hour${cap}`,
  runsDaily: time => `Runs every day at ${time}`,
  runsWeekdays: time => `Runs Monday–Friday at ${time}`,
  runsWeekly: (day, time) => `Runs every ${day} at ${time}`,
  runsMonthly: (day, time) => `Runs on day ${day} of each month at ${time}`,
  runsInterval: (amount, unit) => `Runs every ${amount} ${unit}`,
  totalRuns: count => `, ${count} time(s) total`,

  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',

  filterSessions: 'Filter sessions…',
  couldNotLoadSessions: 'Could not load sessions for this profile.',
  noSessionsMatch: 'No sessions match that filter.',
  noSessions: 'No stored sessions yet.',
  untitledSession: 'Untitled session',
  noMessages: 'No messages yet',
  profileSessions: name => `${name} sessions`,
  showingRecentSessions: count => `Showing the ${count} most recent sessions.`,
  noMatchingRecentSessions: count => `No matching sessions in the ${count} most recent.`,
  desktopCannotOpenSessions: 'This Hermes Desktop version cannot open stored sessions',

  newGroupChatTitle: 'New Group Chat',
  searchBotsToAdd: 'Search bots to add…',
  removeFromSelection: 'Remove from selection',
  groupName: 'Group name',
  sayToGroup: 'Say something — every bot in this group hears the room.',
  roomWorking: 'The room is working…',
  pickBotsForRoom: max =>
    `Pick 2–${max} bots. Local memberships sync through each Bot profile; cross-machine members stay scoped to this room.`,
  noBotsYetCreateFirst: 'No bots yet — create agents first.',
  pickAtLeastTwo: 'Pick at least 2 bots',
  createGroup: count => `Create Group${count ? ` (${count})` : ''}`,
  groupChatTitle: name => `${name} — group chat`,
  botsCount: count => `${count} bots`,
  you: 'You',
  messageGroup: name => `Message ${name}`,
  messageGroupPlaceholder: name => `Message ${name}… (@name to direct, @everyone for all)`,
  disbandGroupChat: name => `Disband the ${name} group chat`,
  disbandGroupChatTitle: 'Disband group chat?',
  disbandGroupChatDesc: (name, count) =>
    `This removes the ${name} grouping from its ${count} bots and clears the shared room log. The bots themselves and their per-group sessions are kept.`,
  disband: 'Disband',
  disbanding: 'Disbanding…',
  disbanded: 'Disbanded',
  disbandedGroup: name => `Disbanded “${name}”`,
  hideFullHandle: 'Hide full handle',
  showFullHandle: 'Show full handle',

  moveToGroupTitle: 'Move to group',
  moveToGroupDesc: 'Groups render as labeled sections in the BOTS roster and sync to every machine.',
  manageGroupsTitle: 'Manage groups',
  manageGroupsDesc: 'A bot can join multiple group chats. Memberships sync to every machine.',
  createAndJoin: 'Create & join',
  removeFromAllGroups: 'Remove from all groups',
  addedToGroup: (bot, group) => `${bot} added to “${group}”`,
  removedFromNamedGroup: (bot, group) => `${bot} removed from “${group}”`,
  newGroupPlaceholder: 'Group name (e.g. Research)',
  groupNameLabel: 'Group name',
  newGroup: 'New group…',
  removeFromGroup: name => `Remove from “${name}”`,
  movedToGroup: (bot, group) => `${bot} moved to “${group}”`,
  removedFromGroup: bot => `${bot} removed from its group`,
  groupNeedsYouTitle: 'A bot in this room needs your input',
  openGroupChat: name => `Open the ${name} group chat`,
  inGroup: (handle, group) => `@${handle} · in “${group}”`,
  inGroups: (handle, groups) => `@${handle} · in ${groups.map(group => `“${group}”`).join(', ')}`,

  deleteBotTitle: 'Delete bot and profile?',
  deleteBotDesc: (name, path) =>
    `This will permanently delete the bot ${name} and its associated Hermes profile at ${path}. This cannot be undone.`,
  deleting: 'Deleting…',
  deleted: 'Deleted',
  deletedProfile: name => `Deleted profile ${name}`,

  needsSetup: requires => `needs setup (${requires}) — restart the gateway to enable in-app setup`,
  setUp: 'set up ✓',
  saveAndTest: 'Save & test',
  working: 'Working…',
  setupFailed: message => message || 'Setup failed',

  skillsHub: 'Skills Hub',
  hermesSkillsHub: 'Hermes Skills Hub',
  searchHub: 'Search the hub (community + well-known sources)…',
  searching: 'Searching community + well-known sources — can take ~10s…',
  searchingShort: 'Searching…',
  noHubSkills: 'No hub skills matched.',
  added: '✓ added',

  noAgentsYet: 'No agents yet',
  createFirstTeammate: 'Create your first teammate.',

  // Error messages - MCP Setup
  couldNotAddServer: 'Could not add server',
  noTargetProfile: 'No target profile',
  failedToSet: k => `Failed to set ${k}`,
  serverTestFailed: 'Server test failed after setup',
  couldNotStartOAuth: 'Could not start OAuth',
  completeSignIn: 'Complete sign-in in your browser...',
  oauthFailed: 'OAuth failed',
  configured: name => `${name} configured`,
  authenticated: name => `${name} authenticated`,

  // Error messages - Avatar
  avatarGenerationFailed: 'Avatar generation failed',
  attachment: 'attachment',
  attachmentTooLarge: name => `${name}: too large (max 15MB).`,
  generationFailed: 'generation failed',
  groupPictureGenerationFailed: 'Group picture generation failed',
  couldNotLoadPet: 'Could not load that pet — try another.',
  imageTooLarge: 'Image too large (max 15MB).',

  // Error messages - Bot operations
  duplicateFailed: 'Duplicate failed',
  groupAlreadyExists: name => `A group named “${name}” already exists.`,
  noFreeDuplicateName: 'No free name for the duplicate.',
  advancedConfigFailed: 'Advanced configuration failed',
  couldNotCreateProfile: 'Could not create the profile yet',
  couldNotCreateAgent: 'Could not create the agent.',
  couldNotDeleteProfile: name => `Could not delete profile ${name}.`,
  couldNotReach: source => `Could not reach ${source}`,
  couldNotOpenAgentChat: name => `Could not open ${name}'s chat — try again`,
  remoteMessaged: (handle, source) => `Messaged @${handle} on ${source} — will relay the reply here.`,
  remoteNoReply: (handle, source) => `No reply from @${handle} yet — check its Bot Chat on ${source}.`,
  remoteMentionHint: handle => `Stay in this chat and @${handle} to message them. Gateway stays on this device.`,

  // Error messages - Sessions
  couldNotOpenSession: 'Could not open session',
  couldNotLoadSessionsError: 'Could not load sessions for this profile.',

  // Error messages - Cronjobs
  cronjobUpdateFailed: 'Cronjob update failed',
  couldNotRefreshCronjobs: 'Could not refresh cronjobs. Showing the last list we had.',

  // Success messages
  created: (name, original) => (original ? `Created ${name} — full copy of ${original}` : `Created ${name}`),
  updated: name => `${name} updated`,
  pinned: (name, isPinned) => `${name} ${isPinned ? 'pinned to top' : 'unpinned'}`,
  duplicating: name => `Duplicating ${name}…`,
  skillInstalled: name => `Skill "${name}" installed`,
  draftDiscarded: name => `Draft agent "${name}" discarded`,
  cronjobScheduled: name => `Cronjob "${name}" scheduled`,
  groupCreated: (name, count) => `"${name}" created with ${count} bots`,

  // Partial success/warnings
  savedLocallyRemoteFailed: 'Saved look locally; remote persistence failed',
  savedLocallyDescFailed: 'Saved look locally; description update failed',
  someSectionsFailed: sections => `Some sections failed: ${sections}`,

  // Instructions
  openBotsPane: 'Open the Bots pane and hit "New Agent".',
  scrollForMore: (shown, total) => `Scroll for more (${shown} of ${total})`,

  // MCP Setup UI
  setUpCheckmark: 'set up ✓',
  noImageModel:
    'No image model available. If you just enabled one (or updated Hermes), restart the gateway: Ctrl+K → "Restart gateway".',
  restartGateway: 'Restart gateway',

  // Provider & Model
  provider: 'Provider',
  model: 'Model',
  providerCustom: 'Provider (Custom)',
  modelCustom: 'Model (Custom)',

  // Advanced
  dayOfMonth: 'Day of month',
  runsAtTopOfHour: cap => `Runs at the top of every hour${cap}`,

  // Misc
  conversation: 'Conversation',
  remoteSource: 'Remote source',
  untitledCronjob: 'Untitled cronjob',
  installing: name => `Installing "${name}"…`,
  installAndAdd: name => `Install "${name}" and add it to the list above`,
  hitAddToAgent:
    'Hit "+ Add to this Agent" on any skill — it installs and appears in the list above. Drag the corner to resize.',
  search: 'Search',
  hideHubBrowser: 'hide the hub browser',
  browseFullHub: 'browse the full hub ▾',
  installingFailed: name => `Installing "${name}" failed`,
  pluginName: 'Bots',
  pluginDescription:
    'Bot Mode — a one-chat-per-agent roster with avatars, routines, group chats, and bot-to-bot messaging. Ships with the app; disable here if unwanted.'
}

const zh: BotsMessages = {
  cancel: '取消',
  save: '保存',
  create: '创建',
  delete: '删除',
  back: '返回',
  close: '关闭',
  retry: '重试',
  send: '发送',
  retryLabel: '重试',
  signIn: '登录…',
  setUpAction: '设置…',
  authorizing: '正在授权…',

  bots: '智能体',
  noBots: '尚无代理',
  noBotsDesc: '创建你的第一个队友',
  searchBots: '搜索 Bot…',
  noBotsMatch: query => `没有匹配"${query}"的 Bot`,
  newAgent: '新建代理',
  newGroupChat: '新建群聊',
  activityToastsOn: '活动通知已开启 — 点击静音',
  activityToastsOff: '活动通知已关闭 — 点击启用',
  botChatsHidden: 'Bot 聊天已从会话中隐藏 — 点击显示',
  botChatsShown: 'Bot 聊天已在会话中显示 — 点击隐藏',
  hideHiddenBotsAgain: '再次隐藏已隐藏的 Bot',
  showHiddenBotsCount: count => `显示 ${count} 个已隐藏的 Bot`,
  hideHiddenBots: '隐藏已隐藏的 Bot',
  showHiddenBots: '显示已隐藏的 Bot',
  hiddenBotUnread: '有一个已隐藏的 Bot 存在未读动态',
  allBotsHidden: '所有 Bot 均已隐藏，请使用上方的眼睛按钮显示它们',
  retryNow: '立即重试',
  newMenu: '新建…',
  newAgentOrGroup: '新建代理或群聊',
  rosterRefreshFailed: '智能体列表刷新失败，正在显示上次成功加载的列表',
  waitingForGateway: '正在等待网关重新连接…',
  rosterUnavailable: message =>
    `智能体列表不可用：${message}。如果网关版本早于 profiles.list，请更新 Hermes 并重启网关。`,
  gatewayError: '网关错误',
  newMessageFor: name => `🤖 ${name} 收到新消息`,
  newActivityFor: name => `${name} 有新动态`,
  openChatToSee: '打开聊天即可查看',
  thisDevice: '此设备',
  hermesGateway: 'Hermes 网关',

  editProfile: '编辑资料',
  duplicate: '复制',
  newChatWithAgent: '与此代理新建聊天',
  pin: '置顶',
  unpin: '取消置顶',
  pinnedTitle: '已置顶',
  sessions: '会话',
  moveToGroup: '移至分组…',
  group: name => `分组：${name}…`,
  manageGroups: '管理分组…',
  groups: names => `分组：${names}…`,
  unread: '未读',
  activeRecently: '最近 90 秒内活跃',
  openAgentChat: name => `打开 ${name} 的聊天`,
  noConversations: '尚无对话，来打个招呼吧',
  updateForRemoteAgents: '请更新 Hermes Desktop，以便与其他连接上的代理聊天',
  remoteSourceLabel: '远程来源',
  livesOn: source => `位于 ${source}`,
  lastMessageFrom: name => `上一条消息来自 @${name}（Bot 间通信）`,
  hiddenFromRoster: '已从智能体列表中隐藏',
  hideBot: '隐藏 Bot',
  unhideBot: '取消隐藏 Bot',
  botHidden: name => `${name} 已隐藏，可使用智能体列表标题栏中的眼睛按钮查看`,
  botUnhidden: name => `${name} 已重新显示在智能体列表中`,

  botChat: 'Bot 聊天',
  activeNow: '当前活跃',
  needsYou: '需要你',
  openChat: '打开聊天',
  openContinuousChatDescription: '打开此 Bot 的连续聊天，切换到其他页面后，其后台工作仍会继续运行',
  chatNeverResets: '此聊天永不重置',
  chatNeverResetsDesc: 'Bot 聊天是一次连续对话——采用压缩而非重置，如需与此代理进行一次性会话，请使用会话模式',

  editProfileTitle: '编辑资料',
  name: '名称',
  title: '标题',
  description: '描述',
  whatHelp: '此代理应该帮助什么？',
  advanced: '高级',
  advancedConfig: '高级 — 模型、技能、工具集、SOUL.md',
  saving: '保存中…',
  appearanceAndRole: (displayName, profile) => `${displayName}（${profile}）的外观和角色设置`,

  bot: '形象',
  generate: '生成',
  upload: '上传',
  pet: '宠物',
  removeImage: '移除图片 — 使用形状',
  describeAvatar: '描述你的头像…',
  avatarAuto: '自动',
  avatarAutoTitle: '自动 — 由代理名称决定',
  avatarRandomize: '随机生成',
  avatarUnlockTitle: '解锁 — 头像将重新随代理名称变化',
  avatarLockTitle: '即使名称改变，也保留当前头像',
  avatarUnlock: '解锁',
  avatarLockFace: '锁定头像',
  avatarLockedHint: '头像已锁定 — 重命名不会改变它',
  avatarFollowsNameHint: '头像随名称变化',
  avatarClassicShapes: '经典形状',
  avatarBlobTitle: 'Blob 头像 — 根据代理名称生成',
  generating: '生成中…',
  leaveBlankGenerate: '留空可根据代理的名称和描述自动生成',
  choosePet: '选择一个宠物作为此代理的头像',
  removePet: '移除 — 恢复形状头像',
  noPetsMatch: '没有匹配的宠物',
  noPets: '宠物图鉴中没有宠物。运行 `hermes pets` 来探索',
  chooseImage: '选择图片…',
  searchPets: count => `搜索 ${count} 个宠物…`,
  inheritLaunchProfile: '继承（启动资料）',
  enterManually: '✏️ 手动输入…',
  backToDropdowns: '← 返回下拉选项',
  gatewayDefault: '网关默认值',
  fullConfigNeedsNewGateway: '完整配置需要更新版本的网关（更新 Hermes 后请重启网关）',
  capabilitiesImmediate: '能力（立即应用：技能、工具、MCP）',
  soulConfig: 'SOUL.md（角色设定 + 代理消息协议）',
  skillsEnabled: (enabled, total) => `技能（已启用 ${enabled}/${total}）`,
  toolsetsEnabled: (enabled, total) => `工具集（已启用 ${enabled}/${total}；全部取消勾选将恢复默认值）`,
  mcpServers: 'MCP 服务器',
  catalog: '目录',
  catalogInstalled: '目录 · 已安装',
  modelNameExample: '例如：模型名称',

  newAgentTitle: '新建代理',
  newAgentDesc: '一个拥有自己记忆、技能和聊天的具名队友。它可以向你的其他代理发送消息',
  namePlaceholder: 'inbox-triage',
  titlePlaceholder: '收件箱分类',
  descPlaceholder: '此 Bot 应该帮助什么？',
  general: '常规',
  capabilities: '能力',
  skills: '技能',
  toolsets: '工具',
  tools: '工具',
  mcp: 'MCP',
  cloneFromProfile: '从资料克隆',
  cloneFromProfileOn: target => `从资料克隆（位于 ${target}）`,
  createOn: '创建位置',
  currentConnection: name => `${name}（当前）`,
  remoteAgentLocationHint: target => `代理将在 ${target} 上创建，并作为连接智能体显示在列表中；聊天会路由到该设备。`,
  freshProfile: '全新资料（内置技能）',
  createEmpty: '已勾选"创建空白" — 不会安装内置技能',
  filterSkills: '筛选技能…',
  noMcpServers: '未配置或目录中没有 MCP 服务器',
  creating: '创建中…',
  createAgent: '创建代理',
  agentCreated: name => `已创建代理“${name}”`,
  agentCreatedOn: (name, target) => `已在 ${target} 上创建代理“${name}”`,
  couldNotCleanDraft: name => `无法清理草稿资料“${name}”`,
  catalogFrom: source => `目录来源：${source}。创建后将禁用未勾选的技能。`,
  defaultToolsetBehavior: '全部勾选或全部不勾选时，将保留默认工具集行为',
  agentExists: name => `名为“${name}”的代理已存在。`,
  agentExistsOn: (name, target) => `${target} 上已存在名为“${name}”的代理。`,
  inheritedFromLaunchProfile: '继承自启动资料',
  soulOptional: 'SOUL.md（可选，将替换自动生成的角色设定）',
  soulPlaceholder: '留空将根据名称、标题、描述和代理消息名单自动生成',
  shareKeys: '与主资料共享密钥和账号',
  shareKeysDesc:
    '订阅、OAuth 登录和 API 密钥保持共享而非复制，因此令牌刷新不会使其他资料失效。取消勾选可创建隔离的快照副本',
  createEmptyLabel: '创建空白资料（跳过内置技能）',
  nameTakenForCapabilities: '该名称已被占用，请先选择其他名称再配置能力',
  nameFirstForCapabilities: '请先为代理命名；打开此标签时会创建草稿资料（取消时将删除）',
  capabilityCatalogNeedsGateway: '能力目录需要更新版本的网关（更新 Hermes 后请重启网关）',
  configuredServersDesc:
    '已配置的服务器会从主资料复制；目录条目来自内置 MCP 菜单。需要 API 密钥的条目会先进入设置流程（凭据遵循共享密钥设置）',

  cronjobs: '定时任务',
  cronjobsUnavailableUntilRoster: '此代理出现在智能体列表中后才能使用定时任务',
  newCronjob: '新建定时任务',
  cronjobName: '为此定时任务命名',
  instruction: '指令',
  instructionPlaceholder: '此定时任务每次运行时应该做什么？',
  whenToRun: '运行时间',
  sendResultsTo: '发送结果至',
  runHistoryOnly: '仅保存到运行历史',
  botChatResponds: name => `${name} 的聊天（Bot 会响应）`,
  stopAfter: '停止条件',
  runs: '次运行（留空=永久）',
  scheduling: '调度中…',
  createCronjob: '创建定时任务',
  createCronjobForBot: '为此 Bot 创建定时任务',
  routineFilterHint:
    '此资料中存在定时任务，但没有标记为属于当前 Bot，请将任务命名为“[bot:<名称>] …”以在此显示，或在下方的定时任务页面中查看',
  couldNotLoad: '无法加载定时任务。列表可能仍然存在',
  cronjobDetails: '定时任务详情',
  routineDetailDescription: '查看此定时任务的内容及下次运行时间',
  active: '已启用',
  status: '状态',
  schedule: '计划',
  scheduleRaw: '原始计划',
  repeat: '重复',
  nextRunLabel: '下次运行',
  lastRun: '上次运行',
  lastResult: '上次结果',
  deliversTo: '发送至',
  workingDirectory: '工作目录',
  cronjobsDesc: '定时任务是此代理按计划运行的重复性任务',
  recurringTaskDesc: name => `${name} 会按计划运行重复任务，运行结果保存在自己的聊天记录中。`,
  continuity: '连续运行：每次运行都能看到上一次的输出（去重，并从上次中断处继续）',
  deleteCronjob: '删除定时任务',
  legacyCronjobPaused: '出于安全考虑已暂停：请删除并重新创建此旧版定时任务后再运行',
  cronjobNameNul: '定时任务名称不能包含 NUL（U+0000）',
  cronjobInstructionNul: '定时任务指令不能包含 NUL（U+0000）',
  paused: '已暂停',
  nextRun: time => `下次运行：${time}`,
  onceShort: (amount, unit) => `一次（${amount}${unit}）`,
  everyDays: count => (count === 1 ? '每天' : `每 ${count} 天`),
  everyHours: count => (count === 1 ? '每小时' : `每 ${count} 小时`),
  everyMinutes: count => `每 ${count} 分钟`,

  once: '一次性，在…',
  hourly: '每小时',
  daily: '每天',
  weekdays: '工作日',
  weekly: '每周',
  monthly: '每月',
  interval: '间隔',
  advancedSchedule: '高级…',
  minutesFromNow: '分钟后',
  hoursFromNow: '小时后',
  daysFromNow: '天后',
  minutes: '分钟',
  hours: '小时',
  days: '天',
  rawSchedule: '原始计划 — every Nm/Nh/Nd 或 5 段式 cron',
  runsOnce: (amount, unit) => `${amount} ${unit}后运行一次`,
  runsHourly: cap => `每小时整点运行${cap}`,
  runsDaily: time => `每天 ${time} 运行`,
  runsWeekdays: time => `周一至周五 ${time} 运行`,
  runsWeekly: (day, time) => `每${day} ${time} 运行`,
  runsMonthly: (day, time) => `每月 ${day} 日 ${time} 运行`,
  runsInterval: (amount, unit) => `每 ${amount} ${unit}运行`,
  totalRuns: count => `，共运行 ${count} 次`,

  monday: '星期一',
  tuesday: '星期二',
  wednesday: '星期三',
  thursday: '星期四',
  friday: '星期五',
  saturday: '星期六',
  sunday: '星期日',

  filterSessions: '筛选会话…',
  couldNotLoadSessions: '无法加载此资料的会话',
  noSessionsMatch: '没有匹配该筛选的会话',
  noSessions: '尚无存储的会话',
  untitledSession: '无标题会话',
  noMessages: '尚无消息',
  profileSessions: name => `${name} 的会话`,
  showingRecentSessions: count => `显示最近 ${count} 个会话。`,
  noMatchingRecentSessions: count => `最近 ${count} 个会话中没有匹配项。`,
  desktopCannotOpenSessions: '当前 Hermes Desktop 版本无法打开已存储的会话',

  newGroupChatTitle: '新建群聊',
  searchBotsToAdd: '搜索要添加的 Bot…',
  removeFromSelection: '从选择中移除',
  groupName: '群组名称',
  sayToGroup: '说点什么 — 此群组中的每个 Bot 都能听到',
  roomWorking: '房间正在工作…',
  pickBotsForRoom: max => `选择 2–${max} 个 Bot，本地成员关系通过各 Bot 资料同步；跨设备成员仅归属于此群聊。`,
  noBotsYetCreateFirst: '尚无 Bot，请先创建代理',
  pickAtLeastTwo: '请至少选择 2 个 Bot',
  createGroup: count => `创建群聊${count ? `（${count}）` : ''}`,
  groupChatTitle: name => `${name} — 群聊`,
  botsCount: count => `${count} 个 Bot`,
  you: '你',
  messageGroup: name => `给 ${name} 发消息`,
  messageGroupPlaceholder: name => `给 ${name} 发消息…（@名称可定向发送，@everyone 可发送给所有成员）`,
  disbandGroupChat: name => `解散 ${name} 群聊`,
  disbandGroupChatTitle: '解散群聊？',
  disbandGroupChatDesc: (name, count) =>
    `这会从 ${count} 个 Bot 中移除“${name}”群组并清除共享房间记录，Bot 本身及其各群组会话都会保留`,
  disband: '解散',
  disbanding: '正在解散…',
  disbanded: '已解散',
  disbandedGroup: name => `已解散“${name}”`,
  hideFullHandle: '隐藏完整账号',
  showFullHandle: '显示完整账号',

  moveToGroupTitle: '移至分组',
  moveToGroupDesc: '分组会在 BOTS 名单中显示为标签区块，并同步到每台设备',
  manageGroupsTitle: '管理分组',
  manageGroupsDesc: '一个 Bot 可以加入多个群聊，成员关系会同步到所有设备',
  createAndJoin: '创建并加入',
  removeFromAllGroups: '从所有分组中移除',
  addedToGroup: (bot, group) => `${bot} 已加入“${group}”`,
  removedFromNamedGroup: (bot, group) => `${bot} 已从“${group}”中移除`,
  newGroupPlaceholder: '群组名称（例如：研究）',
  groupNameLabel: '群组名称',
  newGroup: '新建分组…',
  removeFromGroup: name => `从“${name}”中移除`,
  movedToGroup: (bot, group) => `${bot} 已移至“${group}”`,
  removedFromGroup: bot => `${bot} 已移出分组`,
  groupNeedsYouTitle: '此群聊中的一个 Bot 需要你输入内容',
  openGroupChat: name => `打开 ${name} 群聊`,
  inGroup: (handle, group) => `@${handle} · 位于“${group}”`,
  inGroups: (handle, groups) => `@${handle} · 位于${groups.map(group => `“${group}”`).join('、')}`,

  deleteBotTitle: '删除 Bot 和资料？',
  deleteBotDesc: (name, path) => `这将永久删除 Bot ${name} 及其在 ${path} 的关联 Hermes 资料，此操作无法撤销`,
  deleting: '删除中…',
  deleted: '已删除',
  deletedProfile: name => `已删除资料 ${name}`,

  needsSetup: requires => `需要设置（${requires}）— 重启网关以启用应用内设置`,
  setUp: '已设置 ✓',
  saveAndTest: '保存并测试',
  working: '工作中…',
  setupFailed: message => message || '设置失败',

  skillsHub: '技能中心',
  hermesSkillsHub: 'Hermes 技能中心',
  searchHub: '搜索技能中心（社区 + 知名来源）…',
  searching: '正在搜索社区 + 知名来源 — 可能需要约 10 秒…',
  searchingShort: '搜索中…',
  noHubSkills: '没有匹配的技能中心技能',
  added: '✓ 已添加',

  noAgentsYet: '尚无代理',
  createFirstTeammate: '创建你的第一个队友',

  // Error messages - MCP Setup
  couldNotAddServer: '无法添加服务器',
  noTargetProfile: '无目标资料',
  failedToSet: k => `设置 ${k} 失败`,
  serverTestFailed: '设置后服务器测试失败',
  couldNotStartOAuth: '无法启动 OAuth',
  completeSignIn: '在浏览器中完成登录…',
  oauthFailed: 'OAuth 失败',
  configured: name => `${name} 已配置`,
  authenticated: name => `${name} 已认证`,

  // Error messages - Avatar
  avatarGenerationFailed: '头像生成失败',
  attachment: '附件',
  attachmentTooLarge: name => `${name}过大（最大 15MB）。`,
  generationFailed: '生成失败',
  groupPictureGenerationFailed: '群组图片生成失败',
  couldNotLoadPet: '无法加载该宠物 — 请尝试其他',
  imageTooLarge: '图片过大（最大 15MB）',

  // Error messages - Bot operations
  duplicateFailed: '复制失败',
  groupAlreadyExists: name => `已存在名为“${name}”的群组。`,
  noFreeDuplicateName: '没有可用于副本的名称',
  advancedConfigFailed: '高级配置失败',
  couldNotCreateProfile: '尚无法创建资料',
  couldNotCreateAgent: '无法创建代理',
  couldNotDeleteProfile: name => `无法删除资料 ${name}。`,
  couldNotReach: source => `无法访问 ${source}`,
  couldNotOpenAgentChat: name => `无法打开 ${name} 的聊天，请重试`,
  remoteMessaged: (handle, source) => `已在 ${source} 上向 @${handle} 发送消息，回复会转发到此处。`,
  remoteNoReply: (handle, source) => `@${handle} 暂无回复，请在 ${source} 上查看其 Bot 聊天。`,
  remoteMentionHint: handle => `留在当前聊天并使用 @${handle} 向其发送消息；网关仍保持在当前设备。`,

  // Error messages - Sessions
  couldNotOpenSession: '无法打开会话',
  couldNotLoadSessionsError: '无法加载此资料的会话',

  // Error messages - Cronjobs
  cronjobUpdateFailed: '定时任务更新失败',
  couldNotRefreshCronjobs: '无法刷新定时任务。显示上次的列表',

  // Success messages
  created: (name, original) => (original ? `已创建 ${name} — ${original} 的完整副本` : `已创建 ${name}`),
  updated: name => `${name} 已更新`,
  pinned: (name, isPinned) => `${name} ${isPinned ? '已置顶' : '已取消置顶'}`,
  duplicating: name => `正在复制 ${name}…`,
  skillInstalled: name => `技能"${name}"已安装`,
  draftDiscarded: name => `草稿代理"${name}"已丢弃`,
  cronjobScheduled: name => `定时任务"${name}"已调度`,
  groupCreated: (name, count) => `"${name}"已创建，包含 ${count} 个 Bot`,

  // Partial success/warnings
  savedLocallyRemoteFailed: '已在本地保存外观；远程持久化失败',
  savedLocallyDescFailed: '已在本地保存外观；描述更新失败',
  someSectionsFailed: sections => `部分区块失败：${sections}`,

  // Instructions
  openBotsPane: '打开 Bots 面板并点击"新建代理"',
  scrollForMore: (shown, total) => `滚动查看更多（${shown} / ${total}）`,

  // MCP Setup UI
  setUpCheckmark: '已设置 ✓',
  noImageModel: '无可用的图像模型，如果你刚刚启用了一个（或更新了 Hermes），请重启网关：Ctrl+K → "重启网关"',
  restartGateway: '重启网关',

  // Provider & Model
  provider: '提供商',
  model: '模型',
  providerCustom: '提供商（自定义）',
  modelCustom: '模型（自定义）',

  // Advanced
  dayOfMonth: '每月的日期',
  runsAtTopOfHour: cap => `在每小时的整点运行${cap}`,

  // Misc
  conversation: '对话',
  remoteSource: '远程来源',
  untitledCronjob: '无标题定时任务',
  installing: name => `正在安装"${name}"…`,
  installAndAdd: name => `安装"${name}"并添加到上面的列表`,
  hitAddToAgent: '点击任何技能上的"+ 添加到此代理" — 它将安装并出现在上面的列表中，拖动角落调整大小',

  search: '搜索',
  hideHubBrowser: '隐藏技能中心浏览器',
  browseFullHub: '浏览完整技能中心 ▾',
  installingFailed: name => `安装“${name}”失败`,

  pluginName: '智能体',
  pluginDescription:
    'Bot 模式为每个代理提供一个固定聊天，并包含头像、定时任务、群聊和 Bot 间通信，此功能随应用提供，可在不需要时禁用'
}

export const BOTS_LOCALES: PluginLocaleBundles = { en, zh }

/**
 * Reactive i18n hook for BOTS components.
 * Returns typed message accessors instead of raw t(key).
 */
export function useBots() {
  const t = usePluginI18n('hermes-bots')

  return {
    // Common actions
    cancel: t('cancel'),
    save: t('save'),
    create: t('create'),
    delete: t('delete'),
    back: t('back'),
    close: t('close'),
    retry: t('retry'),
    send: t('send'),
    retryLabel: t('retryLabel'),
    signIn: t('signIn'),
    setUpAction: t('setUpAction'),
    authorizing: t('authorizing'),

    // Bot roster
    bots: t('bots'),
    noBots: t('noBots'),
    noBotsDesc: t('noBotsDesc'),
    searchBots: t('searchBots'),
    noBotsMatch: (query: string) => t('noBotsMatch', query),
    newAgent: t('newAgent'),
    newGroupChat: t('newGroupChat'),
    activityToastsOn: t('activityToastsOn'),
    activityToastsOff: t('activityToastsOff'),
    botChatsHidden: t('botChatsHidden'),
    botChatsShown: t('botChatsShown'),
    hideHiddenBotsAgain: t('hideHiddenBotsAgain'),
    showHiddenBotsCount: (count: number) => t('showHiddenBotsCount', count),
    hideHiddenBots: t('hideHiddenBots'),
    showHiddenBots: t('showHiddenBots'),
    hiddenBotUnread: t('hiddenBotUnread'),
    allBotsHidden: t('allBotsHidden'),
    retryNow: t('retryNow'),
    newMenu: t('newMenu'),
    newAgentOrGroup: t('newAgentOrGroup'),
    rosterRefreshFailed: t('rosterRefreshFailed'),
    waitingForGateway: t('waitingForGateway'),
    rosterUnavailable: (message: string) => t('rosterUnavailable', message),
    gatewayError: t('gatewayError'),
    newMessageFor: (name: string) => t('newMessageFor', name),
    newActivityFor: (name: string) => t('newActivityFor', name),
    openChatToSee: t('openChatToSee'),
    thisDevice: t('thisDevice'),
    hermesGateway: t('hermesGateway'),

    // Bot actions
    editProfile: t('editProfile'),
    duplicate: t('duplicate'),
    newChatWithAgent: t('newChatWithAgent'),
    pin: t('pin'),
    unpin: t('unpin'),
    pinnedTitle: t('pinnedTitle'),
    sessions: t('sessions'),
    moveToGroup: t('moveToGroup'),
    group: (name: string) => t('group', name),
    manageGroups: t('manageGroups'),
    groups: (names: string) => t('groups', names),
    unread: t('unread'),
    activeRecently: t('activeRecently'),
    openAgentChat: (name: string) => t('openAgentChat', name),
    noConversations: t('noConversations'),
    updateForRemoteAgents: t('updateForRemoteAgents'),
    remoteSourceLabel: t('remoteSourceLabel'),
    livesOn: (source: string) => t('livesOn', source),
    lastMessageFrom: (name: string) => t('lastMessageFrom', name),
    hiddenFromRoster: t('hiddenFromRoster'),
    hideBot: t('hideBot'),
    unhideBot: t('unhideBot'),
    botHidden: (name: string) => t('botHidden', name),
    botUnhidden: (name: string) => t('botUnhidden', name),

    // Bot chat
    botChat: t('botChat'),
    activeNow: t('activeNow'),
    needsYou: t('needsYou'),
    openChat: t('openChat'),
    openContinuousChatDescription: t('openContinuousChatDescription'),
    chatNeverResets: t('chatNeverResets'),
    chatNeverResetsDesc: t('chatNeverResetsDesc'),

    // Profile editing
    editProfileTitle: t('editProfileTitle'),
    name: t('name'),
    title: t('title'),
    description: t('description'),
    whatHelp: t('whatHelp'),
    advanced: t('advanced'),
    advancedConfig: t('advancedConfig'),
    saving: t('saving'),
    appearanceAndRole: (displayName: string, profile: string) => t('appearanceAndRole', displayName, profile),

    // Avatar
    bot: t('bot'),
    generate: t('generate'),
    upload: t('upload'),
    pet: t('pet'),
    removeImage: t('removeImage'),
    describeAvatar: t('describeAvatar'),
    avatarAuto: t('avatarAuto'),
    avatarAutoTitle: t('avatarAutoTitle'),
    avatarRandomize: t('avatarRandomize'),
    avatarUnlockTitle: t('avatarUnlockTitle'),
    avatarLockTitle: t('avatarLockTitle'),
    avatarUnlock: t('avatarUnlock'),
    avatarLockFace: t('avatarLockFace'),
    avatarLockedHint: t('avatarLockedHint'),
    avatarFollowsNameHint: t('avatarFollowsNameHint'),
    avatarClassicShapes: t('avatarClassicShapes'),
    avatarBlobTitle: t('avatarBlobTitle'),
    generating: t('generating'),
    leaveBlankGenerate: t('leaveBlankGenerate'),
    choosePet: t('choosePet'),
    removePet: t('removePet'),
    noPetsMatch: t('noPetsMatch'),
    noPets: t('noPets'),
    chooseImage: t('chooseImage'),
    searchPets: (count: number) => t('searchPets', count),
    inheritLaunchProfile: t('inheritLaunchProfile'),
    enterManually: t('enterManually'),
    backToDropdowns: t('backToDropdowns'),
    gatewayDefault: t('gatewayDefault'),
    fullConfigNeedsNewGateway: t('fullConfigNeedsNewGateway'),
    capabilitiesImmediate: t('capabilitiesImmediate'),
    soulConfig: t('soulConfig'),
    skillsEnabled: (enabled: number, total: number) => t('skillsEnabled', enabled, total),
    toolsetsEnabled: (enabled: number, total: number) => t('toolsetsEnabled', enabled, total),
    mcpServers: t('mcpServers'),
    catalog: t('catalog'),
    catalogInstalled: t('catalogInstalled'),
    modelNameExample: t('modelNameExample'),

    // New agent dialog
    newAgentTitle: t('newAgentTitle'),
    newAgentDesc: t('newAgentDesc'),
    namePlaceholder: t('namePlaceholder'),
    titlePlaceholder: t('titlePlaceholder'),
    descPlaceholder: t('descPlaceholder'),
    general: t('general'),
    capabilities: t('capabilities'),
    skills: t('skills'),
    toolsets: t('toolsets'),
    tools: t('tools'),
    mcp: t('mcp'),
    cloneFromProfile: t('cloneFromProfile'),
    cloneFromProfileOn: (target: string) => t('cloneFromProfileOn', target),
    createOn: t('createOn'),
    currentConnection: (name: string) => t('currentConnection', name),
    remoteAgentLocationHint: (target: string) => t('remoteAgentLocationHint', target),
    freshProfile: t('freshProfile'),
    createEmpty: t('createEmpty'),
    filterSkills: t('filterSkills'),
    noMcpServers: t('noMcpServers'),
    creating: t('creating'),
    createAgent: t('createAgent'),
    agentCreated: (name: string) => t('agentCreated', name),
    agentCreatedOn: (name: string, target: string) => t('agentCreatedOn', name, target),
    couldNotCleanDraft: (name: string) => t('couldNotCleanDraft', name),
    catalogFrom: (source: string) => t('catalogFrom', source),
    defaultToolsetBehavior: t('defaultToolsetBehavior'),
    agentExists: (name: string) => t('agentExists', name),
    agentExistsOn: (name: string, target: string) => t('agentExistsOn', name, target),
    inheritedFromLaunchProfile: t('inheritedFromLaunchProfile'),
    soulOptional: t('soulOptional'),
    soulPlaceholder: t('soulPlaceholder'),
    shareKeys: t('shareKeys'),
    shareKeysDesc: t('shareKeysDesc'),
    createEmptyLabel: t('createEmptyLabel'),
    nameTakenForCapabilities: t('nameTakenForCapabilities'),
    nameFirstForCapabilities: t('nameFirstForCapabilities'),
    capabilityCatalogNeedsGateway: t('capabilityCatalogNeedsGateway'),
    configuredServersDesc: t('configuredServersDesc'),

    // Cronjobs
    cronjobs: t('cronjobs'),
    cronjobsUnavailableUntilRoster: t('cronjobsUnavailableUntilRoster'),
    newCronjob: t('newCronjob'),
    cronjobName: t('cronjobName'),
    instruction: t('instruction'),
    instructionPlaceholder: t('instructionPlaceholder'),
    whenToRun: t('whenToRun'),
    sendResultsTo: t('sendResultsTo'),
    runHistoryOnly: t('runHistoryOnly'),
    botChatResponds: (name: string) => t('botChatResponds', name),
    stopAfter: t('stopAfter'),
    runs: t('runs'),
    scheduling: t('scheduling'),
    createCronjob: t('createCronjob'),
    createCronjobForBot: t('createCronjobForBot'),
    routineFilterHint: t('routineFilterHint'),
    couldNotLoad: t('couldNotLoad'),
    cronjobDetails: t('cronjobDetails'),
    routineDetailDescription: t('routineDetailDescription'),
    active: t('active'),
    status: t('status'),
    schedule: t('schedule'),
    scheduleRaw: t('scheduleRaw'),
    repeat: t('repeat'),
    nextRunLabel: t('nextRunLabel'),
    lastRun: t('lastRun'),
    lastResult: t('lastResult'),
    deliversTo: t('deliversTo'),
    workingDirectory: t('workingDirectory'),
    cronjobsDesc: t('cronjobsDesc'),
    recurringTaskDesc: (name: string) => t('recurringTaskDesc', name),
    continuity: t('continuity'),
    deleteCronjob: t('deleteCronjob'),
    legacyCronjobPaused: t('legacyCronjobPaused'),
    cronjobNameNul: t('cronjobNameNul'),
    cronjobInstructionNul: t('cronjobInstructionNul'),
    paused: t('paused'),
    nextRun: (time: string) => t('nextRun', time),
    onceShort: (amount: string, unit: string) => t('onceShort', amount, unit),
    everyDays: (count: number) => t('everyDays', count),
    everyHours: (count: number) => t('everyHours', count),
    everyMinutes: (count: number) => t('everyMinutes', count),

    // Schedule options
    once: t('once'),
    hourly: t('hourly'),
    daily: t('daily'),
    weekdays: t('weekdays'),
    weekly: t('weekly'),
    monthly: t('monthly'),
    interval: t('interval'),
    advancedSchedule: t('advancedSchedule'),
    minutesFromNow: t('minutesFromNow'),
    hoursFromNow: t('hoursFromNow'),
    daysFromNow: t('daysFromNow'),
    minutes: t('minutes'),
    hours: t('hours'),
    days: t('days'),
    rawSchedule: t('rawSchedule'),
    runsOnce: (amount: string, unit: string) => t('runsOnce', amount, unit),
    runsHourly: (cap: string) => t('runsHourly', cap),
    runsDaily: (time: string) => t('runsDaily', time),
    runsWeekdays: (time: string) => t('runsWeekdays', time),
    runsWeekly: (day: string, time: string) => t('runsWeekly', day, time),
    runsMonthly: (day: string, time: string) => t('runsMonthly', day, time),
    runsInterval: (amount: string, unit: string) => t('runsInterval', amount, unit),
    totalRuns: (count: string) => t('totalRuns', count),

    // Weekdays
    monday: t('monday'),
    tuesday: t('tuesday'),
    wednesday: t('wednesday'),
    thursday: t('thursday'),
    friday: t('friday'),
    saturday: t('saturday'),
    sunday: t('sunday'),

    // Sessions
    filterSessions: t('filterSessions'),
    couldNotLoadSessions: t('couldNotLoadSessions'),
    noSessionsMatch: t('noSessionsMatch'),
    noSessions: t('noSessions'),
    untitledSession: t('untitledSession'),
    noMessages: t('noMessages'),
    profileSessions: (name: string) => t('profileSessions', name),
    showingRecentSessions: (count: number) => t('showingRecentSessions', count),
    noMatchingRecentSessions: (count: number) => t('noMatchingRecentSessions', count),
    desktopCannotOpenSessions: t('desktopCannotOpenSessions'),

    // Group chat
    newGroupChatTitle: t('newGroupChatTitle'),
    searchBotsToAdd: t('searchBotsToAdd'),
    removeFromSelection: t('removeFromSelection'),
    groupName: t('groupName'),
    sayToGroup: t('sayToGroup'),
    roomWorking: t('roomWorking'),
    pickBotsForRoom: (max: number) => t('pickBotsForRoom', max),
    noBotsYetCreateFirst: t('noBotsYetCreateFirst'),
    pickAtLeastTwo: t('pickAtLeastTwo'),
    createGroup: (count?: number) => t('createGroup', count),
    groupChatTitle: (name: string) => t('groupChatTitle', name),
    botsCount: (count: number) => t('botsCount', count),
    you: t('you'),
    messageGroup: (name: string) => t('messageGroup', name),
    messageGroupPlaceholder: (name: string) => t('messageGroupPlaceholder', name),
    disbandGroupChat: (name: string) => t('disbandGroupChat', name),
    disbandGroupChatTitle: t('disbandGroupChatTitle'),
    disbandGroupChatDesc: (name: string, count: number) => t('disbandGroupChatDesc', name, count),
    disband: t('disband'),
    disbanding: t('disbanding'),
    disbanded: t('disbanded'),
    disbandedGroup: (name: string) => t('disbandedGroup', name),
    hideFullHandle: t('hideFullHandle'),
    showFullHandle: t('showFullHandle'),

    // Group management
    moveToGroupTitle: t('moveToGroupTitle'),
    moveToGroupDesc: t('moveToGroupDesc'),
    manageGroupsTitle: t('manageGroupsTitle'),
    manageGroupsDesc: t('manageGroupsDesc'),
    createAndJoin: t('createAndJoin'),
    removeFromAllGroups: t('removeFromAllGroups'),
    addedToGroup: (bot: string, group: string) => t('addedToGroup', bot, group),
    removedFromNamedGroup: (bot: string, group: string) => t('removedFromNamedGroup', bot, group),
    newGroupPlaceholder: t('newGroupPlaceholder'),
    groupNameLabel: t('groupNameLabel'),
    newGroup: t('newGroup'),
    removeFromGroup: (name: string) => t('removeFromGroup', name),
    movedToGroup: (bot: string, group: string) => t('movedToGroup', bot, group),
    removedFromGroup: (bot: string) => t('removedFromGroup', bot),
    groupNeedsYouTitle: t('groupNeedsYouTitle'),
    openGroupChat: (name: string) => t('openGroupChat', name),
    inGroup: (handle: string, group: string) => t('inGroup', handle, group),
    inGroups: (handle: string, groups: string[]) => t('inGroups', handle, groups),

    // Delete confirmation
    deleteBotTitle: t('deleteBotTitle'),
    deleteBotDesc: (name: string, path: string) => t('deleteBotDesc', name, path),
    deleting: t('deleting'),
    deleted: t('deleted'),
    deletedProfile: (name: string) => t('deletedProfile', name),

    // Status messages
    needsSetup: (requires: string) => t('needsSetup', requires),
    setUp: t('setUp'),
    saveAndTest: t('saveAndTest'),
    working: t('working'),
    setupFailed: (message?: string) => t('setupFailed', message),

    // Skills Hub
    skillsHub: t('skillsHub'),
    hermesSkillsHub: t('hermesSkillsHub'),
    searchHub: t('searchHub'),
    searching: t('searching'),
    searchingShort: t('searchingShort'),
    noHubSkills: t('noHubSkills'),
    added: t('added'),

    // Empty states
    noAgentsYet: t('noAgentsYet'),
    createFirstTeammate: t('createFirstTeammate'),

    // Error messages - MCP Setup
    couldNotAddServer: t('couldNotAddServer'),
    noTargetProfile: t('noTargetProfile'),
    failedToSet: (key: string) => t('failedToSet', key),
    serverTestFailed: t('serverTestFailed'),
    couldNotStartOAuth: t('couldNotStartOAuth'),
    completeSignIn: t('completeSignIn'),
    oauthFailed: t('oauthFailed'),
    configured: (name: string) => t('configured', name),
    authenticated: (name: string) => t('authenticated', name),

    // Error messages - Avatar
    avatarGenerationFailed: t('avatarGenerationFailed'),
    attachment: t('attachment'),
    attachmentTooLarge: (name: string) => t('attachmentTooLarge', name),
    generationFailed: t('generationFailed'),
    groupPictureGenerationFailed: t('groupPictureGenerationFailed'),
    couldNotLoadPet: t('couldNotLoadPet'),
    imageTooLarge: t('imageTooLarge'),

    // Error messages - Bot operations
    duplicateFailed: t('duplicateFailed'),
    groupAlreadyExists: (name: string) => t('groupAlreadyExists', name),
    noFreeDuplicateName: t('noFreeDuplicateName'),
    advancedConfigFailed: t('advancedConfigFailed'),
    couldNotCreateProfile: t('couldNotCreateProfile'),
    couldNotCreateAgent: t('couldNotCreateAgent'),
    couldNotDeleteProfile: (name: string) => t('couldNotDeleteProfile', name),
    couldNotReach: (source: string) => t('couldNotReach', source),
    couldNotOpenAgentChat: (name: string) => t('couldNotOpenAgentChat', name),
    remoteMessaged: (name: string, source: string) => t('remoteMessaged', name, source),
    remoteNoReply: (name: string, source: string) => t('remoteNoReply', name, source),
    remoteMentionHint: (name: string) => t('remoteMentionHint', name),

    // Error messages - Sessions
    couldNotOpenSession: t('couldNotOpenSession'),
    couldNotLoadSessionsError: t('couldNotLoadSessionsError'),

    // Error messages - Cronjobs
    cronjobUpdateFailed: t('cronjobUpdateFailed'),
    couldNotRefreshCronjobs: t('couldNotRefreshCronjobs'),

    // Success messages
    created: (name: string, original?: string) => t('created', name, original),
    updated: (name: string) => t('updated', name),
    pinned: (name: string, isPinned: boolean) => t('pinned', name, isPinned),
    duplicating: (name: string) => t('duplicating', name),
    skillInstalled: (name: string) => t('skillInstalled', name),
    draftDiscarded: (name: string) => t('draftDiscarded', name),
    cronjobScheduled: (name: string) => t('cronjobScheduled', name),
    groupCreated: (name: string, count: number) => t('groupCreated', name, count),

    // Partial success/warnings
    savedLocallyRemoteFailed: t('savedLocallyRemoteFailed'),
    savedLocallyDescFailed: t('savedLocallyDescFailed'),
    someSectionsFailed: (sections: string) => t('someSectionsFailed', sections),

    // Instructions
    openBotsPane: t('openBotsPane'),
    scrollForMore: (shown: number, total: number) => t('scrollForMore', shown, total),

    // MCP Setup UI
    setUpCheckmark: t('setUpCheckmark'),
    noImageModel: t('noImageModel'),
    restartGateway: t('restartGateway'),

    // Provider & Model
    provider: t('provider'),
    model: t('model'),
    providerCustom: t('providerCustom'),
    modelCustom: t('modelCustom'),

    // Advanced
    dayOfMonth: t('dayOfMonth'),
    runsAtTopOfHour: (cap: string) => t('runsAtTopOfHour', cap),

    // Misc
    conversation: t('conversation'),
    remoteSource: t('remoteSource'),
    untitledCronjob: t('untitledCronjob'),
    installing: (name: string) => t('installing', name),
    installAndAdd: (name: string) => t('installAndAdd', name),
    hitAddToAgent: t('hitAddToAgent'),
    search: t('search'),
    hideHubBrowser: t('hideHubBrowser'),
    browseFullHub: t('browseFullHub'),
    installingFailed: (name: string) => t('installingFailed', name),

    pluginName: t('pluginName'),
    pluginDescription: t('pluginDescription')
  }
}
