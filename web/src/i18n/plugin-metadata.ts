import type { Locale } from './types'

const ZH_PLUGIN_LABELS: Record<string, string> = {
  kanban: '看板',
  'hermes-achievements': '成就'
}

export function localizePluginLabel(name: string, fallback: string, locale: Locale): string {
  return locale === 'zh' ? (ZH_PLUGIN_LABELS[name] ?? fallback) : fallback
}

/** Plugin manifests are backend data; localize their presentation without mutating the manifest or CLI output. */
export function localizePluginDescription(name: string, description: string, locale: Locale): string {
  if (locale !== 'zh' || !description) return description

  const lower = description.toLowerCase()
  if (lower.includes('browser')) return `${name} 的浏览器自动化与网页操作插件。`
  if (lower.includes('memory')) return `${name} 记忆提供商插件。`
  if (lower.includes('image')) return `${name} 图像生成与处理插件。`
  if (lower.includes('video')) return `${name} 视频生成与处理插件。`
  if (lower.includes('search') || lower.includes('web')) return `${name} 网页搜索与内容获取插件。`
  if (lower.includes('observability') || lower.includes('trace')) return `${name} 可观测性与调试插件。`
  if (lower.includes('model') || lower.includes('provider')) return `${name} 模型提供商集成插件。`
  if (lower.includes('channel') || lower.includes('message')) return `${name} 消息平台集成插件。`
  if (lower.includes('security')) return `${name} 安全检查与防护插件。`
  return `${name} Hermes 功能扩展插件。`
}
