import type { Locale } from './types'

const ZH_TERMS: Record<string, string> = {
  general: '通用',
  api: 'API',
  mcp: 'MCP',
  tts: '语音合成',
  stt: '语音识别',
  url: 'URL',
  urls: 'URL',
  id: 'ID',
  ids: 'ID',
  yaml: 'YAML',
  model: '模型',
  models: '模型',
  context: '上下文',
  length: '长度',
  fallback: '后备',
  providers: '提供商',
  provider: '提供商',
  toolsets: '工具集',
  tools: '工具',
  max: '最大',
  min: '最小',
  concurrent: '并发',
  sessions: '会话',
  session: '会话',
  live: '活跃',
  terminal: '终端',
  continue: '连续运行',
  file: '文件',
  read: '读取',
  chars: '字符数',
  timeout: '超时',
  discovery: '发现',
  single: '单次',
  query: '查询',
  prefill: '预填',
  messages: '消息',
  timezone: '时区',
  command: '命令',
  allowlist: '允许列表',
  hooks: '钩子',
  hook: '钩子',
  auto: '自动',
  accept: '接受',
  doctor: '诊断',
  updates: '更新',
  update: '更新',
  pre: '更新前',
  backup: '备份',
  keep: '保留数量',
  non: '非',
  interactive: '交互式',
  local: '本地',
  changes: '更改',
  switch: '切换',
  parked: '停放的',
  branch: '分支',
  strategy: '策略',
  refresh: '刷新',
  cua: 'CUA',
  driver: '驱动',
  paste: '粘贴',
  collapse: '折叠',
  threshold: '阈值',
  char: '字符',
  enabled: '启用',
  mode: '模式',
  backend: '后端',
  runtime: '运行时',
  docker: 'Docker',
  image: '镜像',
  network: '网络',
  memory: '记忆',
  compression: '压缩',
  browser: '浏览器',
  headed: '可视窗口',
  inactivity: '空闲',
  proxy: '代理',
  credential: '凭据',
  source: '来源',
  enforce: '强制',
  security: '安全',
  approvals: '审批',
  approval: '审批',
  dangerous: '危险',
  logging: '日志',
  logs: '日志',
  level: '级别',
  display: '显示',
  skin: '主题',
  resume: '恢复',
  busy: '忙碌时',
  input: '输入',
  agent: '代理',
  system: '系统',
  service: '服务',
  tier: '等级',
  delegation: '委派',
  reasoning: '推理',
  effort: '强度',
  auxiliary: '辅助任务',
  database: '数据库',
  desktop: '桌面端',
  gateway: '网关',
  kanban: '看板',
  loops: '循环',
  lsp: '语言服务器',
  curator: '技能策展器',
  moa: '多代理混合',
  bedrock: 'Amazon Bedrock',
  matrix: 'Matrix',
  mattermost: 'Mattermost',
  discord: 'Discord',
  voice: '语音',
  speech: '语音',
  text: '文本',
  to: '转',
  openai: 'OpenAI',
  elevenlabs: 'ElevenLabs',
  groq: 'Groq',
  dashboard: '管理面板',
  theme: '主题',
  plugins: '插件',
  callback: '回调',
  prompt: '提示词',
  caching: '缓存',
  size: '大小',
  limit: '限制',
  retry: '重试',
  retries: '重试',
  delay: '延迟',
  interval: '间隔',
  default: '默认',
  name: '名称',
  path: '路径',
  output: '输出',
  telemetry: '遥测',
  privacy: '隐私',
  redact: '隐藏敏感信息'
}

const ZH_FULL_LABELS: Record<string, string> = {
  model_context_length: '模型上下文长度',
  'agent.service_tier': '快速模式',
  'updates.non_interactive_local_changes': '非交互更新时的本地更改处理方式',
  'updates.auto_switch_parked_branch': '自动切换停放分支',
  'updates.parked_branch_strategy': '停放分支策略',
  'updates.refresh_cua_driver': '刷新 CUA 驱动',
  'display.resume_display': '恢复会话的历史显示方式',
  'display.busy_input_mode': '代理运行时的输入行为',
  'proxy.enabled': '启用出站凭据防火墙',
  'proxy.credential_source': '出站凭据来源',
  'proxy.enforce_on_docker': '在 Docker 中强制启用出站代理',
  'browser.headed': '以可视模式运行浏览器',
  'plugins.hook_callback_timeout': '插件钩子回调超时'
}

const ZH_DESCRIPTIONS: Record<string, string> = {
  model: '默认模型（例如 anthropic/claude-sonnet-4.6）',
  model_context_length: '上下文窗口覆盖值（0 表示根据模型元数据自动检测）',
  timezone: 'IANA 时区（例如 Asia/Shanghai）；留空时使用系统时区。',
  'terminal.backend': '终端执行后端',
  'terminal.vercel_runtime': 'Vercel Sandbox 运行时',
  'terminal.modal_mode': 'Modal 沙箱模式',
  'proxy.enabled':
    '仅用于 Docker 的出站凭据防火墙。需要先运行 hermes egress setup 和 hermes egress start；目前尚未接入 Modal、SSH 和 Daytona。',
  'proxy.credential_source': 'iron-proxy 启动时加载真实上游密钥的位置',
  'proxy.enforce_on_docker': '出站代理已启用但未配置或未运行时，拒绝启动 Docker 沙箱',
  'tts.provider': '语音合成提供商',
  'stt.provider': '语音识别提供商',
  'stt.local.model': '本地 faster-whisper 模型大小',
  'stt.groq.model': 'Groq Whisper 模型',
  'stt.openai.model': 'OpenAI 转录模型',
  'stt.elevenlabs.model_id': 'ElevenLabs Scribe 模型',
  'display.skin': 'CLI 视觉主题',
  'dashboard.theme': 'Web 管理面板视觉主题',
  'display.resume_display': '恢复会话时显示历史记录的方式',
  'display.busy_input_mode': '代理运行时的输入行为',
  'approvals.mode': '危险命令审批模式',
  'context.engine': '上下文管理引擎',
  'human_delay.mode': '模拟输入延迟模式',
  'logging.level': 'agent.log 的日志级别',
  'agent.service_tier': '快速模式：fast 表示始终启用；auto 表示每轮开始的若干秒启用；cold 表示仅第一轮启用。',
  'delegation.reasoning_effort': '委派给后台代理时使用的推理强度',
  'updates.non_interactive_local_changes':
    '聊天应用或网关更新 Hermes 时，如何处理未提交的本地源码更改。stash 会保留并在更新后重新应用；discard 会丢弃这些更改。终端更新不受此设置影响，始终会询问。',
  'updates.refresh_cua_driver':
    'Hermes 更新时刷新已安装的 cua-driver。对于无权写入 /Applications 的非管理员 macOS 账户，请关闭此项。',
  'browser.headed':
    '在可见窗口中运行本地浏览器，并在轮次之间保持窗口打开；空闲会话仍会在 browser.inactivity_timeout 后清理。',
  'plugins.hook_callback_timeout':
    '进程内 Python 插件钩子回调的最长执行时间（秒）。0 表示不限制，超过 600 的值会被限制为 600。'
}

const ZH_OPTIONS: Record<string, string> = {
  '': '无',
  none: '无',
  default: '默认',
  custom: '自定义',
  local: '本地',
  manual: '手动',
  smart: '智能',
  off: '关闭',
  auto: '自动',
  normal: '普通',
  fast: '快速',
  cold: '冷启动',
  minimal: '最小',
  low: '低',
  medium: '中',
  high: '高',
  xhigh: '极高',
  max: '最大',
  ultra: '超高',
  full: '完整',
  interrupt: '中断',
  queue: '排队',
  steer: '调整当前任务',
  typing: '按输入速度',
  fixed: '固定延迟',
  stash: '暂存并恢复',
  discard: '丢弃',
  sandbox: '沙箱',
  function: '函数',
  env: '环境变量',
  bitwarden: 'Bitwarden'
}

function humanizeEnglish(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase())
}

function translatePart(part: string): string {
  return ZH_TERMS[part.toLowerCase()] ?? part
}

export function localizeConfigLabel(schemaKey: string, locale: Locale): string {
  if (locale !== 'zh') {
    const raw = schemaKey.split('.').pop() ?? schemaKey
    return humanizeEnglish(raw)
  }

  const full = ZH_FULL_LABELS[schemaKey]
  if (full) return full

  const raw = schemaKey.split('.').pop() ?? schemaKey
  return raw.split('_').map(translatePart).join('')
}

export function localizeConfigSection(section: string, locale: Locale): string {
  if (locale !== 'zh') return humanizeEnglish(section)
  return section.split('_').map(translatePart).join('')
}

export function localizeConfigDescription(schemaKey: string, description: string, locale: Locale): string {
  if (locale !== 'zh') return description
  return (
    ZH_DESCRIPTIONS[schemaKey] ??
    schemaKey
      .split('.')
      .map(part => localizeConfigSection(part, locale))
      .join(' → ')
  )
}

export function localizeConfigOption(option: string, locale: Locale): string {
  if (locale !== 'zh') return option || '(none)'
  return ZH_OPTIONS[option.toLowerCase()] ?? option
}
