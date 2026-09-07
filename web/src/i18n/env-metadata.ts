import type { Locale } from './types'

const PROVIDER_NAMES: Array<[string, string]> = [
  ['ANTHROPIC', 'Anthropic'],
  ['OPENAI', 'OpenAI'],
  ['OPENROUTER', 'OpenRouter'],
  ['GOOGLE', 'Google'],
  ['GEMINI', 'Gemini'],
  ['DEEPSEEK', 'DeepSeek'],
  ['DASHSCOPE', '阿里云 DashScope'],
  ['HERMES_QWEN', '通义千问'],
  ['KIMI', 'Kimi'],
  ['MINIMAX', 'MiniMax'],
  ['ZAI', 'Z.AI'],
  ['GLM', 'GLM'],
  ['HF', 'Hugging Face'],
  ['NOUS', 'Nous Portal'],
  ['TELEGRAM', 'Telegram'],
  ['DISCORD', 'Discord'],
  ['SLACK', 'Slack'],
  ['WHATSAPP', 'WhatsApp'],
  ['EMAIL', '邮件'],
  ['WEBHOOK', 'Webhook'],
  ['GATEWAY', '网关'],
  ['BROWSER', '浏览器'],
  ['TTS', '语音合成'],
  ['STT', '语音识别']
]

function subjectFor(key: string): string {
  const upper = key.toUpperCase()
  return PROVIDER_NAMES.find(([prefix]) => upper.startsWith(`${prefix}_`) || upper === prefix)?.[1] ?? '此服务'
}

/** Localize dashboard-only metadata while preserving the actual environment key and value. */
export function localizeEnvDescription(key: string, description: string, locale: Locale): string {
  if (locale !== 'zh') return description

  const upper = key.toUpperCase()
  const subject = subjectFor(upper)
  if (upper.endsWith('_API_KEY')) return `${subject} API 密钥`
  if (upper.endsWith('_BASE_URL')) return `${subject} API 基础 URL`
  if (upper.endsWith('_BOT_TOKEN')) return `${subject} 机器人令牌`
  if (upper.endsWith('_TOKEN')) return `${subject} 访问令牌`
  if (upper.endsWith('_SECRET')) return `${subject} 密钥`
  if (upper.endsWith('_PASSWORD')) return `${subject} 密码`
  if (upper.endsWith('_USER_ID')) return `${subject} 用户 ID`
  if (upper.endsWith('_CHANNEL_ID')) return `${subject} 频道 ID`
  if (upper.endsWith('_PORT')) return `${subject} 端口`
  if (upper.endsWith('_HOST')) return `${subject} 主机`
  if (upper.endsWith('_TIMEOUT')) return `${subject} 超时时间`
  if (upper.endsWith('_PATH')) return `${subject} 路径`
  if (upper.endsWith('_URL')) return `${subject} URL`
  if (upper.endsWith('_ENABLED')) return `是否启用${subject}`
  if (upper.includes('ALLOWLIST')) return `${subject}允许列表`
  if (upper.includes('MODEL')) return `${subject}模型`
  return description ? `${subject}配置` : '自定义环境变量'
}
