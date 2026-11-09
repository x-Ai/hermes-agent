import type { Locale } from './types'
import { localizeConfigLabel } from './config-metadata'
import type { DashboardCopy } from './dashboard'
import type { MessagingPlatformTestResult, WhatsAppOnboardingStatusResponse } from '@/lib/api'

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
  buzz: '通过 Buzz 协议将 Hermes 连接到去中心化消息网络'
}

const ZH_FIELD_LABELS: Record<string, string> = {
  A2A_AGENT_NAME: 'A2A 代理名称',
  A2A_BEARER_TOKEN: 'A2A 共享 bearer 令牌（留空则仅限 localhost）',
  A2A_HOST: 'A2A 绑定主机（默认 127.0.0.1）',
  A2A_PEER_TOKENS: 'A2A 对端令牌（name:token，逗号分隔；或留空）',
  A2A_PORT: 'A2A 端口（默认 9900）',
  A2A_PUSH_SECRET: 'A2A 推送签名密钥（或留空）',
  API_SERVER_ENABLED: '启用 API 服务器（true/false）',
  API_SERVER_HOST: 'API 服务器主机',
  API_SERVER_KEY: 'API 服务器认证密钥',
  API_SERVER_MODEL_NAME: 'API 服务器模型名称',
  API_SERVER_PORT: 'API 服务器端口',
  BLUEBUBBLES_ALLOWED_USERS: '允许的 iMessage 地址',
  BLUEBUBBLES_MENTION_PATTERNS: '提及模式',
  BLUEBUBBLES_PASSWORD: 'BlueBubbles 服务器密码',
  BLUEBUBBLES_SEND_READ_RECEIPTS: '发送已读回执？（true/false）',
  BLUEBUBBLES_SERVER_URL: 'BlueBubbles 服务器 URL',
  BLUEBUBBLES_WEBHOOK_HOST: 'Webhook 主机',
  BLUEBUBBLES_WEBHOOK_PATH: 'Webhook 路径',
  BLUEBUBBLES_WEBHOOK_PORT: 'Webhook 端口',
  BUZZ_ALLOWED_USERS: '允许的用户',
  BUZZ_AUTH_TAG: 'NIP-OA 认证标签 JSON（或留空）',
  BUZZ_CHANNELS: '频道 UUID',
  BUZZ_CLI_PATH: 'buzz CLI 路径（或留空）',
  BUZZ_CREDENTIALS_FILE: '凭据文件路径（或留空）',
  BUZZ_POLL_INTERVAL: '轮询间隔（秒）',
  BUZZ_PRIVATE_KEY: 'Nostr 私钥（nsec 或十六进制）',
  BUZZ_RELAY_URL: 'Buzz 中继 URL',
  BUZZ_REPLY_IN_THREAD: '在话题中回复？（true/false）',
  BUZZ_TRANSPORT: '传输方式（auto/websocket/poll）',
  DINGTALK_ALLOWED_USERS: '允许的用户',
  DINGTALK_CLIENT_ID: 'DingTalk Client ID（应用 key）',
  DINGTALK_CLIENT_SECRET: 'DingTalk Client Secret',
  DINGTALK_WEBHOOK_URL: 'DingTalk 机器人 Webhook URL（可选）',
  DISCORD_ALLOWED_USERS: '允许的 Discord 用户 ID',
  DISCORD_BOT_TOKEN: 'Discord 机器人令牌',
  EMAIL_ADDRESS: '电子邮箱地址',
  EMAIL_ALLOWED_USERS: '允许的用户',
  EMAIL_AUTHSERV_ID: '接收 MTA 的 authserv-id',
  EMAIL_IMAP_HOST: 'IMAP 服务器',
  EMAIL_PASSWORD: '邮箱密码',
  EMAIL_SMTP_HOST: 'SMTP 服务器',
  EMAIL_SMTP_PORT: 'SMTP 端口',
  FEISHU_ALLOWED_USERS: '允许的用户',
  FEISHU_APP_ID: 'Feishu App ID',
  FEISHU_APP_SECRET: 'Feishu App Secret',
  FEISHU_DOMAIN: '域名（feishu/lark）',
  FEISHU_ENCRYPT_KEY: '加密密钥',
  FEISHU_VERIFICATION_TOKEN: '验证令牌',
  GOOGLE_CHAT_ALLOWED_USERS: '允许的用户邮箱',
  GOOGLE_CHAT_HTTP_EVENTS_AUDIENCE: 'HTTP 事件令牌受众',
  GOOGLE_CHAT_HTTP_EVENTS_SERVICE_ACCOUNT_EMAIL: 'HTTP 事件服务账号邮箱',
  GOOGLE_CHAT_HTTP_EVENTS_URL: 'HTTP 事件回调 URL',
  GOOGLE_CHAT_PROJECT_ID: 'GCP 项目 ID',
  GOOGLE_CHAT_SERVICE_ACCOUNT_JSON: 'SA JSON 路径（留空则使用 ADC）',
  GOOGLE_CHAT_SUBSCRIPTION_NAME: 'Pub/Sub 订阅名称',
  HASS_URL: 'Home Assistant URL',
  HASS_TOKEN: 'Home Assistant 访问令牌',
  IRC_ALLOWED_USERS: '允许的昵称',
  IRC_CHANNEL: 'IRC 频道',
  IRC_NICKNAME: 'IRC 昵称',
  IRC_NICKSERV_PASSWORD: 'NickServ 密码',
  IRC_PORT: 'IRC 端口',
  IRC_SERVER: 'IRC 服务器',
  IRC_SERVER_PASSWORD: 'IRC 服务器密码',
  IRC_USE_TLS: '使用 TLS？（true/false）',
  LINE_ALLOWED_GROUPS: '允许的群组 ID',
  LINE_ALLOWED_ROOMS: '允许的房间 ID',
  LINE_ALLOWED_USERS: '允许的用户 ID',
  LINE_CHANNEL_ACCESS_TOKEN: 'LINE 频道访问令牌',
  LINE_CHANNEL_SECRET: 'LINE 频道密钥',
  LINE_HOST: 'Webhook 主机',
  LINE_PORT: 'Webhook 端口',
  LINE_PUBLIC_URL: '公开 HTTPS 基础 URL',
  LINE_SLOW_RESPONSE_THRESHOLD: '慢响应阈值（秒）',
  MATRIX_ACCESS_TOKEN: 'Matrix 访问令牌',
  MATRIX_ALLOWED_USERS: '允许的 Matrix 用户 ID',
  MATRIX_DEVICE_ID: 'Matrix 设备 ID（重启后保持不变）',
  MATRIX_HOMESERVER: 'Matrix 服务器 URL',
  MATRIX_PASSWORD: 'Matrix 密码',
  MATRIX_RECOVERY_KEY: 'Matrix 恢复密钥',
  MATRIX_USER_ID: 'Matrix 用户 ID（@user:server）',
  MATTERMOST_ALLOWED_USERS: '允许的 Mattermost 用户 ID',
  MATTERMOST_TOKEN: 'Mattermost 机器人令牌',
  MATTERMOST_URL: 'Mattermost 服务器 URL',
  NTFY_ALLOWED_USERS: '允许的主题名称',
  NTFY_MARKDOWN: '启用 Markdown 格式？（true/false）',
  NTFY_PUBLISH_TOPIC: 'ntfy 发布主题（或留空）',
  NTFY_SERVER_URL: 'ntfy 服务器 URL',
  NTFY_TOKEN: 'ntfy 认证令牌（或留空）',
  NTFY_TOPIC: 'ntfy 订阅主题',
  PHOTON_ALLOWED_USERS: '允许的用户',
  PHOTON_DASHBOARD_HOST: 'Dashboard 主机',
  PHOTON_MARKDOWN: '将回复渲染为 Markdown？（true/false）',
  PHOTON_MENTION_PATTERNS: '群组提及模式',
  PHOTON_NODE_BIN: 'Node 可执行文件路径',
  PHOTON_PROJECT_ID: 'Photon Spectrum 项目 ID',
  PHOTON_PROJECT_SECRET: 'Photon 项目密钥',
  PHOTON_REACTIONS: '启用表情回应？（true/false）',
  PHOTON_READ_RECEIPTS: '发送已读回执？（true/false）',
  PHOTON_SIDECAR_AUTOSTART: '自动启动 sidecar？',
  PHOTON_SIDECAR_PORT: 'Sidecar 控制端口',
  PHOTON_SIDECAR_TOKEN: 'Sidecar 令牌',
  PHOTON_SPECTRUM_HOST: 'Spectrum API 主机',
  PHOTON_TELEMETRY: '启用 Spectrum 遥测？（true/false）',
  QQ_ALLOWED_USERS: 'QQ 允许的用户',
  QQ_APP_ID: 'QQ App ID',
  QQ_CLIENT_SECRET: 'QQ Client Secret',
  QQ_GROUP_ALLOWED_USERS: 'QQ 群允许的用户',
  QQ_MARKDOWN_SUPPORT: 'QQ Markdown 支持',
  QQ_PORTAL_HOST: 'QQ 开放平台主机',
  QQ_SANDBOX: 'QQ 沙箱模式',
  QQ_STT_API_KEY: 'QQ STT API 密钥',
  QQ_STT_BASE_URL: 'QQ STT 基础 URL',
  QQ_STT_MODEL: 'QQ STT 模型',
  RAFT_PROFILE: 'Raft 代理配置',
  SIGNAL_ACCOUNT: 'Signal 账号号码',
  SIGNAL_ALLOWED_USERS: '允许的用户',
  SIGNAL_GROUP_ALLOWED_USERS: '允许的群组 ID',
  SIGNAL_HTTP_URL: 'signal-cli HTTP URL',
  SIGNAL_IGNORE_STORIES: '忽略动态？（true/false）',
  SIMPLEX_ALLOWED_USERS: '允许的联系人 ID',
  SIMPLEX_AUTO_ACCEPT: '自动接受联系人请求？（true/false）',
  SIMPLEX_GROUP_ALLOWED: "允许的群组 ID（逗号分隔，或 '*' 表示任意）",
  SIMPLEX_WS_URL: 'SimpleX 守护进程 WebSocket URL',
  SLACK_ALLOWED_USERS: '允许的 Slack 成员 ID',
  SLACK_APP_TOKEN: 'Slack App Token（xapp-...）',
  SLACK_BOT_TOKEN: 'Slack Bot Token（xoxb-...）',
  SMS_ALLOWED_USERS: '允许的用户',
  TEAMS_ALLOWED_USERS: '允许的用户',
  TEAMS_CLIENT_ID: 'Teams / Azure AD 客户端 ID',
  TEAMS_CLIENT_SECRET: 'Teams / Azure AD 客户端密钥',
  TEAMS_GRAPH_ACCESS_TOKEN: 'Graph 访问令牌（或留空）',
  TEAMS_HOST: 'Webhook 主机',
  TEAMS_INCOMING_WEBHOOK_URL: '传入 Webhook URL（或留空）',
  TEAMS_PORT: 'Webhook 端口',
  TEAMS_TENANT_ID: 'Teams / Azure AD 租户 ID',
  TELEGRAM_ALLOWED_USERS: '允许的 Telegram 用户 ID',
  TELEGRAM_BOT_TOKEN: 'Telegram 机器人令牌',
  TELEGRAM_WEBHOOK_SECRET: 'Webhook 密钥',
  TWILIO_ACCOUNT_SID: 'Twilio Account SID',
  TWILIO_AUTH_TOKEN: 'Twilio Auth Token',
  TWILIO_PHONE_NUMBER: 'Twilio 电话号码',
  WEBHOOK_ENABLED: '启用 Webhook（true/false）',
  WEBHOOK_PORT: 'Webhook 端口',
  WEBHOOK_SECRET: 'Webhook 密钥',
  WECOM_ALLOWED_USERS: '允许的用户',
  WECOM_BOT_ID: 'WeCom 机器人 ID',
  WECOM_CALLBACK_AGENT_ID: 'WeCom 回调代理 ID',
  WECOM_CALLBACK_CORP_ID: 'WeCom 回调企业 ID',
  WECOM_CALLBACK_CORP_SECRET: 'WeCom 回调企业密钥',
  WECOM_CALLBACK_ENCODING_AES_KEY: 'WeCom 回调 EncodingAESKey',
  WECOM_CALLBACK_TOKEN: 'WeCom 回调令牌',
  WECOM_SECRET: 'WeCom 密钥',
  WECOM_WEBSOCKET_URL: 'WeCom WebSocket URL',
  WEIXIN_ACCOUNT_ID: 'iLink Bot 账号 ID',
  WEIXIN_ALLOWED_USERS: '允许的用户',
  WEIXIN_BASE_URL: 'iLink API 基础 URL',
  WEIXIN_CDN_BASE_URL: 'iLink CDN 基础 URL',
  WEIXIN_DM_POLICY: '私聊策略（pairing|open|allowlist|disabled）',
  WEIXIN_GROUP_ALLOWED_USERS: '允许的群聊 ID',
  WEIXIN_GROUP_POLICY: '群组策略（disabled|open|allowlist）',
  WEIXIN_SPLIT_MULTILINE_MESSAGES: '拆分多行消息？（true/false）',
  WEIXIN_TOKEN: 'iLink Bot 令牌',
  WHATSAPP_ALLOWED_USERS: '允许的 WhatsApp 用户 ID',
  WHATSAPP_CLOUD_ACCESS_TOKEN: 'WhatsApp Cloud 访问令牌',
  WHATSAPP_CLOUD_ALLOWED_USERS: '允许的电话号码',
  WHATSAPP_CLOUD_API_VERSION: 'Graph API 版本',
  WHATSAPP_CLOUD_APP_ID: 'WhatsApp Cloud 应用 ID',
  WHATSAPP_CLOUD_APP_SECRET: 'WhatsApp Cloud 应用密钥',
  WHATSAPP_CLOUD_DM_POLICY: '私聊策略',
  WHATSAPP_CLOUD_PHONE_NUMBER_ID: 'WhatsApp Cloud 电话号码 ID',
  WHATSAPP_CLOUD_VERIFY_TOKEN: 'WhatsApp Cloud 验证令牌',
  WHATSAPP_CLOUD_WABA_ID: 'WhatsApp Business Account ID',
  WHATSAPP_CLOUD_WEBHOOK_HOST: 'Webhook 主机',
  WHATSAPP_CLOUD_WEBHOOK_PATH: 'Webhook 路径',
  WHATSAPP_CLOUD_WEBHOOK_PORT: 'Webhook 端口',
  WHATSAPP_DM_POLICY: 'WhatsApp 私聊策略',
  WHATSAPP_ENABLED: '启用 WhatsApp？（true/false）',
  WHATSAPP_MODE: 'WhatsApp 模式',
  YUANBAO_ALLOWED_USERS: '允许的用户',
  YUANBAO_API_DOMAIN: 'API 域名',
  YUANBAO_APP_ID: 'App ID',
  YUANBAO_APP_SECRET: 'App Secret',
  YUANBAO_BOT_ID: '机器人 ID',
  YUANBAO_DM_ALLOW_FROM: '私聊白名单',
  YUANBAO_DM_POLICY: '私聊策略（open|allowlist|disabled）',
  YUANBAO_GROUP_ALLOW_FROM: '群组白名单',
  YUANBAO_GROUP_POLICY: '群组策略（open|allowlist|disabled）',
  YUANBAO_ROUTE_ENV: '路由环境',
  YUANBAO_WS_URL: 'WebSocket URL'
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

/**
 * Curated translations keyed by the exact backend sentence. A field's inline
 * `description` and its tooltip `help` are different sentences, so they stay
 * distinct; anything not curated is shown in the backend's own English.
 */
/**
 * Curated translations keyed by the exact backend sentence. A field's inline
 * `description` and its tooltip `help` are different sentences, so they stay
 * distinct; anything not curated is shown in the backend's own English.
 */
const ZH_FIELD_TEXT: Record<string, string> = {
  "Name advertised on this agent's Agent Card (default: hostname-derived).":
    '在本代理的 Agent Card 中公布的名称（默认：由主机名派生）',
  'Shared bearer token for inbound A2A calls (identity falls back to caller IP). With no token of any kind => bind to 127.0.0.1 only (no remote access).':
    '入站 A2A 调用共享的 bearer 令牌（身份回退为调用方 IP）。完全没有令牌时 => 仅绑定 127.0.0.1（禁止远程访问）',
  'Inbound bind host. Defaults to 127.0.0.1; only widens to 0.0.0.0 when a bearer token is set AND you opt in here.':
    '入站绑定主机。默认 127.0.0.1；仅当已设置 bearer 令牌且在此处明确选择时才会放宽到 0.0.0.0',
  "Per-peer bearer tokens ('alice:tok1,bob:tok2'). Each remote agent gets its own credential; the matched name is the authenticated identity used for rate limiting, trust, and audit.":
    "对端专属 bearer 令牌（'alice:tok1,bob:tok2'）。每个远程代理使用各自的凭据；匹配到的名称即用于限流、信任和审计的认证身份",
  'Inbound A2A server port (default 9900).': '入站 A2A 服务器端口（默认 9900）',
  'HMAC secret for signing push notifications (default: the shared bearer token).':
    '用于签名推送通知的 HMAC 密钥（默认：共享 bearer 令牌）',
  'Enable the OpenAI-compatible API server (true/false). Allows frontends like Open WebUI, LobeChat, etc. to connect.':
    '启用兼容 OpenAI 的 API 服务器（true/false），允许 Open WebUI、LobeChat 等前端接入',
  'Host/bind address for the API server (default: 127.0.0.1). API_SERVER_KEY is still required even on loopback binds.':
    'API 服务器的主机/绑定地址（默认：127.0.0.1）。即使绑定到回环地址，仍必须提供 API_SERVER_KEY',
  'Bearer token for API server authentication. Required whenever the API server is enabled; server refuses to start without it.':
    '用于 API 服务器认证的 bearer 令牌。启用 API 服务器时必填，缺失则服务器拒绝启动',
  "Model name advertised on /v1/models. Defaults to the profile name (or 'hermes-agent' for the default profile). Useful for multi-user setups with OpenWebUI.":
    "在 /v1/models 上公布的模型名称。默认为配置名（默认配置则为 'hermes-agent'）。适合与 OpenWebUI 配合的多用户场景",
  'Port for the API server (default: 8642).': 'API 服务器端口（默认：8642）',
  'Comma-separated iMessage addresses (email or phone) allowed to use the bot':
    '允许使用机器人的 iMessage 地址（邮箱或电话），以逗号分隔',
  'Group wake-word regexes (JSON list or comma/newline-separated); default Hermes wake words':
    '群组唤醒词正则（JSON 列表，或以逗号/换行分隔）；默认为 Hermes 唤醒词',
  'BlueBubbles server password (from BlueBubbles Server → Settings → API)':
    'BlueBubbles 服务器密码（在 BlueBubbles Server → Settings → API 中获取）',
  'Auto-mark inbound messages read (default true; needs the Private API helper)':
    '自动将收到的消息标记为已读（默认 true；需要 Private API 助手）',
  'BlueBubbles server URL for iMessage integration (e.g. http://192.168.1.10:1234)':
    '用于 iMessage 集成的 BlueBubbles 服务器 URL（例如 http://192.168.1.10:1234）',
  'Webhook listener bind host (default 127.0.0.1)': 'Webhook 监听绑定主机（默认 127.0.0.1）',
  'Webhook listener path (default /bluebubbles-webhook)': 'Webhook 监听路径（默认 /bluebubbles-webhook）',
  'Webhook listener port (default 8645)': 'Webhook 监听端口（默认 8645）',
  'Comma-separated npubs or hex pubkeys allowed to talk to the agent':
    '允许与代理对话的 npub 或十六进制公钥，以逗号分隔',
  'Optional NIP-OA owner-attestation auth tag JSON for NIP-42 WebSocket auth':
    '可选的 NIP-OA 所有者证明认证标签 JSON，用于 NIP-42 WebSocket 认证',
  'Comma-separated channel UUIDs to watch (default: all joined channels)':
    '要监听的频道 UUID，以逗号分隔（默认：所有已加入的频道）',
  "Path to the buzz CLI binary (default: 'buzz' on PATH, then ~/bin/buzz)":
    "buzz CLI 二进制文件路径（默认：PATH 中的 'buzz'，其次 ~/bin/buzz）",
  'JSON credentials file holding the nsec (fallback when BUZZ_PRIVATE_KEY is unset)':
    '保存 nsec 的 JSON 凭据文件（未设置 BUZZ_PRIVATE_KEY 时的回退）',
  'Seconds between inbound poll sweeps (default: 4)': '入站轮询扫描的间隔秒数（默认：4）',
  "Nostr private key for the agent's Buzz identity (nsec or hex) — the only Buzz secret":
    '代理 Buzz 身份的 Nostr 私钥（nsec 或十六进制）——Buzz 唯一的密钥',
  'Base URL of the Buzz community relay (e.g. https://mycommunity.communities.buzz.xyz)':
    'Buzz 社区中继的基础 URL（例如 https://mycommunity.communities.buzz.xyz）',
  'Thread replies under the triggering message (true/false, default: true); false posts flat to the channel timeline':
    '在触发消息下的话题中回复（true/false，默认：true）；设为 false 则直接发布到频道时间线',
  'Inbound transport: auto (WebSocket w/ poll fallback, default), websocket, or poll':
    '入站传输方式：auto（WebSocket，失败时回退轮询，默认）、websocket 或 poll',
  'Comma-separated staff/sender IDs allowed to talk to the bot (* = any)':
    '允许与机器人对话的员工/发送者 ID，以逗号分隔（* = 任意）',
  'DingTalk app key (Client ID)': 'DingTalk 应用 key（Client ID）',
  'DingTalk app secret (Client Secret)': 'DingTalk 应用密钥（Client Secret）',
  'Static robot webhook URL for cross-platform / cron delivery': '用于跨平台/cron 投递的固定机器人 Webhook URL',
  'Comma-separated Discord user IDs allowed to use the bot': '允许使用机器人的 Discord 用户 ID，以逗号分隔',
  'Discord bot token from Developer Portal': '来自 Developer Portal 的 Discord 机器人令牌',
  'Email account address': '邮箱账号地址',
  'Comma-separated email addresses allowed to talk to the bot': '允许与机器人对话的邮箱地址，以逗号分隔',
  "Exact authserv-id on your mail server's topmost Authentication-Results header, e.g. mx.google.com (required unless EMAIL_TRUST_FROM_HEADER=true)":
    '邮件服务器最顶层 Authentication-Results 头中的确切 authserv-id，例如 mx.google.com（除非 EMAIL_TRUST_FROM_HEADER=true，否则必填）',
  'IMAP host for inbound polling (e.g. imap.gmail.com)': '用于轮询收件的 IMAP 服务器（例如 imap.gmail.com）',
  'Email account password / app password': '邮箱账号密码或应用专用密码',
  'SMTP host (e.g. smtp.gmail.com)': 'SMTP 服务器（例如 smtp.gmail.com）',
  'SMTP port (default 587)': 'SMTP 端口（默认 587）',
  'Comma-separated Feishu user IDs allowed to talk to the bot': '允许与机器人对话的 Feishu 用户 ID，以逗号分隔',
  'Feishu/Lark app ID': 'Feishu / Lark 应用 ID',
  'Feishu/Lark app secret': 'Feishu / Lark 应用密钥',
  "Domain: 'feishu' (China) or 'lark' (International)": "域名：'feishu'（中国大陆）或 'lark'（国际版）",
  'Feishu / Lark encrypt key': 'Feishu / Lark 加密密钥',
  'Feishu / Lark verification token': 'Feishu / Lark 验证令牌',
  'Comma-separated user emails allowed to interact with the bot.': '允许与机器人交互的用户邮箱，以逗号分隔',
  'Expected audience for Google-signed HTTP event bearer tokens. Defaults to GOOGLE_CHAT_HTTP_EVENTS_URL.':
    'Google 签名的 HTTP 事件 bearer 令牌的预期受众。默认为 GOOGLE_CHAT_HTTP_EVENTS_URL',
  'Expected Google service account email for HTTP event bearer tokens.':
    'HTTP 事件 bearer 令牌预期的 Google 服务账号邮箱',
  'Authenticated HTTP endpoint for Chat message events.': '用于 Chat 消息事件的认证 HTTP 端点',
  'GCP project ID for optional Pub/Sub inbound mode. Falls back to GOOGLE_CLOUD_PROJECT.':
    '可选 Pub/Sub 入站模式使用的 GCP 项目 ID。回退到 GOOGLE_CLOUD_PROJECT',
  'Path to Service Account JSON key (or inline JSON). Leave empty to use Application Default Credentials on Cloud Run / GCE. Falls back to GOOGLE_APPLICATION_CREDENTIALS.':
    '服务账号 JSON 密钥的路径（或内联 JSON）。留空则在 Cloud Run / GCE 上使用应用默认凭据。回退到 GOOGLE_APPLICATION_CREDENTIALS',
  'Optional Pub/Sub subscription path for pull-mode inbound events.': '拉取模式入站事件的可选 Pub/Sub 订阅路径',
  'Comma-separated IRC nicks allowed to talk to the bot': '允许与机器人对话的 IRC 昵称，以逗号分隔',
  'IRC channel to join (e.g. #hermes)': '要加入的 IRC 频道（例如 #hermes）',
  'Bot nickname on IRC (default: hermes-bot)': '机器人在 IRC 上的昵称（默认：hermes-bot）',
  'NickServ password for nick identification': '用于昵称识别的 NickServ 密码',
  'IRC server port (default: 6697 with TLS, 6667 without)': 'IRC 服务器端口（默认：使用 TLS 时为 6697，否则为 6667）',
  'IRC server hostname (e.g. irc.libera.chat)': 'IRC 服务器主机名（例如 irc.libera.chat）',
  'IRC server password (if required)': 'IRC 服务器密码（如需要）',
  'Use TLS for the IRC connection (1/true/yes to enable, default: true on port 6697)':
    '为 IRC 连接启用 TLS（1/true/yes 表示启用，默认：在 6697 端口上为 true）',
  'Comma-separated LINE group IDs the bot will respond in (C-prefixed)':
    '机器人会响应的 LINE 群组 ID，以逗号分隔（以 C 开头）',
  'Comma-separated LINE room IDs the bot will respond in (R-prefixed)':
    '机器人会响应的 LINE 房间 ID，以逗号分隔（以 R 开头）',
  'Comma-separated LINE user IDs allowed to DM the bot (U-prefixed)':
    '允许私聊机器人的 LINE 用户 ID，以逗号分隔（以 U 开头）',
  'LINE channel long-lived access token (LINE Developers Console > Messaging API > Channel access token)':
    'LINE 频道长期访问令牌（LINE Developers Console > Messaging API > Channel access token）',
  'LINE channel secret (used for HMAC-SHA256 webhook signature verification)':
    'LINE 频道密钥（用于 HMAC-SHA256 Webhook 签名验证）',
  'Webhook bind host (default: unset → dual-stack, all interfaces IPv4+IPv6)':
    'Webhook 绑定主机（默认：未设置 → 双栈，监听所有接口 IPv4+IPv6）',
  'Webhook listen port (default: 8646)': 'Webhook 监听端口（默认：8646）',
  'Public HTTPS base URL for serving images/audio/video to LINE (e.g. https://my-tunnel.example.com). Required for media sending when the bind address is not directly reachable.':
    '向 LINE 提供图片/音频/视频的公开 HTTPS 基础 URL（例如 https://my-tunnel.example.com）。当绑定地址无法直接访问时，发送媒体必须设置此项',
  'Seconds before the slow-LLM postback button fires (default: 45; set 0 to disable and always Push-fallback)':
    '慢响应回退按钮触发前的秒数（默认：45；设为 0 可禁用并始终走 Push 回退）',
  'Matrix access token (preferred over password login)': 'Matrix 访问令牌（优先于密码登录）',
  'Comma-separated Matrix user IDs allowed to use the bot (@user:server format)':
    '允许使用机器人的 Matrix 用户 ID，以逗号分隔（@user:server 格式）',
  'Stable Matrix device ID for E2EE persistence across restarts (e.g. HERMES_BOT)':
    '用于跨重启保持 E2EE 的稳定 Matrix 设备 ID（例如 HERMES_BOT）',
  'Matrix homeserver URL (e.g. https://matrix.example.org)': 'Matrix 服务器 URL（例如 https://matrix.example.org）',
  'Matrix account password (alternative to MATRIX_ACCESS_TOKEN)': 'Matrix 账号密码（MATRIX_ACCESS_TOKEN 的替代方案）',
  'Matrix recovery key for cross-signing verification after device key rotation (from Element: Settings → Security → Recovery Key)':
    '设备密钥轮换后进行交叉签名验证的 Matrix 恢复密钥（在 Element：Settings → Security → Recovery Key 中获取）',
  'Matrix user ID (e.g. @hermes:example.org)': 'Matrix 用户 ID（例如 @hermes:example.org）',
  'Comma-separated Mattermost user IDs allowed to use the bot': '允许使用机器人的 Mattermost 用户 ID，以逗号分隔',
  'Mattermost bot token or personal access token': 'Mattermost 机器人令牌或个人访问令牌',
  'Mattermost server URL (e.g. https://mm.example.com)': 'Mattermost 服务器 URL（例如 https://mm.example.com）',
  'Comma-separated topic names allowed (allowlist)': '允许的主题名称，以逗号分隔（白名单）',
  'Send replies with X-Markdown: true header (true/false, default: false)':
    '发送回复时附带 X-Markdown: true 标头（true/false，默认：false）',
  'Topic to publish replies to (defaults to NTFY_TOPIC)': '发布回复的目标主题（默认为 NTFY_TOPIC）',
  'ntfy server URL (default: https://ntfy.sh)': 'ntfy 服务器 URL（默认：https://ntfy.sh）',
  "Bearer token or 'user:pass' for Basic auth (optional)": "bearer 令牌，或用于基本认证的 'user:pass'（可选）",
  'Topic name to subscribe to (e.g. hermes-in)': '要订阅的主题名称（例如 hermes-in）',
  'Comma-separated E.164 phone numbers allowed to talk to the bot': '允许与机器人对话的 E.164 电话号码，以逗号分隔',
  'Photon Dashboard API host (default https://app.photon.codes)':
    'Photon Dashboard API 主机（默认 https://app.photon.codes）',
  'Send agent replies as markdown — iMessage renders it natively, other Spectrum platforms degrade to plain text (true/false, default true)':
    '以 Markdown 发送代理回复——iMessage 原生渲染，其他 Spectrum 平台会降级为纯文本（true/false，默认 true）',
  'Mention wake-word regexes for group chats (JSON list or comma/newline-separated; defaults to Hermes wake words)':
    '群聊的提及唤醒词正则（JSON 列表，或以逗号/换行分隔；默认为 Hermes 唤醒词）',
  "Path to the node binary (default: PM's pinned node, then PATH)":
    'node 二进制文件路径（默认：PM 固定的 node，其次 PATH）',
  "Spectrum project id (the project's spectrumProjectId; set by `hermes photon setup`)":
    'Spectrum 项目 ID（项目的 spectrumProjectId，由 `hermes photon setup` 设置）',
  'Project secret paired with the Spectrum project id (set by `hermes photon setup`)':
    '与 Spectrum 项目 ID 配对的密钥（由 `hermes photon setup` 设置）',
  'Tapback 👀/👍/👎 on messages as processing status and route tapbacks on bot messages to the agent (true/false, default false)':
    '在消息上以 👀/👍/👎 回应表示处理状态，并将机器人消息上的回应转给代理（true/false，默认 false）',
  'Mark inbound iMessages read after forwarding to Hermes (true/false, default true)':
    '将入站 iMessage 转发给 Hermes 后标记为已读（true/false，默认 true）',
  'Spawn the Node sidecar on connect (true/false, default true)': '连接时启动 Node sidecar（true/false，默认 true）',
  'Loopback port for the Node sidecar control + inbound channel (default 8789)':
    'Node sidecar 控制与入站通道的回环端口（默认 8789）',
  'Shared secret for the loopback sidecar channel (default: random per start)':
    '回环 sidecar 通道的共享密钥（默认：每次启动随机生成）',
  'Photon Spectrum API host (default https://spectrum.photon.codes)':
    'Photon Spectrum API 主机（默认 https://spectrum.photon.codes）',
  'Enable Spectrum SDK telemetry in the sidecar (true/false, default false; toggle with `hermes photon telemetry on|off`)':
    '在 sidecar 中启用 Spectrum SDK 遥测（true/false，默认 false；可用 `hermes photon telemetry on|off` 切换）',
  'Comma-separated QQ user IDs allowed to use the bot': '允许使用机器人的 QQ 用户 ID，以逗号分隔',
  'QQ Bot App ID from QQ Open Platform (q.qq.com)': '来自 QQ 开放平台（q.qq.com）的 QQ 机器人 App ID',
  'QQ Bot Client Secret from QQ Open Platform': '来自 QQ 开放平台的 QQ 机器人 Client Secret',
  'Comma-separated QQ group IDs allowed to interact with the bot': '允许与机器人交互的 QQ 群 ID，以逗号分隔',
  'Send QQ messages as markdown when the bot is allowed to (true/false)':
    '在机器人被允许时以 Markdown 发送 QQ 消息（true/false）',
  'QQ Open Platform portal host (default q.qq.com)': 'QQ 开放平台门户主机（默认 q.qq.com）',
  'Enable QQ sandbox mode for development testing (true/false)': '启用 QQ 沙箱模式用于开发测试（true/false）',
  'API key for QQ voice transcription fallback': 'QQ 语音转写回退的 API 密钥',
  'Base URL for the QQ voice transcription provider': 'QQ 语音转写服务商的基础 URL',
  'Model name for the QQ voice transcription provider': 'QQ 语音转写服务商的模型名称',
  'Raft agent profile slug — auto-enables the adapter when set': 'Raft 代理配置 slug——设置后会自动启用该适配器',
  'Signal account phone number in E.164 format (e.g. +15551234567)':
    'E.164 格式的 Signal 账号电话号码（例如 +15551234567）',
  'Comma-separated phone numbers or UUIDs allowed to DM the bot': '允许私聊机器人的电话号码或 UUID，以逗号分隔',
  'Comma-separated group IDs allowed to talk to the bot (* for all groups)':
    '允许与机器人对话的群组 ID，以逗号分隔（* 表示所有群组）',
  'signal-cli HTTP daemon URL (e.g. http://127.0.0.1:8080)':
    'signal-cli HTTP 守护进程 URL（例如 http://127.0.0.1:8080）',
  'Ignore Signal stories (true/false, default: true)': '忽略 Signal 动态（true/false，默认：true）',
  'Comma-separated SimpleX contact IDs allowed to talk to the bot': '允许与机器人对话的 SimpleX 联系人 ID，以逗号分隔',
  'Auto-accept incoming contact requests (default: true)': '自动接受传入的联系人请求（默认：true）',
  "Comma-separated SimpleX group IDs the bot should participate in, or '*' to allow any group. Omit to ignore group messages entirely (safer default — a bot in a group otherwise processes every member's traffic).":
    "机器人应参与的 SimpleX 群组 ID，以逗号分隔；'*' 表示允许任意群组。留空则完全忽略群消息（更安全的默认值——否则群内的机器人会处理每个成员的流量）",
  'WebSocket URL of the simplex-chat daemon (e.g. ws://127.0.0.1:5225)':
    'simplex-chat 守护进程的 WebSocket URL（例如 ws://127.0.0.1:5225）',
  'Comma-separated Slack member IDs allowed to use Hermes, e.g. U01ABC2DEF3. Without this, Slack may connect but deny messages by default.':
    '允许使用 Hermes 的 Slack 成员 ID，以逗号分隔，例如 U01ABC2DEF3。未设置时 Slack 可能已连接，但默认拒绝消息',
  'In Slack, open your profile, choose More or the three-dot menu, then Copy member ID. Add multiple IDs comma-separated.':
    '在 Slack 中打开你的个人资料，选择“更多”或三点菜单，然后点击“复制成员 ID”。多个 ID 以逗号分隔',
  'Slack app-level token (xapp-) for Socket Mode. Get from Basic Information → App-Level Tokens. Also ensure Event Subscriptions include: message.im, message.channels, message.groups, message.mpim, app_mention':
    '用于 Socket Mode 的 Slack 应用级令牌（xapp-）。在 Basic Information → App-Level Tokens 获取。另请确保 Event Subscriptions 包含：message.im, message.channels, message.groups, message.mpim, app_mention',
  'In your Slack app, enable Socket Mode, then create Basic Information > App-Level Tokens with the connections:write scope.':
    '在 Slack 应用中启用 Socket Mode，然后在 Basic Information > App-Level Tokens 创建带有 connections:write 范围的令牌',
  'Slack bot token (xoxb-). Get from OAuth & Permissions after installing your app. Required scopes: chat:write, app_mentions:read, channels:history, groups:history, im:history, im:read, im:write, mpim:history, mpim:read, users:read, files:read, files:write':
    'Slack 机器人令牌（xoxb-）。安装应用后在 OAuth & Permissions 获取。必需权限范围：chat:write, app_mentions:read, channels:history, groups:history, im:history, im:read, im:write, mpim:history, mpim:read, users:read, files:read, files:write',
  'In your Slack app, add the required bot scopes, install the app to the workspace, then copy OAuth & Permissions > Bot User OAuth Token.':
    '在 Slack 应用中添加所需的机器人权限范围，将应用安装到工作区，然后复制 OAuth & Permissions > Bot User OAuth Token',
  'Comma-separated phone numbers allowed to talk to the bot': '允许与机器人对话的电话号码，以逗号分隔',
  'Comma-separated Teams user IDs / UPNs allowed to talk to the bot':
    '允许与机器人对话的 Teams 用户 ID / UPN，以逗号分隔',
  'Azure AD application (Bot Framework) client ID': 'Azure AD 应用（Bot Framework）客户端 ID',
  'Azure AD application client secret': 'Azure AD 应用客户端密钥',
  'Microsoft Graph access token for meeting-summary delivery in graph mode':
    'graph 模式下用于投递会议纪要的 Microsoft Graph 访问令牌',
  'Incoming-webhook URL for meeting-summary delivery in webhook mode (the URL is the credential)':
    'webhook 模式下用于投递会议纪要的传入 Webhook URL（URL 本身即凭据）',
  'Webhook listen port (Bot Framework default: 3978)': 'Webhook 监听端口（Bot Framework 默认：3978）',
  'Azure AD tenant ID hosting the bot application': '托管机器人应用的 Azure AD 租户 ID',
  'Optional comma-separated numeric Telegram user IDs allowed immediately; leave blank to approve new users through DM pairing':
    '可选：以逗号分隔的数字 Telegram 用户 ID，列出的用户可立即使用；留空则通过私聊配对审批新用户',
  'Complete Telegram bot token created by @BotFather (numeric bot ID followed by a colon and secret)':
    '由 @BotFather 创建的完整 Telegram 机器人令牌（数字机器人 ID，后接冒号和密钥）',
  'Secret token Telegram sends with each webhook update (required with TELEGRAM_WEBHOOK_URL)':
    'Telegram 随每次 Webhook 更新发送的密钥令牌（与 TELEGRAM_WEBHOOK_URL 搭配时必填）',
  'Twilio Account SID': 'Twilio Account SID',
  'Twilio Auth Token': 'Twilio Auth Token',
  'Twilio phone number (SMS-capable, E.164 format)': 'Twilio 电话号码（支持 SMS，E.164 格式）',
  'Enable the webhook platform adapter for receiving events from GitHub, GitLab, etc.':
    '启用 Webhook 平台适配器，以接收来自 GitHub、GitLab 等的事件',
  'Port for the webhook HTTP server (default: 8644).': 'Webhook HTTP 服务器端口（默认：8644）',
  'Global HMAC secret for webhook signature validation (overridable per route in config.yaml).':
    '用于 Webhook 签名验证的全局 HMAC 密钥（可在 config.yaml 中按路由覆盖）',
  'Comma-separated WeCom user IDs allowed to talk to the bot': '允许与机器人对话的 WeCom 用户 ID，以逗号分隔',
  'WeCom Smart Robot bot ID': 'WeCom 智能机器人 ID',
  'WeCom callback-mode agent ID': 'WeCom 回调模式的代理 ID',
  'WeCom callback-mode corp ID (self-built apps)': 'WeCom 回调模式的企业 ID（自建应用）',
  'WeCom callback-mode corp secret': 'WeCom 回调模式的企业密钥',
  'WeCom callback EncodingAESKey for message crypto': '用于消息加密的 WeCom 回调 EncodingAESKey',
  'WeCom callback verification token': 'WeCom 回调验证令牌',
  'WeCom Smart Robot secret': 'WeCom 智能机器人密钥',
  'WeCom Smart Robot WebSocket URL': 'WeCom 智能机器人 WebSocket URL',
  'iLink Bot account ID obtained through QR login in hermes gateway setup':
    '在 hermes gateway setup 中通过扫码登录获取的 iLink Bot 账号 ID',
  'Comma-separated Weixin user IDs allowed to DM the bot': '允许私聊机器人的微信用户 ID，以逗号分隔',
  'iLink API base URL saved by QR login (default: https://ilinkai.weixin.qq.com)':
    '扫码登录时保存的 iLink API 基础 URL（默认：https://ilinkai.weixin.qq.com）',
  'iLink media CDN base URL (default: https://novac2c.cdn.weixin.qq.com/c2c)':
    'iLink 媒体 CDN 基础 URL（默认：https://novac2c.cdn.weixin.qq.com/c2c）',
  'Direct-message policy: pairing, open, allowlist, or disabled (default: pairing)':
    '私聊策略：pairing、open、allowlist 或 disabled（默认：pairing）',
  'Comma-separated group chat IDs allowed when WEIXIN_GROUP_POLICY=allowlist':
    '当 WEIXIN_GROUP_POLICY=allowlist 时允许的群聊 ID，以逗号分隔',
  'Group-chat policy: disabled, open, or allowlist (default: disabled)':
    '群聊策略：disabled、open 或 allowlist（默认：disabled）',
  'Send each line of a multi-line reply as its own message (default: false)':
    '将多行回复的每一行作为单独消息发送（默认：false）',
  'iLink Bot token obtained through QR login in hermes gateway setup':
    '在 hermes gateway setup 中通过扫码登录获取的 iLink Bot 令牌',
  'Comma-separated WhatsApp user IDs allowed to talk to the bot': '允许与机器人对话的 WhatsApp 用户 ID，以逗号分隔',
  'System User permanent access token': '系统用户永久访问令牌',
  'Comma-separated WhatsApp phone numbers allowed to talk to the bot':
    '允许与机器人对话的 WhatsApp 电话号码，以逗号分隔',
  'Graph API version (default: v20.0)': 'Graph API 版本（默认：v20.0）',
  'Meta app ID (optional)': 'Meta 应用 ID（可选）',
  'App secret — HMAC key for X-Hub-Signature-256 webhook verification':
    '应用密钥——用于 X-Hub-Signature-256 Webhook 验证的 HMAC 密钥',
  'DM policy: open | allowlist | disabled (falls back to WHATSAPP_DM_POLICY)':
    '私聊策略：open | allowlist | disabled（回退到 WHATSAPP_DM_POLICY）',
  'WhatsApp phone number ID from the Meta App Dashboard (WhatsApp → API Setup)':
    'Meta App Dashboard 中的 WhatsApp 电话号码 ID（WhatsApp → API Setup）',
  'Shared secret for the webhook verification handshake (hub.verify_token)':
    'Webhook 验证握手的共享密钥（hub.verify_token）',
  'WhatsApp Business Account ID; when set, inbound webhooks must match it':
    'WhatsApp Business Account ID；设置后，入站 Webhook 必须与之匹配',
  'Webhook bind host (unset = dual-stack all interfaces)': 'Webhook 绑定主机（未设置 = 双栈监听所有接口）',
  'Webhook path (default: /whatsapp/webhook)': 'Webhook 路径（默认：/whatsapp/webhook）',
  'Webhook bind port (default: 8090)': 'Webhook 绑定端口（默认：8090）',
  'How WhatsApp direct messages are authorized': 'WhatsApp 私聊的授权方式',
  'Enable the WhatsApp adapter (requires the Node.js bridge running)':
    '启用 WhatsApp 适配器（需要 Node.js 桥接器正在运行）',
  'WhatsApp bridge mode': 'WhatsApp 桥接模式',
  'Comma-separated Yuanbao user IDs allowed to talk to the bot': '允许与机器人对话的 Yuanbao 用户 ID，以逗号分隔',
  'Override the Yuanbao API domain (sign-token endpoint)': '覆盖 Yuanbao API 域名（签名令牌端点）',
  'The App ID from your Yuanbao IM Bot credentials (legacy alias: YUANBAO_APP_KEY)':
    'Yuanbao IM Bot 凭据中的 App ID（旧别名：YUANBAO_APP_KEY）',
  'The App Secret (used for HMAC signing) from your Yuanbao IM Bot': 'Yuanbao IM Bot 的 App Secret（用于 HMAC 签名）',
  'Bot account ID (auto-detected from the sign token when unset)': '机器人账号 ID（未设置时从签名令牌自动识别）',
  'Comma-separated user IDs allowed to DM the bot (allowlist policy)':
    '允许私聊机器人的用户 ID，以逗号分隔（白名单策略）',
  'DM access policy: open, allowlist or disabled': '私聊访问策略：open、allowlist 或 disabled',
  'Comma-separated group IDs allowed (allowlist policy)': '允许的群组 ID，以逗号分隔（白名单策略）',
  'Group access policy: open, allowlist or disabled': '群组访问策略：open、allowlist 或 disabled',
  'Routing environment header for non-production Yuanbao backends': '用于非生产 Yuanbao 后端的路由环境标头',
  'Override the Yuanbao WebSocket gateway URL': '覆盖 Yuanbao WebSocket 网关 URL',
  'Home Assistant base URL (default: http://homeassistant.local:8123)':
    'Home Assistant 基础 URL（默认：http://homeassistant.local:8123）',
  'Home Assistant Long-Lived Access Token': 'Home Assistant 长期访问令牌'
}

export function localizeChannelFieldDescription(_key: string, fallback: string, locale: Locale): string {
  if (!isChinese(locale) || !fallback) return fallback
  return ZH_FIELD_TEXT[fallback] ?? fallback
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
  if (
    result.message === 'Setup looks complete, but the gateway has not reported a connection yet. Restart the gateway.'
  ) {
    return copy.testAwaitingConnection
  }
  if (result.message.startsWith('Missing required setup: ')) {
    return copy.testMissingSetup.replace('{fields}', result.message.slice('Missing required setup: '.length))
  }
  return locale === 'zh' ? copy.testConnectionError.replace('{error}', result.message) : result.message
}

/** A failed WhatsApp pairing in the dashboard's words when the backend names a code it knows
 *  (`hermes_cli/web_routers/messaging.py::_WHATSAPP_PAIRING_ERROR_TEXT`), else the bridge's own text. */
export function localizeWhatsAppPairingError(
  status: Pick<WhatsAppOnboardingStatusResponse, 'error' | 'error_code'>,
  copy: DashboardCopy['channels']
): string {
  const messages: Record<string, string> = { passkey_required: copy.whatsappPasskeyRequired }
  return (status.error_code && messages[status.error_code]) || status.error || copy.setupFailed
}
