import type { Locale } from './types'

const ZH_PLUGIN_LABELS: Record<string, string> = {
  kanban: '看板',
  'hermes-achievements': '成就'
}

// Keyed by plugin name; the value translates that plugin's current manifest description.
const ZH_PLUGIN_DESCRIPTIONS: Record<string, string> = {
  kanban: '多智能体协作看板——在列之间拖放卡片、阅读评论线程、查看各配置正在运行的任务',
  'disk-cleanup': '自动跟踪并清理 Hermes 会话期间创建的临时文件（测试脚本、临时输出、定时任务日志），通过插件钩子运行，无需智能体操作',
  'security-guidance':
    '当写入文件的新内容包含已知危险模式（pickle.load、yaml.load、eval(、os.system、dangerouslySetInnerHTML、verify=False、ECB、XXE、GitHub Actions 注入等）时，在文件写入工具结果中附加安全警告，25 条正则/子串规则源自 Anthropic 的 claude-plugins-official（Apache-2.0），不会阻断：文件照常写入，警告会在下一轮返回给模型以便自行修正',
  spotify:
    '原生 Spotify 集成——7 个工具（播放、设备、队列、搜索、歌单、专辑、曲库），使用 Spotify Web API + PKCE OAuth，通过 `hermes auth spotify` 登录，工具在 ~/.hermes/auth.json 存在 `providers.spotify` 时启用'
}

export function localizePluginLabel(name: string, fallback: string, locale: Locale): string {
  return locale === 'zh' ? (ZH_PLUGIN_LABELS[name] ?? fallback) : fallback
}

/** Plugin manifests are backend data; show a curated translation when one exists, else the manifest's own text. */
export function localizePluginDescription(name: string, description: string, locale: Locale): string {
  if (locale !== 'zh' || !description) return description
  return ZH_PLUGIN_DESCRIPTIONS[name] ?? description
}
