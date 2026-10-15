import type { Translations } from './types'

type ProvidersCopy = Translations['settings']['providers']

// Provider-card copy keyed by the backend provider catalog (`hermes_cli/provider_catalog.py`,
// surfaced through `/api/env`): `providerLabels` by provider id, `providerDescriptions` by the
// catalog's English label, `envKeys` by the credential / base-URL variables it declares; spread
// into `settings.providers` and `settings.envKeys` in zh.ts. Settings › Providers picks a card's
// blurb as descriptions[label] → PROVIDER_GROUPS overlay → the primary credential's envKeys row,
// and a credential shared by several providers (COMMANDCODE_API_KEY, DASHSCOPE_API_KEY) skips the
// envKeys step — a label missing here shows the backend's English prose. Keys stay verbatim;
// upstream renames a label now and then (Gemini → Google AI Studio), and the old spelling is
// kept beside the new one for a backend that still sends it.
export const zhProviderLabels: ProvidersCopy['providerLabels'] = {
  alibaba: 'Alibaba DashScope',
  'alibaba-cn': 'Alibaba DashScope（中国大陆）',
  'alibaba-token-plan': 'Alibaba（Token Plan）',
  'alibaba-token-plan-cn': 'Alibaba（Token Plan，中国大陆）',
  'alibaba-coding-plan': 'Alibaba（Coding Plan）',
  'alibaba-coding-plan-cn': 'Alibaba（Coding Plan，中国大陆）',
  'tencent-tokenplan': 'Tencent TokenPlan',
  'commandcode-anthropic': 'CommandCode（Anthropic）',
  'kimi-coding-cn': 'Kimi / Moonshot（中国区）',
  'minimax-cn': 'MiniMax（中国区）',
  zai: 'Z.AI（GLM）'
}

export const zhProviderDescriptions: ProvidersCopy['providerDescriptions'] = {
  'Nous Portal': '托管 Hermes 与 Nous 训练的模型',
  'Fireworks AI': 'OpenAI 兼容的直连模型 API',
  OpenRouter: '聚合数百个前沿模型的中转服务',
  Anthropic: 'Claude API 访问（Sonnet、Opus、Haiku）',
  xAI: 'Grok 系列模型（SuperGrok/Premium+ 请使用 OAuth）',
  Gemini: 'Google AI Studio（Gemini 1.5 / 2.0 / 2.5）',
  'Google AI Studio': 'Google AI Studio（原生 Gemini API）',
  DeepSeek: 'DeepSeek 直连 API（V3.x、R1）',
  'DashScope (Qwen)': 'Alibaba Cloud DashScope — Qwen 与多家厂商模型',
  'Qwen Cloud': 'Alibaba Cloud DashScope — Qwen 与多家厂商模型',
  'Alibaba Cloud DashScope (China)': '阿里云百炼 DashScope 中国大陆端点',
  'Alibaba Cloud (Token Plan)': '阿里云百炼 Token Plan（固定 Token 套餐）',
  'Alibaba Cloud (Token Plan, China)': '阿里云百炼 Token Plan 中国大陆端点',
  'Alibaba Cloud (Coding Plan)': '阿里云 Coding Plan（编程专用套餐）',
  'Alibaba Cloud (Coding Plan, China)': '阿里云 Coding Plan 中国大陆端点',
  'GLM / Z.AI': '智谱 GLM-4.6 与 Z.AI 托管端点',
  'Z.AI (GLM)': '智谱 GLM 与 Z.AI 托管端点',
  'Kimi / Moonshot': 'Moonshot Kimi K2 / 代码端点',
  'Kimi / Kimi Coding Plan': 'Kimi Coding Plan（api.kimi.com 与 Moonshot API）',
  'Kimi (China)': 'Moonshot 中国大陆端点',
  'Kimi / Moonshot (China)': 'Moonshot 中国大陆直连 API',
  MiniMax: 'MiniMax-M2 与 Hailuo 国际端点',
  'MiniMax (China)': 'MiniMax 中国大陆端点',
  'Hugging Face': 'Inference Providers — 经 router.huggingface.co 使用 20+ 开源模型',
  HuggingFace: 'Inference Providers — 经 router.huggingface.co 使用 20+ 开源模型',
  'OpenCode Zen': '按需访问精选代码模型',
  'OpenCode Go': '每月 10 美元订阅，使用开源代码模型',
  'NVIDIA NIM': 'build.nvidia.com 或你自己的本地 NIM 端点',
  'Ollama Cloud': 'ollama.com 上的云托管开源模型',
  'LM Studio': '本地 LM Studio 服务器（兼容 OpenAI）',
  StepFun: 'StepFun Step Plan 代码模型',
  'StepFun Step Plan': '通过 Step Plan API 使用 StepFun 智能体 / 代码模型',
  'Xiaomi MiMo': 'MiMo-V2.5 与 Xiaomi 自研模型',
  'Arcee AI': 'Arcee 托管的小型与中型模型',
  'GMI Cloud': 'GMI Cloud GPU + 模型推理服务',
  'Azure Foundry': 'Azure AI Foundry 自定义端点（兼容 OpenAI / Anthropic）',
  'AWS Bedrock': '通过 AWS 配置文件 + 区域进行认证',
  'Actual Computer': 'Actual Computer 托管推理，或通过本地离线守护进程运行模型',
  CommandCode: '通过一个 API 密钥使用 30 多个模型',
  'CommandCode (Anthropic)': '通过 Anthropic Messages API 使用 Claude 模型',
  'GitHub Copilot': '使用 GitHub 令牌或 gh 登录令牌访问 Copilot 模型',
  'Kilo Code': '通过 Kilo Gateway API 访问多种模型',
  'Meta Model API': 'Meta 超级智能实验室的 Muse Spark 系列模型',
  'OpenAI API': '通过 api.openai.com 和 API 密钥直接访问 OpenAI 模型',
  'Tencent TokenHub': '通过腾讯 TokenHub 使用混元 3 预览版',
  'Tencent TokenPlan': '通过 api.lkeap.cloud.tencent.com 使用混元 4 预览版（Anthropic Messages）',
  'Vercel AI Gateway': '聚合多个模型提供方的 Vercel AI Gateway',
  NovitaAI: 'NovitaAI — 面向开发者与智能体的 AI 原生云',
  DeepInfra: 'DeepInfra — 100 多个开源模型，按量付费',
  'Nebius Token Factory': 'Nebius Token Factory — OpenAI 兼容推理服务',
  'Ramp Router': 'Ramp Router（router.com）— 将每个请求路由到满足你质量要求的最便宜模型',
  'Upstage Solar': 'Upstage Solar API'
}

export const zhProviderEnvKeys: Translations['settings']['envKeys'] = {
  DASHSCOPE_CN_BASE_URL: { description: '阿里云百炼 DashScope（中国大陆）基础 URL 覆盖' },
  COMMANDCODE_ANTHROPIC_BASE_URL: { description: 'CommandCode（Anthropic）基础 URL 覆盖' }
}
