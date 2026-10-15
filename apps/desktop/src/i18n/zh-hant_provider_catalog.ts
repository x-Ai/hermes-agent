import type { Translations } from './types'

type ProvidersCopy = Translations['settings']['providers']

// Traditional-Chinese twin of zh_provider_catalog.ts, spread into `settings.providers` and
// `settings.envKeys` in zh-hant_settings.ts: labels by backend provider id, descriptions by the
// catalog's verbatim English label, envKeys by the credential / base-URL variables the catalog
// declares (the provider rows zh-hant_settings.ts never carried live here too).
export const zhHantProviderLabels: ProvidersCopy['providerLabels'] = {
  alibaba: 'Alibaba DashScope',
  'alibaba-cn': 'Alibaba DashScope（中國大陸）',
  'alibaba-token-plan': 'Alibaba（Token Plan）',
  'alibaba-token-plan-cn': 'Alibaba（Token Plan，中國大陸）',
  'alibaba-coding-plan': 'Alibaba（Coding Plan）',
  'alibaba-coding-plan-cn': 'Alibaba（Coding Plan，中國大陸）',
  'tencent-tokenplan': 'Tencent TokenPlan',
  'commandcode-anthropic': 'CommandCode（Anthropic）',
  'kimi-coding-cn': 'Kimi / Moonshot（中國區）',
  'minimax-cn': 'MiniMax（中國區）',
  zai: 'Z.AI（GLM）'
}

export const zhHantProviderDescriptions: ProvidersCopy['providerDescriptions'] = {
  'Nous Portal': '託管 Hermes 與 Nous 訓練的模型',
  'Fireworks AI': 'OpenAI 相容的直連模型 API',
  OpenRouter: '聚合數百個前沿模型的中繼服務',
  Anthropic: 'Claude API 存取（Sonnet、Opus、Haiku）',
  xAI: 'Grok 系列模型（SuperGrok/Premium+ 請使用 OAuth）',
  Gemini: 'Google AI Studio（Gemini 1.5 / 2.0 / 2.5）',
  'Google AI Studio': 'Google AI Studio（原生 Gemini API）',
  DeepSeek: 'DeepSeek 直連 API（V3.x、R1）',
  'DashScope (Qwen)': 'Alibaba Cloud DashScope — Qwen 與多家廠商模型',
  'Qwen Cloud': 'Alibaba Cloud DashScope — Qwen 與多家廠商模型',
  'Alibaba Cloud DashScope (China)': '阿里雲百鍊 DashScope 中國大陸端點',
  'Alibaba Cloud (Token Plan)': '阿里雲百鍊 Token Plan（固定 Token 方案）',
  'Alibaba Cloud (Token Plan, China)': '阿里雲百鍊 Token Plan 中國大陸端點',
  'Alibaba Cloud (Coding Plan)': '阿里雲 Coding Plan（程式開發專用方案）',
  'Alibaba Cloud (Coding Plan, China)': '阿里雲 Coding Plan 中國大陸端點',
  'GLM / Z.AI': '智譜 GLM-4.6 與 Z.AI 託管端點',
  'Z.AI (GLM)': '智譜 GLM 與 Z.AI 託管端點',
  'Kimi / Moonshot': 'Moonshot Kimi K2 / 程式碼端點',
  'Kimi / Kimi Coding Plan': 'Kimi Coding Plan（api.kimi.com 與 Moonshot API）',
  'Kimi (China)': 'Moonshot 中國大陸端點',
  'Kimi / Moonshot (China)': 'Moonshot 中國大陸直連 API',
  MiniMax: 'MiniMax-M2 與 Hailuo 國際端點',
  'MiniMax (China)': 'MiniMax 中國大陸端點',
  'Hugging Face': 'Inference Providers — 經 router.huggingface.co 使用 20+ 開源模型',
  HuggingFace: 'Inference Providers — 經 router.huggingface.co 使用 20+ 開源模型',
  'OpenCode Zen': '隨需存取精選程式碼模型',
  'OpenCode Go': '每月 10 美元訂閱，使用開源程式碼模型',
  'NVIDIA NIM': 'build.nvidia.com 或你自己的本機 NIM 端點',
  'Ollama Cloud': 'ollama.com 上的雲端託管開源模型',
  'LM Studio': '本機 LM Studio 伺服器（相容 OpenAI）',
  StepFun: 'StepFun Step Plan 程式碼模型',
  'StepFun Step Plan': '透過 Step Plan API 使用 StepFun 代理 / 程式碼模型',
  'Xiaomi MiMo': 'MiMo-V2.5 與 Xiaomi 自研模型',
  'Arcee AI': 'Arcee 託管的小型與中型模型',
  'GMI Cloud': 'GMI Cloud GPU + 模型推論服務',
  'Azure Foundry': 'Azure AI Foundry 自訂端點（相容 OpenAI / Anthropic）',
  'AWS Bedrock': '透過 AWS 設定檔 + 區域進行驗證',
  'Actual Computer': 'Actual Computer 託管推論，或透過本機離線守護程序執行模型',
  CommandCode: '透過一把 API 金鑰使用 30 多個模型',
  'CommandCode (Anthropic)': '透過 Anthropic Messages API 使用 Claude 模型',
  'GitHub Copilot': '使用 GitHub 權杖或 gh 登入權杖存取 Copilot 模型',
  'Kilo Code': '透過 Kilo Gateway API 存取多種模型',
  'Meta Model API': 'Meta 超級智慧實驗室的 Muse Spark 系列模型',
  'OpenAI API': '透過 api.openai.com 和 API 金鑰直接存取 OpenAI 模型',
  'Tencent TokenHub': '透過騰訊 TokenHub 使用混元 3 預覽版',
  'Tencent TokenPlan': '透過 api.lkeap.cloud.tencent.com 使用混元 4 預覽版（Anthropic Messages）',
  'Vercel AI Gateway': '聚合多個模型提供方的 Vercel AI Gateway',
  NovitaAI: 'NovitaAI — 面向開發者與代理的 AI 原生雲',
  DeepInfra: 'DeepInfra — 100 多個開源模型，按量計費',
  'Nebius Token Factory': 'Nebius Token Factory — OpenAI 相容推論服務',
  'Ramp Router': 'Ramp Router（router.com）— 將每個請求路由到符合你品質要求的最便宜模型',
  'Upstage Solar': 'Upstage Solar API'
}

export const zhHantProviderEnvKeys: Translations['settings']['envKeys'] = {
  ANTHROPIC_BASE_URL: { description: 'Anthropic 基礎 URL 覆寫' },
  OPENAI_API_KEY: { description: 'OpenAI API 金鑰（api.openai.com）' },
  OPENAI_BASE_URL: { description: 'OpenAI API 基礎 URL 覆寫' },
  DASHSCOPE_CN_BASE_URL: { description: '阿里雲百鍊 DashScope（中國大陸）基礎 URL 覆寫' },
  ALIBABA_TOKEN_PLAN_API_KEY: { description: '阿里雲（Token Plan）API 金鑰' },
  ALIBABA_TOKEN_PLAN_BASE_URL: { description: '阿里雲（Token Plan）基礎 URL 覆寫' },
  ALIBABA_TOKEN_PLAN_CN_API_KEY: { description: '阿里雲（Token Plan，中國大陸）API 金鑰' },
  ALIBABA_TOKEN_PLAN_CN_BASE_URL: { description: '阿里雲（Token Plan，中國大陸）基礎 URL 覆寫' },
  ALIBABA_CODING_PLAN_API_KEY: { description: '阿里雲（Coding Plan）API 金鑰' },
  ALIBABA_CODING_PLAN_BASE_URL: { description: '阿里雲（Coding Plan）基礎 URL 覆寫' },
  ALIBABA_CODING_PLAN_CN_API_KEY: { description: '阿里雲（Coding Plan，中國大陸）API 金鑰' },
  ALIBABA_CODING_PLAN_CN_BASE_URL: { description: '阿里雲（Coding Plan，中國大陸）基礎 URL 覆寫' },
  ACTUAL_API_KEY: { description: 'Actual Computer 推論金鑰（ac_...）' },
  ACTUAL_BASE_URL: {
    description: 'Actual Computer 基礎 URL 覆寫，使用本機離線守護程序時設為 http://127.0.0.1:8080'
  },
  COMMANDCODE_API_KEY: {
    description: 'CommandCode API 金鑰（一把金鑰可使用 GOAT/Pro/Max/Provider 方案的 30 多個模型）'
  },
  COMMANDCODE_BASE_URL: { description: 'CommandCode 基礎 URL 覆寫' },
  COMMANDCODE_ANTHROPIC_BASE_URL: { description: 'CommandCode（Anthropic）基礎 URL 覆寫' },
  COPILOT_GITHUB_TOKEN: { description: 'GitHub Copilot 存取權杖（也可使用 GITHUB_TOKEN 或 gh 登入權杖）' },
  GH_TOKEN: { description: 'GitHub CLI 存取權杖，可用於 GitHub Copilot' },
  COPILOT_API_BASE_URL: { description: 'GitHub Copilot 基礎 URL 覆寫' },
  AI_GATEWAY_API_KEY: { description: 'Vercel AI Gateway API 金鑰' },
  AI_GATEWAY_BASE_URL: { description: 'Vercel AI Gateway 基礎 URL 覆寫' },
  TOKENHUB_API_KEY: { description: '騰訊 TokenHub API 金鑰（透過 tokenhub.tencentmaas.com 使用混元 3 預覽版）' },
  TOKENHUB_BASE_URL: { description: '騰訊 TokenHub 基礎 URL 覆寫' },
  TOKENPLAN_API_KEY: {
    description: '騰訊 TokenPlan API 金鑰（透過 api.lkeap.cloud.tencent.com 使用混元 4 預覽版）'
  },
  TOKENPLAN_BASE_URL: { description: '騰訊 TokenPlan 基礎 URL 覆寫' },
  MODEL_API_KEY: { description: 'Meta Model API 金鑰' },
  META_API_KEY: { description: 'Meta Model API 金鑰' },
  META_MODEL_API_KEY: { description: 'Meta Model API 金鑰' },
  META_BASE_URL: { description: 'Meta Model API 基礎 URL 覆寫' },
  KILOCODE_BASE_URL: { description: 'Kilo Code 基礎 URL 覆寫' },
  RAMP_ROUTER_API_KEY: { description: 'Ramp Router API 金鑰' },
  ROUTER_API_KEY: { description: 'Ramp Router API 金鑰' },
  RAMP_ROUTER_BASE_URL: { description: 'Ramp Router 基礎 URL 覆寫' },
  NEBIUS_API_KEY: { description: 'Nebius Token Factory API 金鑰' },
  NEBIUS_TOKEN_FACTORY_API_KEY: { description: 'Nebius Token Factory API 金鑰' },
  NEBIUS_BASE_URL: { description: 'Nebius Token Factory 基礎 URL 覆寫' }
}
