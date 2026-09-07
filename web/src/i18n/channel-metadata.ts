import type { Locale } from './types'
import { localizeConfigLabel } from './config-metadata'
import type { DashboardCopy } from './dashboard'
import type { MessagingPlatformTestResult } from '@/lib/api'

const ZH_PLATFORM_DESCRIPTIONS: Record<string, string> = {
  telegram: '通过 Telegram 私聊、群组和话题使用 Hermes',
  discord: '将 Hermes 连接到 Discord 私聊、频道和帖子',
  slack: '通过 Socket Mode 在 Slack 中使用 Hermes，可限定允许访问的 Slack 成员 ID',
  mattermost: '将 Hermes 连接到 Mattermost 频道和私聊',
  matrix: '在 Matrix 房间和私聊中使用 Hermes',
  whatsapp: '通过内置的 WhatsApp 桥接器和二维码身份验证使用 Hermes',
  signal: '通过 signal-cli REST 桥接器连接',
  bluebubbles: '通过 BlueBubbles 服务器在 iMessage 中使用 Hermes',
  homeassistant: '通过 Home Assistant 让 Hermes 控制智能家居',
  email: '通过 IMAP/SMTP 邮箱与 Hermes 对话',
  sms: '通过 Twilio 收发短信',
  dingtalk: '将 Hermes 连接到钉钉群',
  feishu: '在飞书 / Lark 中使用 Hermes',
  google_chat: '通过 Cloud Pub/Sub 将 Hermes 连接到 Google Chat',
  wecom: '通过 Webhook 向企业微信群单向发送消息',
  wecom_callback: '通过回调应用与企业微信双向集成',
  weixin: '通过腾讯 iLink Bot API 连接个人微信账号',
  qqbot: '通过 QQ 开放平台将 Hermes 连接到 QQ 机器人',
  yuanbao: '将 Hermes 连接到腾讯元宝',
  api_server: '将 Hermes 作为兼容 OpenAI 的 HTTP API 提供给 Open WebUI 等工具',
  webhook: '接收来自 GitHub、GitLab 及其他 Webhook 来源的事件',
  msgraph_webhook: '接收 Microsoft Graph 变更通知（Teams 会议、Outlook 等）',
  whatsapp_cloud: '通过 Meta 托管的 WhatsApp Cloud API 使用 Hermes',
  teams: '通过 Bot Framework 将 Hermes 连接到 Microsoft Teams 聊天',
  irc: '在 IRC 频道（或私聊）与 Hermes 之间中继消息',
  line: '通过 LINE Messaging API Webhook 使用 Hermes',
  ntfy: '通过 ntfy 推送主题与 Hermes 对话',
  photon: '通过 Photon 托管的 Spectrum 平台在 iMessage 中使用 Hermes',
  raft: '以外部代理身份加入 Raft 工作区',
  simplex: '通过本地 simplex-chat 守护进程在 SimpleX Chat 上与 Hermes 对话',
  relay: '由 Hermes Relay 连接器提供的通用中继适配器',
  a2a: '通过标准输入输出提供 A2A 消息接口，无需安装额外依赖',
  buzz: '通过 Buzz 协议将 Hermes 连接到去中心化消息网络。'
}

const ZH_FIELD_LABELS: Record<string, string> = {
  TELEGRAM_BOT_TOKEN: 'Telegram 机器人令牌',
  TELEGRAM_ALLOWED_USERS: '允许的 Telegram 用户 ID',
  TELEGRAM_PROXY: 'Telegram 代理',
  DISCORD_BOT_TOKEN: 'Discord 机器人令牌',
  DISCORD_ALLOWED_USERS: '允许的 Discord 用户',
  SLACK_BOT_TOKEN: 'Slack 机器人令牌',
  SLACK_APP_TOKEN: 'Slack 应用令牌',
  SLACK_ALLOWED_USERS: '允许的 Slack 成员 ID',
  WHATSAPP_ALLOWED_USERS: '允许的 WhatsApp 号码',
  HASS_URL: 'Home Assistant URL',
  HASS_TOKEN: 'Home Assistant 访问令牌',
  EMAIL_ADDRESS: '电子邮箱地址',
  EMAIL_PASSWORD: '邮箱密码',
  EMAIL_IMAP_HOST: 'IMAP 服务器',
  EMAIL_SMTP_HOST: 'SMTP 服务器'
}

function isChinese(locale: Locale): boolean {
  return locale === 'zh'
}

export function localizeChannelDescription(id: string, fallback: string, locale: Locale): string {
  return isChinese(locale) ? (ZH_PLATFORM_DESCRIPTIONS[id] ?? fallback) : fallback
}

export function localizeChannelFieldLabel(key: string, fallback: string, locale: Locale): string {
  if (!isChinese(locale)) return fallback
  return ZH_FIELD_LABELS[key] ?? localizeConfigLabel(key.toLowerCase(), locale)
}

export function localizeChannelFieldDescription(key: string, fallback: string, locale: Locale): string {
  if (!isChinese(locale) || !fallback) return fallback
  return `${localizeChannelFieldLabel(key, key, locale)}的配置说明。`
}

export function localizeChannelTestResult(
  platformName: string,
  result: MessagingPlatformTestResult,
  copy: DashboardCopy['channels'],
  locale: Locale
): string {
  const missing = (result.missing ?? []).join(', ')
  const messages: Record<string, string> = {
    disabled: copy.testDisabled,
    missing_required_setup: copy.testMissingSetup.replace('{fields}', missing),
    setup_incomplete: copy.testSetupIncomplete,
    gateway_not_running: copy.testGatewayStopped,
    connected: copy.testConnected,
    connection_error: copy.testConnectionError.replace('{error}', result.message),
    awaiting_connection: copy.testAwaitingConnection
  }
  if (result.code && messages[result.code]) return messages[result.code]

  // A Dashboard may briefly talk to an older backend during an upgrade. Translate its
  // fixed English replies too, while leaving genuinely provider-supplied diagnostics intact.
  if (result.message === `${platformName} is connected.`) return copy.testConnected
  if (result.message === `${platformName} is disabled. Enable it, then restart the gateway.`) {
    return copy.testDisabled
  }
  if (result.message === 'Platform setup is incomplete.') return copy.testSetupIncomplete
  if (result.message === 'Gateway is not running. Restart the gateway to connect this platform.') {
    return copy.testGatewayStopped
  }
  if (result.message === 'Setup looks complete, but the gateway has not reported a connection yet. Restart the gateway.') {
    return copy.testAwaitingConnection
  }
  if (result.message.startsWith('Missing required setup: ')) {
    return copy.testMissingSetup.replace('{fields}', result.message.slice('Missing required setup: '.length))
  }
  return locale === 'zh'
    ? copy.testConnectionError.replace('{error}', result.message)
    : result.message
}
