import type { TranslationOverride } from '@hermes/shared/i18n'

import type { PluginUpdateTranslations } from './types_plugin_update'

/** 更新已安装插件的文案（插件页）：目录重新固定的授权与安全扫描覆盖。 */
export const zhPluginUpdate: TranslationOverride<PluginUpdateTranslations> = {
  updateToPin: (sha: string) => `更新到 ${sha}`,
  updateFailed: (name: string) => `无法更新 ${name}`,
  updated: (name: string) => `${name} 已更新到当前目录固定提交，重启网关后生效`,
  updateConsentTitle: (name: string) => `${name} 请求更多权限`,
  updateConsentBody: (name: string, sha: string) =>
    `${name} 的新目录固定提交（${sha}）增加了已安装版本没有的功能面，只有在你信任它们时才应用：`,
  updateConsentConfirm: '应用更新',
  updateScanTitle: (name: string) => `安全扫描标记了 ${name}`,
  updateScanBody: (name: string, count: number) =>
    `${name} 的更新得到了谨慎判定（${count} 个发现），每次更新都会扫描，只有在你信任来源时才应用：`,
  updateScanMore: (count: number) => `+ 还有 ${count} 个`,
  updateScanConfirm: '仍然更新',
  updateScanBlocked: (name: string) => `安全扫描阻止了 ${name} 的更新（危险判定），无法覆盖`,
  updatedGit: (name: string) => `${name} 已更新到最新提交`
}
