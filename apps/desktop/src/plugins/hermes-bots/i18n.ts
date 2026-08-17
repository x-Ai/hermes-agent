/**
 * Plugin-scoped i18n for hermes-bots — Bot Mode localization.
 *
 * Bundles shipped under the plugin id via ctx.i18n.register,
 * never touching core en.ts.
 */

import { type PluginLocaleBundles } from '@hermes/plugin-sdk'

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
  leaveBlankGenerate: 'Leave blank to generate from the agent's name and description.',
  choosePet: 'Pick a pet as this agent's profile picture.',
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
  createFirstTeammate: 'Create your first teammate.'
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
  createFirstTeammate: '创建你的第一个队友。'
}

export const BOTS_LOCALES: PluginLocaleBundles = { en, zh }
