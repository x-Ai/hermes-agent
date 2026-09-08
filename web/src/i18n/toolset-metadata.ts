import type { Locale } from "./types";

/**
 * Capability metadata mirrors the Simplified Chinese copy used by Desktop's
 * Skills/Toolsets surface. Stable ids and environment-variable names remain
 * unchanged; only user-facing labels and explanatory prose are localized.
 */
const ZH_TOOLSET_LABELS: Record<string, string> = {
  web: "网页搜索与抓取",
  browser: "浏览器自动化",
  terminal: "终端与进程",
  file: "文件操作",
  code_execution: "代码执行",
  vision: "视觉 / 图像分析",
  video: "视频分析",
  image_gen: "图像生成",
  video_gen: "视频生成",
  x_search: "X (Twitter) 搜索",
  tts: "文字转语音",
  stt: "语音转文字",
  skills: "技能",
  todo: "任务规划",
  memory: "记忆",
  context_engine: "上下文引擎",
  session_search: "会话搜索",
  clarify: "澄清问题",
  delegation: "任务委派",
  cronjob: "定时任务",
  discord: "Discord（阅读/参与）",
  discord_admin: "Discord 服务器管理",
  yuanbao: "元宝",
  computer_use: "电脑操控 (macOS/Windows/Linux)"
};

const ZH_TOOLSET_DESCRIPTIONS: Record<string, string> = {
  a2a:
    "Hermes Agent 支持 Linux 基金会 A2A v1.0 标准，实现双向代理通信：出站支持代理发现、Agent Card 获取及 JSON-RPC 任务发送；入站通过 /.well-known/agent-card.json 暴露服务，并将任务路由至保留完整记忆与上下文的实时会话。未配置 Bearer Token 时仅监听 localhost；通信全程执行入站过滤、出站凭据清理及独立审计。仅依赖 Python 标准库，无需 a2a-sdk",
  clarify: "向用户提出澄清问题（选择题或开放式）",
  code_execution: "运行以编程方式调用工具的 Python 脚本（减少 LLM 往返）",
  coding: "面向编码的工具集：文件、终端、搜索、网页文档、技能、待办、委派、视觉、浏览器",
  computer_use:
    "通过 cua-driver 后台控制桌面（macOS/Windows/Linux） — 截图、鼠标、键盘、滚动、拖拽，不会抢占用户的光标或键盘焦点，适用于任何支持工具调用的模型",
  context_engine: "由当前上下文引擎暴露的运行时工具",
  cronjob: "定时任务管理工具 — 创建、列出、更新、暂停、恢复、删除和触发计划任务",
  debugging: "调试与故障排查工具箱",
  delegation: "为复杂子任务派生具有隔离上下文的子代理",
  discord: "Discord 阅读与参与工具（获取消息、搜索成员、创建线程）",
  discord_admin: "Discord 服务器管理（列出频道/角色、置顶消息、分配角色）",
  feishu_doc: "读取飞书 / Lark 文档内容",
  feishu_drive: "飞书 / Lark 文档评论操作（列出、回复、添加）",
  file: "文件操作工具：读取、写入、补丁（支持模糊匹配）和搜索（内容 + 文件）",
  "hermes-acp": "编辑器集成（VS Code、Zed、JetBrains） — 面向编码的工具，不含消息、音频或澄清 UI",
  "hermes-api-server":
    "兼容 OpenAI 的 API 服务器 — 通过 HTTP 访问全部代理工具（不含 clarify、send_message 等交互式 UI 工具）",
  "hermes-bluebubbles": "BlueBubbles iMessage 机器人工具集 — 通过本地 BlueBubbles 服务器使用 Apple iMessage",
  "hermes-cli": "完整交互式 CLI 工具集 — 全部默认工具外加定时任务管理",
  "hermes-cron": "默认 cron 工具集 — 与 hermes-cli 相同的核心工具，由 hermes tools 控制",
  "hermes-dingtalk": "钉钉机器人工具集 — 企业消息平台（完全访问）",
  "hermes-discord": "Discord 机器人工具集 — 完全访问（终端有危险命令审批安全检查）",
  "hermes-email": "邮件机器人工具集 — 通过电子邮件 (IMAP/SMTP) 与 Hermes 交互",
  "hermes-feishu": "飞书 / Lark 机器人工具集 — 通过飞书 / Lark 的企业消息（完全访问）",
  "hermes-gateway": "网关工具集 — 所有消息平台工具的并集",
  "hermes-homeassistant": "Home Assistant 机器人工具集 — 智能家居事件监控与控制",
  "hermes-matrix": "Matrix 机器人工具集 — 去中心化加密消息（完全访问）",
  "hermes-mattermost": "Mattermost 机器人工具集 — 自托管团队消息（完全访问）",
  "hermes-qqbot": "QQ 机器人工具集 — 通过官方 Bot API v2 的 QQ 消息（完全访问）",
  "hermes-signal": "Signal 机器人工具集 — 加密消息平台（完全访问）",
  "hermes-slack": "Slack 机器人工具集 — 工作区使用的完全访问（终端有安全检查）",
  "hermes-sms": "短信机器人工具集 — 通过短信 (Twilio) 与 Hermes 交互",
  "hermes-telegram": "Telegram 机器人工具集 — 个人使用的完全访问（终端有安全检查）",
  "hermes-webhook": "Webhook 工具集 — 接收并处理外部 Webhook 事件",
  "hermes-wecom": "企业微信机器人工具集 — 企业微信消息（完全访问）",
  "hermes-wecom-callback": "企业微信回调工具集 — 企业自建应用消息（完全访问）",
  "hermes-weixin": "微信机器人工具集 — 通过 iLink 的个人微信消息（完全访问）",
  "hermes-whatsapp": "WhatsApp 机器人工具集 — 类似 Telegram（个人消息，更受信任）",
  "hermes-yuanbao": "元宝消息平台工具集 — 群信息、成员查询、私聊、贴纸表情",
  homeassistant: "Home Assistant 智能家居控制与监控",
  image_gen: "创意生成工具（图像）",
  kanban:
    "看板多代理协同 — 仅当代理由看板调度器派生（设置了 HERMES_KANBAN_TASK 环境变量）时启用。调度器默认在网关内运行；见 config.yaml 的 kanban.dispatch_in_gateway。让工作代理以结构化交接完成任务、阻塞等待人工输入、长操作期间发送心跳、在线程中评论、附加文件，（编排者还可）列出、解除阻塞和分发任务",
  memory: "跨会话持久记忆（个人笔记 + 用户画像）",
  project: "桌面项目 — 创建/切换命名工作区（仅 GUI 会话）",
  safe: "不含终端访问的安全工具箱",
  search: "仅网页搜索（不含内容提取/抓取）",
  session_search: "搜索并回忆过往对话，支持摘要",
  skills: "访问、创建、编辑和管理带有专门指令与知识的技能文档",
  spotify: "原生 Spotify 播放、搜索、歌单、专辑和曲库工具",
  stt: "语音转文字：语音转写（网关语音消息与语音模式）",
  terminal: "终端/命令执行与进程管理工具",
  todo: "多步骤工作的任务规划与跟踪",
  tts: "文字转语音：用 Edge TTS（免费）、ElevenLabs、OpenAI 或 xAI 将文字转为音频",
  video: "视频分析与理解工具（选择启用，不在默认工具集中）",
  video_gen:
    "视频生成工具：单个 video_generate 工具覆盖文生视频（仅提示词）和图生视频（提示词 + image_url），以及参考生视频。提供方专属的编辑/扩展工作流可能以独立工具出现，通过 hermes tools → Video Generation 配置",
  vision: "图像分析与视觉工具",
  web: "网页搜索与内容提取",
  x_search:
    "通过 xAI 内置的 x_search Responses 工具搜索 X (Twitter) 帖子和线程，配置 xAI 凭据（SuperGrok OAuth 或 XAI_API_KEY）后可用，默认关闭。在 hermes tools → X (Twitter) Search 中启用",
  yuanbao: "元宝平台工具 — 群信息、成员查询、私聊、贴纸"
};

const ZH_BADGE_TOKENS: Record<string, string> = {
  recommended: "推荐",
  free: "免费",
  "free tier": "免费档",
  "key optional": "密钥可选",
  local: "本地",
  "no Chromium": "无需 Chromium",
  "self-hosted": "自托管",
  paid: "付费",
  preview: "预览",
  subscription: "订阅",
  "no key": "免密钥",
  "search only": "仅搜索",
  "optional gateway": "可选网关",
  "keyless/paid": "免密钥/付费",
  cloud: "云端"
};

const ZH_PROVIDER_TAGS: Record<string, string> = {
  "30 prebuilt voices, controllable via prompts": "30 种预置语音，可通过提示词控制",
  "Anti-detection browser (Firefox/Camoufox)": "反检测浏览器 (Firefox/Camoufox)",
  "Background computer-use via cua-driver — does NOT steal your cursor or focus. Works with any model.":
    "通过 cua-driver 后台控制电脑 — 不会抢占你的光标或焦点。适用于任何模型",
  "Browser login at accounts.x.ai — no API key required": "在 accounts.x.ai 浏览器登录 — 无需 API 密钥",
  "Chatterbox, Qwen3-TTS, … — live catalog from api.deepinfra.com":
    "Chatterbox、Qwen3-TTS 等 — 来自 api.deepinfra.com 的实时目录",
  "Direct xAI API billing via XAI_API_KEY": "通过 XAI_API_KEY 直接按 xAI API 计费",
  "Good quality, no API key needed": "音质不错，无需 API 密钥",
  "Grok voices — uses xAI Grok OAuth or XAI_API_KEY": "Grok 语音 — 使用 xAI Grok OAuth 或 XAI_API_KEY",
  "Headless Chromium, no API key needed": "无头 Chromium，无需 API 密钥",
  "High quality voices": "高质量语音",
  "Hosted Langfuse (cloud.langfuse.com)": "托管版 Langfuse (cloud.langfuse.com)",
  "Lightweight local ONNX TTS (~25MB), no API key": "轻量本地 ONNX TTS（约 25MB），无需 API 密钥",
  "Live STT catalog from api.deepinfra.com": "来自 api.deepinfra.com 的实时 STT 目录",
  "Local neural TTS, 44 languages (voices ~20-90MB)": "本地神经网络 TTS，支持 44 种语言（语音包约 20-90MB）",
  "Managed Browser Use billed to your subscription": "托管 Browser Use，计入你的订阅",
  "Managed FAL image generation billed to your subscription": "托管 FAL 图像生成，计入你的订阅",
  "Managed FAL video generation billed to your subscription": "托管 FAL 视频生成，计入你的订阅",
  "Managed Firecrawl billed to your subscription": "托管 Firecrawl，计入你的订阅",
  "Managed OpenAI TTS billed to your subscription": "托管 OpenAI TTS，计入你的订阅",
  "Managed OpenAI transcription billed to your subscription": "托管 OpenAI 转写，计入你的订阅",
  "voice transcription (gateway voice messages voice mode)": "语音转写（网关语音消息与语音模式）",
  "Most natural voices": "最自然的语音",
  "Multilingual, native Opus": "多语言，原生 Opus",
  "New SOTA web harness (CLI 3.0)": "全新最优 web 执行引擎 (CLI 3.0)",
  "PKCE OAuth — opens the setup wizard": "PKCE OAuth — 将打开设置向导",
  "REST API integration": "REST API 集成",
  "Run your own Firecrawl instance (Docker)": "运行你自己的 Firecrawl 实例 (Docker)",
  "Self-hosted Langfuse instance": "自托管 Langfuse 实例",
  "Whisper large-v3 family — very fast": "Whisper large-v3 系列 — 速度极快",
  "Zig headless browser spawned by Hermes, text-only (no screenshots)":
    "由 Hermes 启动的 Zig 无头浏览器，仅支持文本（不支持截图）",
  "faster-whisper on-device, no API key": "本地 faster-whisper 转写，无需 API 密钥",
  "grok-stt — uses xAI Grok OAuth or XAI_API_KEY": "grok-stt — 使用 xAI Grok OAuth 或 XAI_API_KEY",
  "scribe_v2 — diarization + audio-event tagging": "scribe_v2 — 说话人区分 + 音频事件标注",
  "whisper-1, gpt-4o-transcribe, gpt-transcribe": "whisper-1、gpt-4o-transcribe、gpt-transcribe",
  "Agentic web search via Grok's web_search tool — uses xAI Grok OAuth or XAI_API_KEY.":
    "通过 Grok 的 web_search 工具进行智能体式网页搜索 — 使用 xAI Grok OAuth 或 XAI_API_KEY",
  "Cloud browser with remote execution": "支持远程执行的云端浏览器",
  "Cloud browser with stealth and proxies": "带隐身与代理的云端浏览器",
  "FLUX, Qwen-Image, … — live catalog from api.deepinfra.com":
    "FLUX、Qwen-Image 等 — 来自 api.deepinfra.com 的实时目录",
  "Free, privacy-respecting metasearch. Point SEARXNG_URL at your instance.":
    "免费、尊重隐私的元搜索。把 SEARXNG_URL 指向你的实例",
  "Free-tier API key — 2k queries/mo, search only.": "免费档 API 密钥 — 每月 2000 次查询，仅搜索",
  "Full search + extract; supports direct API and Nous tool-gateway routing.":
    "完整的搜索 + 提取；支持直连 API 和 Nous 工具网关路由",
  "Full search + extract; supports keyless cloud, direct API, and Nous tool-gateway routing.":
    "完整的搜索与提取；支持免密钥云服务、直连 API 和 Nous 工具网关路由",
  "Gemini Flash Image, gpt-image-2, Krea 2, Qwen Image 3 & more via OpenRouter; uses OPENROUTER_API_KEY":
    "通过 OpenRouter 使用 Gemini Flash Image、gpt-image-2、Krea 2、Qwen Image 3 等模型；需要 OPENROUTER_API_KEY",
  "Gemini Flash Image & more via OpenRouter; uses OPENROUTER_API_KEY":
    "经 OpenRouter 使用 Gemini Flash Image 等；使用 OPENROUTER_API_KEY",
  "Image API model (from live OpenRouter catalog)": "图像 API 模型（来自 OpenRouter 实时目录）",
  "Image-output model (from live OpenRouter catalog)": "图像输出模型（来自 OpenRouter 实时目录）",
  "Krea 2 foundation model — Medium ($0.03), Large ($0.06), Medium Turbo ($0.015). Style transfer, moodboards, reference-guided generation. Direct key or managed Nous Subscription gateway.":
    "Krea 2 基础模型 — Medium ($0.03)、Large ($0.06)、Medium Turbo ($0.015)。风格迁移、情绪板、参考引导生成。可直连密钥或经托管 Nous 订阅网关",
  "LTX, Pixverse, Veo 3.1, Seedance 2.0, Kling 4K, Happy Horse — text-to-video & image-to-video":
    "LTX、Pixverse、Veo 3.1、Seedance 2.0、Kling 4K、Happy Horse — 文生视频与图生视频",
  "LTX, Pixverse, Seedance 2.0/2.5/Mini, Veo 3.1, MiniMax H3, FLUX 3, Kling 4K, Happy Horse, Grok Imagine, Gemini Omni — text-to-video & image-to-video":
    "LTX、Pixverse、Seedance 2.0/2.5/Mini、Veo 3.1、MiniMax H3、FLUX 3、Kling 4K、Happy Horse、Grok Imagine、Gemini Omni — 文生视频与图生视频",
  "Muse Image via Meta Model API (api.meta.ai)": "通过 Meta Model API（api.meta.ai）使用 Muse Image",
  "Objective-tuned search + parallel page extraction.": "面向目标调优的搜索 + 并行页面提取",
  "Objective-tuned search + page extraction on Parallel's anonymous free tier. Rate-limited under burst load.":
    "通过 Parallel 匿名免费套餐进行面向目标优化的搜索与页面提取。突发负载下会受到速率限制",
  "Objective-tuned search + parallel page extraction via the Parallel SDK. Unthrottled, guaranteed service.":
    "通过 Parallel SDK 进行面向目标优化的搜索与并行页面提取。无速率限制，服务有保障",
  "Pick from flux-2-klein, flux-2-pro, gpt-image, nano-banana, etc. — text-to-image & image editing":
    "可选 flux-2-klein、flux-2-pro、gpt-image、nano-banana 等 — 文生图与图像编辑",
  "Pick from flux-2-klein, flux-2-pro, gpt-image, nano-banana-2, nano-banana-pro, etc. — text-to-image & image editing":
    "可选 flux-2-klein、flux-2-pro、gpt-image、nano-banana-2、nano-banana-pro 等 — 文生图与图像编辑",
  "Perplexity Search API — ranked, date-stamped web results plus query-relevant page snippets for extract.":
    "Perplexity 搜索 API — 提供按相关性排序且带日期的网页结果，并为内容提取返回与查询相关的页面摘要",
  "Reference-grounded image generation via Nous Portal (OpenRouter-backed)":
    "经 Nous Portal 的参考图像生成（OpenRouter 支撑）",
  "Search + extract in one provider.": "搜索 + 提取一体的提供方",
  "Search + extract. Works keyless; set TAVILY_API_KEY for higher limits.":
    "搜索与提取。无需密钥即可使用；设置 TAVILY_API_KEY 可获得更高限额",
  "Search + extract. Opt-in keyless; set TAVILY_API_KEY for higher limits.":
    "搜索与提取。可选择免密钥使用；设置 TAVILY_API_KEY 可获得更高限额",
  "Search via the ddgs Python package — no API key (pair with any extract provider)":
    "通过 ddgs Python 包搜索 — 无需 API 密钥（可搭配任意提取提供方）",
  "Semantic + neural web search with content extraction.": "语义 + 神经网络网页搜索，带内容提取",
  "Semantic + neural web search with content extraction on Exa's anonymous free tier. Rate-limited under burst load.":
    "通过 Exa 匿名免费套餐进行语义与神经网络网页搜索及内容提取。突发负载下会受到速率限制",
  "Semantic + neural web search with content extraction via the Exa SDK. Unthrottled, guaranteed service.":
    "通过 Exa SDK 进行语义与神经网络网页搜索及内容提取。无速率限制，服务有保障",
  "Independent web index for AI apps — fast search + page fetch on Keenable's anonymous free tier.":
    "面向 AI 应用的独立网页索引 — 通过 Keenable 匿名免费套餐提供快速搜索与页面抓取",
  "Independent web index for AI apps. Keyed access with higher limits and guaranteed service.":
    "面向 AI 应用的独立网页索引。密钥访问具有更高限额和服务保障",
  "Wan, p-video, … — live catalog from api.deepinfra.com; text-to-video & image-to-video":
    "Wan、p-video 等 — 来自 api.deepinfra.com 的实时目录；文生视频与图生视频",
  "gpt-image-2 at low/medium/high quality tiers — text-to-image & image editing":
    "gpt-image-2，低/中/高质量档 — 文生图与图像编辑",
  "gpt-image-2 via ChatGPT/Codex OAuth — no API key required; supports text and image inputs":
    "经 ChatGPT/Codex OAuth 使用 gpt-image-2 — 无需 API 密钥；支持文本与图像输入",
  "grok-imagine-image - text-to-image & image editing; uses xAI Grok OAuth or XAI_API_KEY. xAI Imagine storage is enabled so generated media gets a reusable public URL without an automatic expiry. xAI may bill for stored files and public URL hosting. Disable this with `image_gen.xai.storage.enabled: false` or set `expires_after` to change the retention.":
    "grok-imagine-image — 文生图与图像编辑；使用 xAI Grok OAuth 或 XAI_API_KEY。已启用 xAI Imagine 存储，生成的媒体会获得可复用的公开 URL 且不自动过期。xAI 可能对存储文件和公开 URL 托管计费。可用 `image_gen.xai.storage.enabled: false` 关闭，或设置 `expires_after` 更改保留期",
  "grok-imagine-video for text/reference; grok-imagine-video-1.5 for image-to-video; edit/extend: pass the stored public HTTPS MP4 (`video` / `public_url` from a prior Imagine result); uses xAI Grok OAuth or XAI_API_KEY. xAI Imagine storage is enabled so generated media gets a reusable public URL without an automatic expiry. xAI may bill for stored files and public URL hosting. Disable this with `video_gen.xai.storage.enabled: false` or set `expires_after` to change the retention.":
    "grok-imagine-video 用于文本/参考生成；grok-imagine-video-1.5 用于图生视频；编辑/扩展：传入此前 Imagine 结果的公开 HTTPS MP4（`video` / `public_url`）；使用 xAI Grok OAuth 或 XAI_API_KEY。已启用 xAI Imagine 存储，生成的媒体会获得可复用的公开 URL 且不自动过期。xAI 可能对存储文件和公开 URL 托管计费。可用 `video_gen.xai.storage.enabled: false` 关闭，或设置 `expires_after` 更改保留期",
  "Whisper via OpenRouter API": "经 OpenRouter API 使用 Whisper",
  "No paid tier needed — uses Brave's free API.": "无需付费套餐 — 使用 Brave 免费 API",
  "Ultra-low-latency streaming": "极低延迟流式输出",
  "LTX, Pixverse, Seedance 2.0/2.5/Mini, Veo 3.1, MiniMax H3, FLUX 3, Kling 4K, Happy Horse, Wan 2.2 — text-to-video & image-to-video":
    "LTX、Pixverse、Seedance 2.0/2.5/Mini、Veo 3.1、MiniMax H3、FLUX 3、Kling 4K、Happy Horse、Wan 2.2 — 文生视频与图生视频",
  "A2A (Agent-to-Agent) protocol v1.0 support for Hermes Agent — both directions of the open Linux Foundation standard for inter-agent communication. OUTBOUND (client tools): a2a_discover, a2a_call, a2a_list, a2a_history, and a2a_orchestrate let the agent fetch another agent's Agent Card and send it tasks over JSON-RPC — works with any A2A-compliant peer (Hermes, LangChain, CrewAI, Google ADK, OpenClaw, ...). INBOUND (platform adapter): exposes Hermes as an A2A-discoverable agent. An Agent Card is served at /.well-known/agent-card.json (v1.0 canonical path; legacy agent.json also answers) and incoming tasks are routed into the agent's live gateway session like any other platform — so the agent that replies is the same one talking to its user, with full memory and context, not a throwaway clone. Security is on by default: no bearer Token configured => localhost-only bind. Inbound task text passes through prompt-injection filters; outbound text is scrubbed of credential-shaped strings; every exchange is audit-logged and persisted to disk outside the context-compaction pipeline so conversations survive compaction and restarts. Pure stdlib transport (http.server + urllib) — no a2a-sdk dependency required.":
    "A2A（Agent-to-Agent，智能体间协议）v1.0 支持 Hermes Agent — 实现 Linux 基金会开放标准的双向智能体间通信。OUTBOUND（客户端工具）：a2a_discover、a2a_call、a2a_list、a2a_history 和 a2a_orchestrate 让智能体获取其他智能体的 Agent Card 并通过 JSON-RPC 发送任务 — 兼容任何 A2A 兼容节点（Hermes、LangChain、CrewAI、Google ADK、OpenClaw 等）。INBOUND（平台适配器）：将 Hermes 暴露为可被 A2A 发现的智能体。Agent Card 在 /.well-known/agent-card.json 提供（v1.0 规范路径；旧版 agent.json 也支持），传入任务会被路由到智能体的实时网关会话中，就像其他平台一样 — 因此响应的智能体是与用户对话的同一个，拥有完整内存和上下文，而非临时克隆体。默认开启安全机制：未配置 bearer Token 则仅绑定 localhost。入站任务文本会经过提示注入过滤；出站文本会清洗凭据型字符串；每次交换都会审计日志并持久化到磁盘（不在上下文压缩流程内），因此对话可以在压缩和重启后继续。纯标准库传输（http.server + urllib） — 无需 a2a-sdk 依赖"
};

const ZH_ENV_PROMPTS: Record<string, string> = {
  VOICE_TOOLS_OPENAI_KEY: "OpenAI API 密钥",
  ELEVENLABS_API_KEY: "ElevenLabs API 密钥",
  MISTRAL_API_KEY: "Mistral API 密钥",
  GEMINI_API_KEY: "Gemini API 密钥",
  DEEPINFRA_API_KEY: "DeepInfra API 密钥",
  GROQ_API_KEY: "Groq API 密钥",
  FIRECRAWL_API_URL: "你的 Firecrawl 实例 URL（例如 http://localhost:3002）",
  BRAVE_SEARCH_API_KEY: "Brave Search API 订阅令牌（免费档：每月 2,000 次查询）",
  EXA_API_KEY: "用于 AI 原生网页搜索与内容提取的 Exa API 密钥",
  FIRECRAWL_API_KEY: "用于网页搜索与抓取的 Firecrawl API 密钥（可选，留空则使用免密钥云服务或自托管服务）",
  KEENABLE_API_KEY: "Keenable API 密钥",
  PARALLEL_API_KEY: "用于 AI 原生网页搜索与提取的 Parallel API 密钥",
  PERPLEXITY_API_KEY: "Perplexity API 密钥",
  SEARXNG_URL: "你的 SearXNG 实例 URL（例如 http://localhost:8080）",
  TAVILY_API_KEY: "Tavily API 密钥（可选，选择 Tavily 时可免密钥使用）",
  XAI_API_KEY: "xAI API 密钥",
  CAMOFOX_URL: "Camofox 服务器 URL",
  BROWSERBASE_API_KEY: "Browserbase API 密钥",
  BROWSERBASE_PROJECT_ID: "Browserbase 项目 ID",
  FAL_KEY: "FAL.ai API 密钥",
  KREA_API_KEY: "Krea API 密钥",
  META_MODEL_API_KEY: "Meta Model API 密钥（LLM|... 令牌）",
  OPENAI_API_KEY: "OpenAI API 密钥",
  HASS_TOKEN: "Home Assistant 长期访问令牌",
  HASS_URL: "Home Assistant URL",
  HERMES_LANGFUSE_PUBLIC_KEY: "Langfuse 公钥 (pk-lf-...)",
  HERMES_LANGFUSE_SECRET_KEY: "Langfuse 私钥 (sk-lf-...)",
  HERMES_LANGFUSE_BASE_URL: "Langfuse 服务器 URL（例如 http://localhost:3000）",
  OPENROUTER_API_KEY: "OpenRouter API 密钥"
};

function stripLeadingEmoji(label: string): string {
  return label.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s]+/u, "").trim() || label;
}

export function localizeToolsetLabel(name: string, fallback: string, locale: Locale): string {
  return locale === "zh" ? ZH_TOOLSET_LABELS[name] ?? stripLeadingEmoji(fallback) : stripLeadingEmoji(fallback);
}

export function localizeToolsetDescription(name: string, fallback: string, locale: Locale): string {
  return locale === "zh" ? ZH_TOOLSET_DESCRIPTIONS[name] ?? fallback : fallback;
}

export function localizeToolsetBadge(badge: string, locale: Locale): string {
  if (locale !== "zh") return badge;
  return badge
    .split(" · ")
    .map(part => {
      const starred = part.startsWith("★");
      const token = part.replace(/^★\s*/, "");
      return `${starred ? "★ " : ""}${ZH_BADGE_TOKENS[token] ?? token}`;
    })
    .join(" · ");
}

export function localizeToolsetProviderTag(tag: string, locale: Locale): string {
  return locale === "zh" ? ZH_PROVIDER_TAGS[tag] ?? tag : tag;
}

function genericChineseEnvPrompt(key: string): string {
  const labels: Array<[RegExp, string]> = [
    [/_PUBLIC_KEY$/, "公钥"],
    [/_SECRET_KEY$/, "私钥"],
    [/_API_KEY$/, "API 密钥"],
    [/_PROJECT_ID$/, "项目 ID"],
    [/_ACCESS_TOKEN$/, "访问令牌"],
    [/_TOKEN$/, "令牌"],
    [/_BASE_URL$/, "基础 URL"],
    [/_URL$/, "服务 URL"],
    [/_HOST$/, "服务器地址"]
  ];
  for (const [suffix, label] of labels) {
    if (suffix.test(key)) {
      const owner = key.replace(suffix, "").replaceAll("_", " ").trim();
      return `${owner || key} ${label}`;
    }
  }
  return `${key} 配置值`;
}

export function localizeToolsetEnvPrompt(key: string, fallback: string, locale: Locale): string {
  return locale === "zh" ? ZH_ENV_PROMPTS[key] ?? genericChineseEnvPrompt(key) : fallback;
}
