import type { Locale } from './types'

/**
 * Curated descriptions keyed by the exact environment-variable name. Anything
 * else (custom keys, MCP catalog prompts, less common providers) keeps the
 * backend's own English description rather than a guessed sentence.
 */
const ZH_ENV_DESCRIPTIONS: Record<string, string> = {
  ANTHROPIC_API_KEY: 'Anthropic API 密钥',
  OPENAI_API_KEY: 'OpenAI API 密钥',
  OPENROUTER_API_KEY: 'OpenRouter API 密钥',
  GEMINI_API_KEY: 'Gemini API 密钥',
  DEEPSEEK_API_KEY: 'DeepSeek API 密钥',
  DASHSCOPE_API_KEY: 'Alibaba Cloud DashScope API 密钥',
  KIMI_API_KEY: 'Kimi API 密钥',
  MINIMAX_API_KEY: 'MiniMax API 密钥',
  ZAI_API_KEY: 'Z.AI API 密钥',
  GLM_API_KEY: 'GLM API 密钥',
  HF_TOKEN: 'Hugging Face 访问令牌',
  TELEGRAM_BOT_TOKEN: 'Telegram 机器人令牌',
  DISCORD_BOT_TOKEN: 'Discord 机器人令牌',
  SLACK_BOT_TOKEN: 'Slack 机器人令牌',
  SLACK_APP_TOKEN: 'Slack 应用令牌'
}

/** Localize dashboard-only metadata while preserving the actual environment key and value. */
export function localizeEnvDescription(key: string, description: string, locale: Locale): string {
  if (locale !== 'zh') return description
  return ZH_ENV_DESCRIPTIONS[key.toUpperCase()] ?? description
}
