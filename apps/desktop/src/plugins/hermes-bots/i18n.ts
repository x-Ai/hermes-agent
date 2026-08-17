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
  retryNow: string

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

  // Bot chat
  botChat: string
  activeNow: string
  needsYou: string
  openChat: string
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

  // Avatar
  bot: string
  generate: string
  upload: string
  pet: string
  removeImage: string
  describeAvatar: string
  generating: string
  leaveBlankGenerate: string
  choosePet: string
  removePet: string
  noPetsMatch: string
  noPets: string
  chooseImage: string

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
  freshProfile: string
  createEmpty: string
  filterSkills: string
  noMcpServers: string
  creating: string
  createAgent: string

  // Cronjobs
  cronjobs: string
  newCronjob: string
  cronjobName: string
  instruction: string
  instructionPlaceholder: string
  whenToRun: string
  stopAfter: string
  runs: string
  scheduling: string
  createCronjob: string
  couldNotLoad: string
  cronjobsDesc: string

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

  // Group chat
  newGroupChatTitle: string
  searchBotsToAdd: string
  removeFromSelection: string
  groupName: string
  sayToGroup: string
  roomWorking: string

  // Group management
  moveToGroupTitle: string
  moveToGroupDesc: string
  newGroupPlaceholder: string
  groupNameLabel: string

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
  generationFailed: string
  couldNotLoadPet: string
  imageTooLarge: string

  // Error messages - Bot operations
  duplicateFailed: string
  advancedConfigFailed: string
  couldNotCreateProfile: string
  couldNotCreateAgent: string
  couldNotDeleteProfile: (name: string) => string
  couldNotReach: (source: string) => string

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
}

// 占位符：暂时使用英文作为默认翻译，后续会逐步添加完整的翻译
const en: BotsMessages = {
  cancel: 'Cancel',
  save: 'Save',
  create: 'Create',
  delete: 'Delete',
  back: 'Back',
  close: 'Close',
  retry: 'retry',
  send: 'Send',

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
  retryNow: 'Retry now',

  editProfile: 'Edit Profile',
  duplicate: 'Duplicate',
  newChatWithAgent: 'New chat with this agent',
  pin: 'Pin to top',
  unpin: 'Unpin',
  pinnedTitle: 'Pinned',
  sessions: 'Sessions',
  moveToGroup: 'Move to group…',
  group: name => `Group: ${name}…`,

  botChat: 'Bot Chat',
  activeNow: 'Active now',
  needsYou: 'needs you',
  openChat: 'Open chat',
  chatNeverResets: 'This chat never resets',
  chatNeverResetsDesc: 'Bot chats are one continuous conversation — compacting instead. For a throwaway session with this agent, use Sessions mode.',

  editProfileTitle: 'Edit Profile',
  name: 'Name',
  title: 'Title',
  description: 'Description',
  whatHelp: 'What should this agent help with?',
  advanced: 'Advanced',
  advancedConfig: 'Advanced — model, skills, toolsets, SOUL.md',
  saving: 'Saving…',

  bot: 'Bot',
  generate: 'Generate',
  upload: 'Upload',
  pet: 'Pet',
  removeImage: 'Remove image — use shape',
  describeAvatar: 'Describe your avatar…',
  generating: 'Generating…',
  leaveBlankGenerate: "Leave blank to generate from the agent's name and description.",
  choosePet: "Pick a pet as this agent's profile picture.",
  removePet: 'Remove — back to shape avatar',
  noPetsMatch: 'No pets match.',
  noPets: 'No pets in the petdex gallery. Run `hermes pets` to explore.',
  chooseImage: 'Choose an image…',

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
  freshProfile: 'Fresh profile (bundled skills)',
  createEmpty: '"Create empty" is checked — no bundled skills will be installed.',
  filterSkills: 'Filter skills…',
  noMcpServers: 'No MCP servers configured or in the catalog.',
  creating: 'Creating…',
  createAgent: 'Create Agent',

  cronjobs: 'Cronjobs',
  newCronjob: 'New Cronjob',
  cronjobName: 'Name this cronjob',
  instruction: 'Instruction',
  instructionPlaceholder: 'What should this cronjob do each time it runs?',
  whenToRun: 'When to run',
  stopAfter: 'Stop after',
  runs: 'runs (blank = forever)',
  scheduling: 'Scheduling…',
  createCronjob: 'Create Cronjob',
  couldNotLoad: 'Could not load cronjobs. The list may still be there.',
  cronjobsDesc: 'Cronjobs are recurring tasks this agent runs on a schedule.',

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

  newGroupChatTitle: 'New Group Chat',
  searchBotsToAdd: 'Search bots to add…',
  removeFromSelection: 'Remove from selection',
  groupName: 'Group name',
  sayToGroup: 'Say something — every bot in this group hears the room.',
  roomWorking: 'The room is working…',

  moveToGroupTitle: 'Move to group',
  moveToGroupDesc: 'Groups render as labeled sections in the BOTS roster and sync to every machine.',
  newGroupPlaceholder: 'Group name (e.g. Research)',
  groupNameLabel: 'Group name',

  deleteBotTitle: 'Delete bot and profile?',
  deleteBotDesc: (name, path) => `This will permanently delete the bot ${name} and its associated Hermes profile at ${path}. This cannot be undone.`,
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
  generationFailed: 'generation failed',
  couldNotLoadPet: 'Could not load that pet — try another.',
  imageTooLarge: 'Image too large (max 15MB).',

  // Error messages - Bot operations
  duplicateFailed: 'Duplicate failed',
  advancedConfigFailed: 'Advanced configuration failed',
  couldNotCreateProfile: 'Could not create the profile yet',
  couldNotCreateAgent: 'Could not create the agent.',
  couldNotDeleteProfile: name => `Could not delete profile ${name}.`,
  couldNotReach: source => `Could not reach ${source}`,

  // Error messages - Sessions
  couldNotOpenSession: 'Could not open session',
  couldNotLoadSessionsError: 'Could not load sessions for this profile.',

  // Error messages - Cronjobs
  cronjobUpdateFailed: 'Cronjob update failed',
  couldNotRefreshCronjobs: 'Could not refresh cronjobs. Showing the last list we had.',

  // Success messages
  created: (name, original) => original ? `Created ${name} — full copy of ${original}` : `Created ${name}`,
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
  noImageModel: 'No image model available. If you just enabled one (or updated Hermes), restart the gateway: Ctrl+K → "Restart gateway".',
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
  hitAddToAgent: 'Hit "+ Add to this Agent" on any skill — it installs and appears in the list above. Drag the corner to resize.'
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

  bots: 'BOTS',
  noBots: '尚无代理',
  noBotsDesc: '创建你的第一个队友。',
  searchBots: '搜索 Bot…',
  noBotsMatch: query => `没有匹配"${query}"的 Bot`,
  newAgent: '新建代理',
  newGroupChat: '新建群聊',
  activityToastsOn: '活动通知已开启 — 点击静音',
  activityToastsOff: '活动通知已关闭 — 点击启用',
  botChatsHidden: 'Bot 聊天已从会话中隐藏 — 点击显示',
  botChatsShown: 'Bot 聊天已在会话中显示 — 点击隐藏',
  retryNow: '立即重试',

  editProfile: '编辑资料',
  duplicate: '复制',
  newChatWithAgent: '与此代理新建聊天',
  pin: '置顶',
  unpin: '取消置顶',
  pinnedTitle: '已置顶',
  sessions: '会话',
  moveToGroup: '移至分组…',
  group: name => `分组：${name}…`,

  botChat: 'Bot 聊天',
  activeNow: '当前活跃',
  needsYou: '需要你',
  openChat: '打开聊天',
  chatNeverResets: '此聊天永不重置',
  chatNeverResetsDesc: 'Bot 聊天是一次连续对话——采用压缩而非重置。如需与此代理进行一次性会话，请使用会话模式。',

  editProfileTitle: '编辑资料',
  name: '名称',
  title: '标题',
  description: '描述',
  whatHelp: '此代理应该帮助什么？',
  advanced: '高级',
  advancedConfig: '高级 — 模型、技能、工具集、SOUL.md',
  saving: '保存中…',

  bot: 'Bot',
  generate: '生成',
  upload: '上传',
  pet: '宠物',
  removeImage: '移除图片 — 使用形状',
  describeAvatar: '描述你的头像…',
  generating: '生成中…',
  leaveBlankGenerate: '留空可根据代理的名称和描述自动生成。',
  choosePet: '选择一个宠物作为此代理的头像。',
  removePet: '移除 — 恢复形状头像',
  noPetsMatch: '没有匹配的宠物。',
  noPets: '宠物图鉴中没有宠物。运行 `hermes pets` 来探索。',
  chooseImage: '选择图片…',

  newAgentTitle: '新建代理',
  newAgentDesc: '一个拥有自己记忆、技能和聊天的具名队友。它可以向你的其他代理发送消息。',
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
  freshProfile: '全新资料（内置技能）',
  createEmpty: '已勾选"创建空白" — 不会安装内置技能。',
  filterSkills: '筛选技能…',
  noMcpServers: '未配置或目录中没有 MCP 服务器。',
  creating: '创建中…',
  createAgent: '创建代理',

  cronjobs: '定时任务',
  newCronjob: '新建定时任务',
  cronjobName: '为此定时任务命名',
  instruction: '指令',
  instructionPlaceholder: '此定时任务每次运行时应该做什么？',
  whenToRun: '运行时间',
  stopAfter: '停止条件',
  runs: '次运行（留空=永久）',
  scheduling: '调度中…',
  createCronjob: '创建定时任务',
  couldNotLoad: '无法加载定时任务。列表可能仍然存在。',
  cronjobsDesc: '定时任务是此代理按计划运行的重复性任务。',

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

  monday: '星期一',
  tuesday: '星期二',
  wednesday: '星期三',
  thursday: '星期四',
  friday: '星期五',
  saturday: '星期六',
  sunday: '星期日',

  filterSessions: '筛选会话…',
  couldNotLoadSessions: '无法加载此资料的会话。',
  noSessionsMatch: '没有匹配该筛选的会话。',
  noSessions: '尚无存储的会话。',
  untitledSession: '无标题会话',
  noMessages: '尚无消息',

  newGroupChatTitle: '新建群聊',
  searchBotsToAdd: '搜索要添加的 Bot…',
  removeFromSelection: '从选择中移除',
  groupName: '群组名称',
  sayToGroup: '说点什么 — 此群组中的每个 Bot 都能听到。',
  roomWorking: '房间正在工作…',

  moveToGroupTitle: '移至分组',
  moveToGroupDesc: '分组会在 BOTS 名单中显示为标签区块，并同步到每台设备。',
  newGroupPlaceholder: '群组名称（例如：研究）',
  groupNameLabel: '群组名称',

  deleteBotTitle: '删除 Bot 和资料？',
  deleteBotDesc: (name, path) => `这将永久删除 Bot ${name} 及其在 ${path} 的关联 Hermes 资料。此操作无法撤销。`,
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
  noHubSkills: '没有匹配的技能中心技能。',
  added: '✓ 已添加',

  noAgentsYet: '尚无代理',
  createFirstTeammate: '创建你的第一个队友。',

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
  generationFailed: '生成失败',
  couldNotLoadPet: '无法加载该宠物 — 请尝试其他。',
  imageTooLarge: '图片过大（最大 15MB）。',

  // Error messages - Bot operations
  duplicateFailed: '复制失败',
  advancedConfigFailed: '高级配置失败',
  couldNotCreateProfile: '尚无法创建资料',
  couldNotCreateAgent: '无法创建代理。',
  couldNotDeleteProfile: name => `无法删除资料 ${name}。`,
  couldNotReach: source => `无法访问 ${source}`,

  // Error messages - Sessions
  couldNotOpenSession: '无法打开会话',
  couldNotLoadSessionsError: '无法加载此资料的会话。',

  // Error messages - Cronjobs
  cronjobUpdateFailed: '定时任务更新失败',
  couldNotRefreshCronjobs: '无法刷新定时任务。显示上次的列表。',

  // Success messages
  created: (name, original) => original ? `已创建 ${name} — ${original} 的完整副本` : `已创建 ${name}`,
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
  openBotsPane: '打开 Bots 面板并点击"新建代理"。',
  scrollForMore: (shown, total) => `滚动查看更多（${shown} / ${total}）`,

  // MCP Setup UI
  setUpCheckmark: '已设置 ✓',
  noImageModel: '无可用的图像模型。如果你刚刚启用了一个（或更新了 Hermes），请重启网关：Ctrl+K → "重启网关"。',
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
  hitAddToAgent: '点击任何技能上的"+ 添加到此代理" — 它将安装并出现在上面的列表中。拖动角落调整大小。'
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
    retryNow: t('retryNow'),

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

    // Bot chat
    botChat: t('botChat'),
    activeNow: t('activeNow'),
    needsYou: t('needsYou'),
    openChat: t('openChat'),
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

    // Avatar
    bot: t('bot'),
    generate: t('generate'),
    upload: t('upload'),
    pet: t('pet'),
    removeImage: t('removeImage'),
    describeAvatar: t('describeAvatar'),
    generating: t('generating'),
    leaveBlankGenerate: t('leaveBlankGenerate'),
    choosePet: t('choosePet'),
    removePet: t('removePet'),
    noPetsMatch: t('noPetsMatch'),
    noPets: t('noPets'),
    chooseImage: t('chooseImage'),

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
    freshProfile: t('freshProfile'),
    createEmpty: t('createEmpty'),
    filterSkills: t('filterSkills'),
    noMcpServers: t('noMcpServers'),
    creating: t('creating'),
    createAgent: t('createAgent'),

    // Cronjobs
    cronjobs: t('cronjobs'),
    newCronjob: t('newCronjob'),
    cronjobName: t('cronjobName'),
    instruction: t('instruction'),
    instructionPlaceholder: t('instructionPlaceholder'),
    whenToRun: t('whenToRun'),
    stopAfter: t('stopAfter'),
    runs: t('runs'),
    scheduling: t('scheduling'),
    createCronjob: t('createCronjob'),
    couldNotLoad: t('couldNotLoad'),
    cronjobsDesc: t('cronjobsDesc'),

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

    // Group chat
    newGroupChatTitle: t('newGroupChatTitle'),
    searchBotsToAdd: t('searchBotsToAdd'),
    removeFromSelection: t('removeFromSelection'),
    groupName: t('groupName'),
    sayToGroup: t('sayToGroup'),
    roomWorking: t('roomWorking'),

    // Group management
    moveToGroupTitle: t('moveToGroupTitle'),
    moveToGroupDesc: t('moveToGroupDesc'),
    newGroupPlaceholder: t('newGroupPlaceholder'),
    groupNameLabel: t('groupNameLabel'),

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
    generationFailed: t('generationFailed'),
    couldNotLoadPet: t('couldNotLoadPet'),
    imageTooLarge: t('imageTooLarge'),

    // Error messages - Bot operations
    duplicateFailed: t('duplicateFailed'),
    advancedConfigFailed: t('advancedConfigFailed'),
    couldNotCreateProfile: t('couldNotCreateProfile'),
    couldNotCreateAgent: t('couldNotCreateAgent'),
    couldNotDeleteProfile: (name: string) => t('couldNotDeleteProfile', name),
    couldNotReach: (source: string) => t('couldNotReach', source),

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
    hitAddToAgent: t('hitAddToAgent')
  }
}
