import type { Translations } from './types'

// Connector credential fields of Settings › Messaging, keyed by env var: the label,
// help and placeholder the Desktop shows instead of the backend's English
// `prompt` / `description` (hermes_cli/web_routers/messaging.py). Lives beside
// zh.ts so the over-cap root catalog shrinks as the platform list grows.
export const zhMessagingFieldCopy: Translations['messaging']['fieldCopy'] = {
  TELEGRAM_BOT_TOKEN: {
    label: 'Bot 令牌',
    help: '用 @BotFather 创建一个机器人，然后粘贴它给你的令牌',
    placeholder: '粘贴 Telegram bot 令牌'
  },
  TELEGRAM_ALLOWED_USERS: {
    label: '允许的 Telegram 用户 ID',
    help: '推荐，来自 @userinfobot 的数字 ID（每格一个），不设置则任何人都能私信你的机器人'
  },
  TELEGRAM_PROXY: {
    label: '代理 URL',
    help: '仅在 Telegram 被屏蔽的网络中需要'
  },
  DISCORD_BOT_TOKEN: {
    label: 'Bot 令牌',
    help: '在 Discord 开发者门户创建应用，添加机器人，然后粘贴其令牌'
  },
  DISCORD_ALLOWED_USERS: {
    label: '允许的 Discord 用户 ID',
    help: '推荐，Discord 用户 ID（每格一个）'
  },
  DISCORD_REPLY_TO_MODE: {
    label: '回复方式',
    help: 'first、all 或 off'
  },
  DISCORD_ALLOW_ALL_USERS: {
    label: '允许所有 Discord 用户',
    help: '仅用于开发，为 true 时，任何人都可以私信 bot，不需要允许列表'
  },
  DISCORD_HOME_CHANNEL: {
    label: '主页频道 ID',
    help: 'bot 主动发送消息的频道（cron 输出、提醒等）'
  },
  DISCORD_HOME_CHANNEL_NAME: {
    label: '主页频道名称',
    help: '日志和状态输出中显示的主页频道名称'
  },
  BLUEBUBBLES_ALLOW_ALL_USERS: {
    label: '允许所有 iMessage 用户',
    help: '为 true 时跳过 BlueBubbles 允许列表'
  },
  MATTERMOST_ALLOW_ALL_USERS: {
    label: '允许所有 Mattermost 用户',
    help: '允许所有 Mattermost 用户绕过允许列表与机器人交互'
  },
  MATTERMOST_HOME_CHANNEL: {
    label: '主页频道',
    help: 'cron / 通知投递的默认 Mattermost 频道 ID'
  },
  QQ_ALLOW_ALL_USERS: {
    label: '允许所有 QQ 用户',
    help: '允许所有 QQ 用户绕过允许列表与机器人交互（true/false）'
  },
  QQBOT_HOME_CHANNEL: {
    label: 'QQ 主页频道',
    help: 'cron 投递的默认频道或群组'
  },
  QQBOT_HOME_CHANNEL_NAME: {
    label: 'QQ 主页频道名称',
    help: 'QQ 主页频道的显示名称'
  },
  SLACK_BOT_TOKEN: {
    label: 'Slack bot 令牌',
    help: '安装 Slack 应用后，在 OAuth & Permissions 中找到 bot 令牌',
    placeholder: '粘贴 Slack bot 令牌'
  },
  SLACK_APP_TOKEN: {
    label: 'Slack app 令牌',
    help: 'Socket Mode 需要 app 级令牌',
    placeholder: '粘贴 Slack app 令牌'
  },
  SLACK_ALLOWED_USERS: {
    label: '允许的 Slack 用户 ID',
    help: '推荐，Slack 用户 ID（每格一个）'
  },
  MATTERMOST_URL: {
    label: '服务器 URL',
    help: 'Mattermost 服务器 URL（例如 https://mm.example.com）',
    placeholder: 'https://mattermost.example.com'
  },
  MATTERMOST_TOKEN: {
    label: 'Bot 令牌',
    help: 'Mattermost Bot 令牌或个人访问令牌'
  },
  MATTERMOST_ALLOWED_USERS: {
    label: '允许的用户 ID',
    help: '推荐，Mattermost 用户 ID（每格一个）'
  },
  MATRIX_HOMESERVER: {
    label: 'Homeserver URL',
    placeholder: 'https://matrix.org',
    help: 'Matrix homeserver URL（如 https://matrix.org）'
  },
  MATRIX_ACCESS_TOKEN: {
    label: '访问令牌',
    help: 'Matrix 访问令牌（优先于密码登录）'
  },
  MATRIX_USER_ID: {
    label: 'Bot 用户 ID',
    placeholder: '@hermes:example.org',
    help: 'Matrix 用户 ID（如 @hermes:example.org）'
  },
  MATRIX_ALLOWED_USERS: {
    label: '允许的 Matrix 用户 ID',
    help: '推荐，@user:server 格式的用户 ID（每格一个）'
  },
  SIGNAL_HTTP_URL: {
    label: 'Signal 桥接 URL',
    placeholder: 'http://127.0.0.1:8080',
    help: '运行中的 signal-cli REST 桥接的 URL'
  },
  SIGNAL_ACCOUNT: {
    label: '电话号码',
    help: '在 signal-cli 桥接中注册的号码'
  },
  SIGNAL_ALLOWED_USERS: {
    label: '允许的 Signal 用户',
    help: '推荐，Signal 标识符（每格一个）'
  },
  WHATSAPP_ENABLED: {
    label: '启用 WhatsApp 桥接',
    help: '由下方开关自动设置，除非确知需要，否则请勿改动'
  },
  WHATSAPP_MODE: {
    label: '桥接模式'
  },
  WHATSAPP_ALLOWED_USERS: {
    label: '允许的 WhatsApp 用户',
    help: '推荐，电话号码或 WhatsApp ID（每格一个）'
  },
  TELEGRAM_ALLOW_ALL_USERS: {
    label: '允许所有 Telegram 用户',
    help: '仅用于开发，任何 Telegram 用户都能触发机器人'
  },
  TELEGRAM_HOME_CHANNEL: { label: '主页频道 ID', help: 'cron / 通知投递的默认聊天 ID' },
  TELEGRAM_HOME_CHANNEL_NAME: { label: '主页频道名称', help: 'Telegram 主页频道的显示名称' },
  SLACK_ALLOW_ALL_USERS: { label: '允许所有 Slack 用户', help: '仅用于开发，任何 Slack 用户都能触发机器人' },
  SLACK_HOME_CHANNEL: { label: '主页频道 ID', help: 'cron / 通知投递的默认频道 ID（以 C 开头）' },
  SLACK_HOME_CHANNEL_NAME: { label: '主页频道名称', help: 'Slack 主页频道的显示名称' },
  SLACK_THREAD_REQUIRE_MENTION: {
    label: '线程内需要 @提及',
    help: 'Slack 线程回复需要显式 @提及，顶层自由响应频道不受影响'
  },
  MATTERMOST_ALLOWED_CHANNELS: {
    label: '允许的频道 ID',
    help: '设置后机器人只在这些频道响应（白名单），逗号分隔'
  },
  MATTERMOST_FREE_RESPONSE_CHANNELS: {
    label: '自由响应频道 ID',
    help: '机器人无需 @提及即可响应的 Mattermost 频道 ID，逗号分隔'
  },
  MATTERMOST_REPLY_MODE: { label: '回复方式', help: 'thread（嵌套线程）或 off（平铺），默认 off' },
  MATTERMOST_REQUIRE_MENTION: {
    label: '频道内需要 @提及',
    help: '在 Mattermost 频道中需要 @提及（默认 true），设为 false 可响应所有消息'
  },
  MATRIX_ALLOW_ALL_USERS: { label: '允许所有 Matrix 用户', help: '仅用于开发，任何 Matrix 用户都能触发机器人' },
  MATRIX_AUTO_THREAD: { label: '房间内自动创建线程', help: '为 Matrix 房间消息自动创建线程（默认 true）' },
  MATRIX_DEVICE_ID: {
    label: '设备 ID',
    help: '用于端到端加密的稳定 Matrix 设备 ID，重启后保持不变（如 HERMES_BOT）'
  },
  MATRIX_DM_AUTO_THREAD: { label: '私信自动创建线程', help: '为 Matrix 私信自动创建线程（默认 false）' },
  MATRIX_FREE_RESPONSE_ROOMS: {
    label: '自由响应房间 ID',
    help: '机器人无需 @提及即可响应的 Matrix 房间 ID，逗号分隔'
  },
  MATRIX_HOME_CHANNEL: { label: '主页房间 ID', help: 'cron / 通知投递的默认房间 ID' },
  MATRIX_HOME_CHANNEL_NAME: { label: '主页房间名称', help: 'Matrix 主页房间的显示名称' },
  MATRIX_PASSWORD: { label: 'Matrix 密码', help: 'Matrix 账户密码（访问令牌的替代方式）' },
  MATRIX_RECOVERY_KEY: {
    label: '恢复密钥',
    help: '设备密钥轮换后用于交叉签名验证的恢复密钥（Element：设置 → 安全 → 恢复密钥）'
  },
  MATRIX_REQUIRE_MENTION: {
    label: '房间内需要 @提及',
    help: '在 Matrix 房间中需要 @提及（默认 true），设为 false 可响应所有消息'
  },
  WHATSAPP_DM_POLICY: { label: '私信策略', help: 'WhatsApp 私信的授权方式' },
  WHATSAPP_ALLOW_ALL_USERS: {
    label: '允许所有 WhatsApp 用户',
    help: '仅用于开发，任何 WhatsApp 用户都能触发机器人'
  },
  WHATSAPP_HOME_CHANNEL: { label: '主页频道 ID', help: 'cron / 通知投递的默认聊天 ID' },
  WHATSAPP_HOME_CHANNEL_NAME: { label: '主页频道名称', help: 'WhatsApp 主页频道的显示名称' },
  BLUEBUBBLES_SERVER_URL: {
    label: '服务器 URL',
    help: '用于 iMessage 集成的 BlueBubbles 服务器 URL',
    placeholder: 'http://192.168.1.10:1234'
  },
  BLUEBUBBLES_PASSWORD: {
    label: '服务器密码',
    help: 'BlueBubbles 服务器密码（BlueBubbles Server → 设置 → API）'
  },
  BLUEBUBBLES_ALLOWED_USERS: {
    label: '允许的 iMessage 地址',
    help: '推荐，逗号分隔的 iMessage 地址（邮箱或电话号码）'
  },
  HASS_URL: {
    label: 'Home Assistant URL',
    help: 'Home Assistant 基础 URL',
    placeholder: 'http://homeassistant.local:8123'
  },
  HASS_TOKEN: { label: '长期访问令牌', help: 'Home Assistant 长期访问令牌' },
  EMAIL_ADDRESS: { label: '邮箱地址', help: '邮箱账户地址' },
  EMAIL_PASSWORD: { label: '邮箱密码', help: '邮箱账户密码 / 应用专用密码' },
  EMAIL_IMAP_HOST: { label: 'IMAP 主机', help: '收件轮询使用的 IMAP 主机', placeholder: 'imap.gmail.com' },
  EMAIL_SMTP_HOST: { label: 'SMTP 主机', help: '发件使用的 SMTP 主机', placeholder: 'smtp.gmail.com' },
  EMAIL_ALLOWED_USERS: { label: '允许的邮箱地址', help: '推荐，允许与机器人对话的邮箱地址，逗号分隔' },
  EMAIL_HOME_ADDRESS: { label: '主页地址', help: 'cron / 通知投递的默认邮箱地址' },
  EMAIL_SMTP_PORT: { label: 'SMTP 端口', help: 'SMTP 端口（默认 587）' },
  TWILIO_ACCOUNT_SID: { label: 'Twilio Account SID', help: '来自 Twilio 控制台的 Account SID' },
  TWILIO_AUTH_TOKEN: { label: 'Twilio Auth Token', help: '来自 Twilio 控制台的 Auth Token' },
  TWILIO_PHONE_NUMBER: { label: 'Twilio 电话号码', help: '可发送短信的 Twilio 号码（E.164 格式）' },
  DINGTALK_CLIENT_ID: { label: 'Client ID (App Key)', help: '钉钉应用的 App Key（Client ID）' },
  DINGTALK_CLIENT_SECRET: { label: 'Client Secret', help: '钉钉应用的 App Secret（Client Secret）' },
  DINGTALK_ALLOWED_USERS: {
    label: '允许的用户',
    help: '允许与机器人对话的员工 / 发送者 ID，逗号分隔（* 表示任何人）'
  },
  DINGTALK_HOME_CHANNEL: { label: '主页会话 ID', help: 'cron / 通知投递的默认会话 ID' },
  DINGTALK_HOME_CHANNEL_NAME: { label: '主页会话名称', help: '钉钉主页会话的显示名称' },
  DINGTALK_WEBHOOK_URL: {
    label: '群机器人 Webhook URL',
    help: '用于跨平台 / cron 投递的固定群机器人 Webhook URL（可选）'
  },
  FEISHU_APP_ID: { label: 'App ID', help: '飞书 / Lark 应用的 App ID' },
  FEISHU_APP_SECRET: { label: 'App Secret', help: '飞书 / Lark 应用的 App Secret' },
  FEISHU_ENCRYPT_KEY: { label: '加密密钥 (Encrypt Key)', help: '飞书 / Lark 事件加密密钥' },
  FEISHU_VERIFICATION_TOKEN: { label: '校验令牌 (Verification Token)', help: '飞书 / Lark 事件校验令牌' },
  FEISHU_ALLOWED_USERS: { label: '允许的用户 ID', help: '推荐，允许与机器人对话的飞书用户 ID，逗号分隔' },
  FEISHU_ALLOW_ALL_USERS: { label: '允许所有飞书用户', help: '仅用于开发，任何飞书用户都能触发机器人' },
  FEISHU_DOMAIN: { label: '域 (feishu/lark)', help: 'feishu（中国版）或 lark（国际版）' },
  FEISHU_HOME_CHANNEL: { label: '主页群聊 ID', help: 'cron / 通知投递的默认群聊 ID' },
  FEISHU_HOME_CHANNEL_NAME: { label: '主页群聊名称', help: '飞书主页群聊的显示名称' },
  WECOM_BOT_ID: { label: '机器人 ID', help: '企业微信智能机器人的 bot ID' },
  WECOM_SECRET: { label: '机器人 Secret', help: '企业微信智能机器人的 secret' },
  WECOM_CALLBACK_CORP_ID: { label: '企业 ID (Corp ID)', help: '企业微信回调模式的企业 ID（自建应用）' },
  WECOM_CALLBACK_CORP_SECRET: { label: '应用 Secret', help: '企业微信回调模式的应用 Secret' },
  WECOM_CALLBACK_AGENT_ID: { label: '应用 Agent ID', help: '企业微信回调模式的应用 Agent ID' },
  WECOM_CALLBACK_TOKEN: { label: '回调 Token', help: '企业微信回调校验 Token' },
  WECOM_CALLBACK_ENCODING_AES_KEY: {
    label: 'EncodingAESKey',
    help: '用于消息加解密的企业微信回调 EncodingAESKey'
  },
  WEIXIN_ACCOUNT_ID: {
    label: 'iLink Bot 账号 ID',
    help: '通过 hermes gateway setup 扫码登录获得的 iLink Bot 账号 ID'
  },
  WEIXIN_TOKEN: { label: 'iLink Bot 令牌', help: '通过 hermes gateway setup 扫码登录获得的 iLink Bot 令牌' },
  WEIXIN_BASE_URL: {
    label: 'iLink API 基础 URL',
    help: '扫码登录保存的 iLink API 基础 URL（默认 https://ilinkai.weixin.qq.com）'
  },
  QQ_APP_ID: { label: 'App ID', help: '来自 QQ 开放平台 (q.qq.com) 的机器人 App ID' },
  QQ_CLIENT_SECRET: { label: 'Client Secret', help: '来自 QQ 开放平台的机器人 Client Secret' },
  QQ_ALLOWED_USERS: { label: '允许的 QQ 用户', help: '推荐，允许使用机器人的 QQ 用户 ID，逗号分隔' },
  QQ_GROUP_ALLOWED_USERS: { label: '允许的 QQ 群', help: '允许与机器人互动的 QQ 群 ID，逗号分隔' },
  QQ_SANDBOX: { label: '沙箱模式', help: '启用 QQ 沙箱模式用于开发测试（true/false）' },
  API_SERVER_ENABLED: {
    label: '启用 API 服务器',
    help: '启用兼容 OpenAI 的 API 服务器（true/false），供 Open WebUI、LobeChat 等前端连接'
  },
  API_SERVER_KEY: {
    label: '鉴权密钥',
    help: 'API 服务器认证用的 Bearer 令牌，启用 API 服务器时必填，缺失时服务器拒绝启动'
  },
  API_SERVER_PORT: { label: '端口', help: 'API 服务器端口（默认 8642）' },
  API_SERVER_HOST: {
    label: '监听地址',
    help: 'API 服务器的绑定地址（默认 127.0.0.1），即使只绑定本机回环地址也需要设置鉴权密钥'
  },
  API_SERVER_MODEL_NAME: {
    label: '模型名称',
    help: '在 /v1/models 上公布的模型名，默认为配置档案名（默认档案则为 hermes-agent），适合搭配 OpenWebUI 的多用户场景'
  },
  WEBHOOK_ENABLED: { label: '启用 Webhook', help: '启用 Webhook 平台适配器，接收来自 GitHub、GitLab 等的事件' },
  WEBHOOK_PORT: { label: '端口', help: 'Webhook HTTP 服务器端口（默认 8644）' },
  WEBHOOK_SECRET: {
    label: '签名密钥',
    help: '用于 Webhook 签名校验的全局 HMAC 密钥（可在 config.yaml 中按路由覆盖）'
  },
  IRC_SERVER: {
    label: 'IRC 服务器',
    help: 'IRC 服务器主机名（如 irc.libera.chat）',
    placeholder: 'irc.libera.chat'
  },
  IRC_CHANNEL: { label: 'IRC 频道', help: '要加入的 IRC 频道（如 #hermes）' },
  IRC_NICKNAME: { label: '机器人昵称', help: '机器人在 IRC 上的昵称（默认 hermes-bot）' },
  IRC_SERVER_PASSWORD: { label: '服务器密码', help: 'IRC 服务器密码（如需要）' },
  IRC_NICKSERV_PASSWORD: { label: 'NickServ 密码', help: '用于昵称认证的 NickServ 密码' },
  IRC_PORT: { label: 'IRC 端口', help: 'IRC 服务器端口（默认：TLS 6697，非 TLS 6667）' },
  IRC_USE_TLS: { label: '使用 TLS', help: 'IRC 连接使用 TLS（1/true/yes 启用，端口 6697 时默认启用）' },
  IRC_ALLOWED_USERS: { label: '允许的昵称', help: '允许与机器人对话的 IRC 昵称，逗号分隔' },
  IRC_ALLOW_ALL_USERS: { label: '允许所有用户', help: '仅用于开发，允许频道中任何人与机器人对话' },
  IRC_HOME_CHANNEL: { label: '主页频道', help: 'cron / 通知投递的频道（默认使用 IRC_CHANNEL）' },
  GOOGLE_CHAT_SERVICE_ACCOUNT_JSON: {
    label: '服务账号 JSON',
    help: '服务账号 JSON 密钥的路径（或内联 JSON），留空则在 Cloud Run / GCE 上使用应用默认凭据（ADC），回退到 GOOGLE_APPLICATION_CREDENTIALS'
  },
  GOOGLE_CHAT_HTTP_EVENTS_URL: { label: 'HTTP 事件回调 URL', help: '用于 Chat 消息事件的已认证 HTTP 端点' },
  GOOGLE_CHAT_HTTP_EVENTS_AUDIENCE: {
    label: 'HTTP 事件令牌受众',
    help: 'Google 签名 HTTP 事件 Bearer 令牌的期望受众，默认为 GOOGLE_CHAT_HTTP_EVENTS_URL'
  },
  GOOGLE_CHAT_HTTP_EVENTS_SERVICE_ACCOUNT_EMAIL: {
    label: 'HTTP 事件服务账号邮箱',
    help: 'HTTP 事件 Bearer 令牌期望的 Google 服务账号邮箱'
  },
  GOOGLE_CHAT_PROJECT_ID: {
    label: 'GCP 项目 ID',
    help: '可选 Pub/Sub 入站模式的 GCP 项目 ID，回退到 GOOGLE_CLOUD_PROJECT'
  },
  GOOGLE_CHAT_SUBSCRIPTION_NAME: { label: 'Pub/Sub 订阅名', help: '拉取模式入站事件的可选 Pub/Sub 订阅路径' },
  GOOGLE_CHAT_ALLOWED_USERS: { label: '允许的用户邮箱', help: '允许与机器人交互的用户邮箱，逗号分隔' },
  GOOGLE_CHAT_HOME_CHANNEL: { label: '主页空间 ID', help: 'cron / 通知投递的默认空间（如 spaces/AAAA...）' },
  LINE_CHANNEL_ACCESS_TOKEN: {
    label: '频道访问令牌',
    help: 'LINE 频道长期访问令牌（LINE Developers 控制台 > Messaging API > Channel access token）'
  },
  LINE_CHANNEL_SECRET: { label: '频道密钥', help: 'LINE 频道密钥（用于 HMAC-SHA256 Webhook 签名校验）' },
  LINE_PORT: { label: 'Webhook 端口', help: 'Webhook 监听端口（默认 8646）' },
  LINE_HOST: { label: 'Webhook 主机', help: 'Webhook 绑定主机（默认未设置 → 双栈，所有接口 IPv4+IPv6）' },
  LINE_PUBLIC_URL: {
    label: '公开 HTTPS 基础 URL',
    help: '向 LINE 提供图片/音频/视频的公开 HTTPS 基础 URL（如 https://my-tunnel.example.com），绑定地址无法直接访问时发送媒体必需'
  },
  LINE_ALLOWED_USERS: { label: '允许的用户 ID', help: '允许私信机器人的 LINE 用户 ID（U 开头），逗号分隔' },
  LINE_ALLOWED_GROUPS: { label: '允许的群组 ID', help: '机器人会响应的 LINE 群组 ID（C 开头），逗号分隔' },
  LINE_ALLOWED_ROOMS: { label: '允许的聊天室 ID', help: '机器人会响应的 LINE 聊天室 ID（R 开头），逗号分隔' },
  LINE_ALLOW_ALL_USERS: {
    label: '允许所有用户',
    help: '仅用于开发，允许任何 LINE 用户与机器人对话（停用允许列表）'
  },
  LINE_HOME_CHANNEL: { label: '主页频道 ID', help: 'cron / 通知投递的默认用户/群组/聊天室 ID' },
  LINE_SLOW_RESPONSE_THRESHOLD: {
    label: '慢响应阈值（秒）',
    help: '触发慢 LLM postback 按钮前的秒数（默认 45，设 0 禁用并始终使用 Push 回退）'
  },
  NTFY_TOPIC: { label: '订阅主题', help: '要订阅的主题名（如 hermes-in）' },
  NTFY_SERVER_URL: { label: '服务器 URL', help: 'ntfy 服务器 URL（默认 https://ntfy.sh）' },
  NTFY_TOKEN: { label: '认证令牌', help: 'Bearer 令牌或用于 Basic 认证的 user:pass（可选）' },
  NTFY_PUBLISH_TOPIC: { label: '发布主题', help: '回复发布到的主题（默认使用 NTFY_TOPIC）' },
  NTFY_MARKDOWN: { label: '启用 Markdown', help: '发送回复时带 X-Markdown: true 头（true/false，默认 false）' },
  NTFY_ALLOWED_USERS: { label: '允许的主题名', help: '允许的主题名（允许列表），逗号分隔' },
  NTFY_ALLOW_ALL_USERS: { label: '允许所有主题', help: '仅用于开发，允许任何主题与机器人对话（停用允许列表）' },
  NTFY_HOME_CHANNEL: { label: '主页主题', help: 'cron / 通知投递的默认主题' },
  NTFY_HOME_CHANNEL_NAME: { label: '主页主题名称', help: '主页频道的显示名称（默认使用主题名）' },
  PHOTON_PROJECT_ID: {
    label: 'Spectrum 项目 ID',
    help: 'Spectrum 项目 ID（项目的 spectrumProjectId，由 hermes photon setup 设置）'
  },
  PHOTON_PROJECT_SECRET: {
    label: '项目密钥',
    help: '与 Spectrum 项目 ID 配对的项目密钥（由 hermes photon setup 设置）'
  },
  PHOTON_SIDECAR_PORT: { label: 'Sidecar 控制端口', help: 'Node sidecar 控制与入站通道的回环端口（默认 8789）' },
  PHOTON_SIDECAR_AUTOSTART: {
    label: '自动启动 Sidecar',
    help: '连接时自动拉起 Node sidecar（true/false，默认 true）'
  },
  PHOTON_NODE_BIN: { label: 'Node 可执行文件路径', help: 'node 二进制的路径（默认取 PATH 中的 node）' },
  PHOTON_DASHBOARD_HOST: {
    label: 'Dashboard 主机',
    help: 'Photon Dashboard API 主机（默认 https://app.photon.codes）'
  },
  PHOTON_SPECTRUM_HOST: {
    label: 'Spectrum API 主机',
    help: 'Photon Spectrum API 主机（默认 https://spectrum.photon.codes）'
  },
  PHOTON_ALLOWED_USERS: { label: '允许的用户', help: '允许与机器人对话的 E.164 电话号码，逗号分隔' },
  PHOTON_ALLOW_ALL_USERS: { label: '允许所有用户', help: '仅用于开发，允许任何发送者触发机器人（停用允许列表）' },
  PHOTON_REQUIRE_MENTION: {
    label: '群聊需要提及',
    help: '忽略群聊消息，除非命中提及唤醒词（true/false，默认 false）'
  },
  PHOTON_MENTION_PATTERNS: {
    label: '群聊提及模式',
    help: '群聊的提及唤醒词正则（JSON 列表或逗号/换行分隔，默认使用 Hermes 唤醒词）'
  },
  PHOTON_HOME_CHANNEL: {
    label: '主页 Photon 目标',
    help: 'cron / 通知投递的默认 Photon 目标：Spectrum 空间 ID、DM GUID 或纯 E.164 电话号码'
  },
  PHOTON_HOME_CHANNEL_NAME: { label: '主页频道名称', help: '主页频道的显示名称' },
  PHOTON_TELEMETRY: {
    label: '启用 Spectrum 遥测',
    help: '在 sidecar 中启用 Spectrum SDK 遥测（true/false，默认 false，可用 hermes photon telemetry on|off 切换）'
  },
  PHOTON_MARKDOWN: {
    label: '以 Markdown 渲染回复',
    help: '以 Markdown 发送回复 — iMessage 原生渲染，其他 Spectrum 平台降级为纯文本（true/false，默认 true）'
  },
  PHOTON_REACTIONS: {
    label: '启用回应表情',
    help: '用 👀/👍/👎 回应消息表示处理状态，并把机器人消息上的回应转给代理（true/false，默认 false）'
  },
  SIMPLEX_WS_URL: {
    label: '守护进程 WebSocket URL',
    help: 'simplex-chat 守护进程的 WebSocket URL（如 ws://127.0.0.1:5225）'
  },
  SIMPLEX_ALLOWED_USERS: { label: '允许的联系人 ID', help: '允许与机器人对话的 SimpleX 联系人 ID，逗号分隔' },
  SIMPLEX_ALLOW_ALL_USERS: {
    label: '允许所有联系人',
    help: '仅用于开发，允许任何联系人与机器人对话（停用允许列表）'
  },
  SIMPLEX_AUTO_ACCEPT: { label: '自动接受联系人请求', help: '自动接受收到的联系人请求（默认 true）' },
  SIMPLEX_GROUP_ALLOWED: {
    label: '允许的群组 ID',
    help: '机器人参与的 SimpleX 群组 ID（逗号分隔），或 * 允许任意群组，省略则完全忽略群消息（更安全的默认 — 否则群里机器人会处理每个成员的消息）'
  },
  SIMPLEX_HOME_CHANNEL: { label: '主页联系人/群组 ID', help: 'cron / 通知投递的默认联系人/群组 ID' },
  SIMPLEX_HOME_CHANNEL_NAME: { label: '主页频道名称', help: '主页频道的显示名称（默认使用 ID）' },
  HERMES_SIMPLEX_TEXT_BATCH_DELAY: {
    label: '文本合批延迟（秒）',
    help: '把连续快速到达的入站文本合并为单条消息事件的静默期秒数（默认 0.8） — 与 Telegram 的文本合批相同'
  },
  SMS_ALLOWED_USERS: { label: '允许的号码', help: '允许与机器人对话的电话号码，逗号分隔' },
  SMS_HOME_CHANNEL: { label: '主页号码', help: 'cron / 通知投递的默认电话号码' },
  TEAMS_CLIENT_ID: { label: 'Azure AD 客户端 ID', help: 'Azure AD 应用（Bot Framework）客户端 ID' },
  TEAMS_CLIENT_SECRET: { label: 'Azure AD 客户端密钥', help: 'Azure AD 应用客户端密钥' },
  TEAMS_TENANT_ID: { label: 'Azure AD 租户 ID', help: '托管机器人应用的 Azure AD 租户 ID' },
  TEAMS_PORT: { label: 'Webhook 端口', help: 'Webhook 监听端口（Bot Framework 默认 3978）' },
  TEAMS_HOST: { label: 'Webhook 主机', help: 'Webhook 绑定主机（默认未设置 → 双栈，所有接口 IPv4+IPv6）' },
  TEAMS_ALLOWED_USERS: { label: '允许的用户', help: '允许与机器人对话的 Teams 用户 ID / UPN，逗号分隔' },
  TEAMS_ALLOW_ALL_USERS: { label: '允许所有用户', help: '仅用于开发，任何 Teams 用户都能触发机器人' },
  TEAMS_REQUIRE_MENTION: {
    label: 'Teams 要求提及',
    help: '仅回复在频道或群聊中 @提及机器人或回复机器人的消息（默认关闭，应用获得 RSC 消息读取许可后需要启用）'
  },
  TEAMS_HOME_CHANNEL: { label: '主页频道', help: 'cron / 通知投递的默认聊天/频道 ID' },
  TEAMS_HOME_CHANNEL_NAME: { label: '主页频道名称', help: 'Teams 主页频道的显示名称' },
  WECOM_WEBSOCKET_URL: { label: 'WebSocket URL', help: '企业微信智能机器人 WebSocket URL' },
  WECOM_HOME_CHANNEL: { label: '主页会话 ID', help: 'cron / 通知投递的默认聊天 ID' },
  WECOM_ALLOWED_USERS: { label: '允许的用户', help: '允许与机器人对话的企业微信用户 ID，逗号分隔' },
  A2A_AGENT_NAME: {
    label: 'A2A 代理名称',
    help: '在此代理的 Agent Card 上公布的名称（默认：主机名派生）',
    placeholder: 'A2A 代理名称'
  },
  A2A_BEARER_TOKEN: {
    label: 'A2A 共享令牌（空则仅限本地）',
    help: '入站 A2A 调用的共享令牌（身份回退到调用方 IP），不设任何令牌则仅绑定 127.0.0.1',
    placeholder: 'A2A 共享令牌（空则仅限本地）'
  },
  A2A_HOST: {
    label: 'A2A 绑定主机（默认 127.0.0.1）',
    help: '入站绑定主机，默认 127.0.0.1，仅在设置了令牌且在此处选择时才扩展到 0.0.0.0',
    placeholder: 'A2A 绑定主机（默认 127.0.0.1）'
  },
  A2A_PORT: {
    label: 'A2A 端口（默认 9900）',
    help: '入站 A2A 服务器端口（默认 9900）',
    placeholder: 'A2A 端口（默认 9900）'
  },
  A2A_PEER_TOKENS: {
    label: 'A2A 对等令牌（name:token，逗号分隔，或留空）',
    help: '每个对等代理的令牌（如 alice:tok1,bob:tok2），匹配的名称用于限速、信任和审计',
    placeholder: 'A2A 对等令牌（name:token，逗号分隔，或留空）'
  },
  A2A_HOME_CHANNEL: {
    label: 'A2A 主页频道（或留空）',
    help: 'cron / 通知投递时 deliver=a2a 使用的任务/上下文 ID'
  },
  A2A_ALLOW_ALL_USERS: {
    label: '允许所有 A2A 对等代理',
    help: '允许任何已认证的 A2A 对等代理访问此代理（仅限开发）'
  },
  RAFT_PROFILE: {
    label: 'Raft 代理 profile',
    help: 'Raft 代理 profile slug — 设置后自动启用适配器',
    placeholder: 'Raft 代理 profile'
  },
  BUZZ_RELAY_URL: {
    label: 'Buzz 中继 URL',
    help: 'Buzz 社区中继的基础 URL（如 https://mycommunity.communities.buzz.xyz）',
    placeholder: 'Buzz 中继 URL'
  },
  BUZZ_PRIVATE_KEY: {
    label: 'Nostr 私钥（nsec 或 hex）',
    help: '代理 Buzz 身份的 Nostr 私钥（nsec 或 hex） — 唯一的 Buzz 密钥'
  },
  BUZZ_CLI_PATH: {
    label: 'buzz CLI 路径（或留空）',
    help: 'buzz CLI 二进制文件路径（默认：PATH 中的 buzz，然后是 ~/bin/buzz）'
  },
  BUZZ_CHANNELS: {
    label: '频道 UUID（逗号分隔）',
    help: '要监听的频道 UUID，逗号分隔（默认：所有已加入的频道）'
  },
  BUZZ_HOME_CHANNEL: {
    label: '主页频道 UUID（或留空）',
    help: 'cron / 通知投递的频道 UUID（默认使用第一个监听的频道）'
  },
  BUZZ_ALLOWED_USERS: { label: '允许的用户（逗号分隔）', help: '允许与代理对话的 npub 或 hex 公钥，逗号分隔' },
  BUZZ_ALLOW_ALL_USERS: {
    label: '允许所有用户？（true/false）',
    help: '允许任何社区成员与代理对话（true/false）'
  },
  BUZZ_TRANSPORT: {
    label: '传输方式（auto/websocket/poll）',
    help: '入站传输方式：auto（WebSocket 带轮询回退，默认）、websocket 或 poll'
  },
  BUZZ_POLL_INTERVAL: { label: '轮询间隔秒数', help: '入站轮询扫描间隔秒数（默认 4）' },
  BUZZ_AUTH_TAG: {
    label: 'NIP-OA auth tag JSON（或留空）',
    help: '用于 NIP-42 WebSocket 认证的可选 NIP-OA 所有者证明 auth tag JSON'
  },
  BUZZ_CREDENTIALS_FILE: {
    label: '凭证文件路径（或留空）',
    help: '保存 nsec 的 JSON 凭证文件（当 BUZZ_PRIVATE_KEY 未设置时作为回退）'
  },
  BUZZ_REPLY_IN_THREAD: {
    label: '在线程中回复？（true/false）',
    help: '在触发消息下方以线程形式回复（true/false，默认 true），设为 false 时直接发布到频道时间线'
  },
  PHOTON_READ_RECEIPTS: {
    label: '发送已读回执？（true/false）',
    help: '转发给 Hermes 后，将收到的 iMessage 标记为已读（true/false，默认 true）'
  },
  TELEGRAM_WEBHOOK_SECRET: {
    label: 'Webhook 密钥',
    help: 'Telegram 随每次 Webhook 更新一同发送的密钥令牌（设置了 TELEGRAM_WEBHOOK_URL 时必需）'
  },
  EMAIL_AUTHSERV_ID: {
    label: '收件 MTA 的 authserv-id',
    help: '邮件服务器最顶层 Authentication-Results 头里的 authserv-id 原文，例如 mx.google.com（除非 EMAIL_TRUST_FROM_HEADER=true，否则必需）'
  },
  A2A_PUSH_SECRET: {
    label: 'A2A 推送签名密钥（或留空）',
    help: '为推送通知签名的 HMAC 密钥（默认使用 A2A 共享令牌）'
  },
  PHOTON_SIDECAR_TOKEN: {
    label: 'Sidecar 令牌',
    help: '回环 sidecar 通道的共享密钥（默认每次启动随机生成）'
  },
  TEAMS_GRAPH_ACCESS_TOKEN: {
    label: 'Graph 访问令牌（或留空）',
    help: 'graph 模式下投递会议纪要所用的 Microsoft Graph 访问令牌'
  },
  TEAMS_INCOMING_WEBHOOK_URL: {
    label: '传入 Webhook URL（或留空）',
    help: 'webhook 模式下投递会议纪要所用的传入 Webhook URL（这个 URL 本身就是凭据）'
  }
}
