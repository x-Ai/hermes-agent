// Curated Simplified-Chinese copy for agent plugins whose manifests ship in
// English. `bundledNames` renames bundled plugins only; `bundledDescriptions`
// is keyed by registry key and read for every installed agent plugin
// (`PackageRow` in app/capabilities/plugins/plugins-tab.tsx), so catalog
// installs such as homeassistant read in Chinese too.
export const zhPluginManifests: {
  bundledNames: Record<string, string>
  bundledDescriptions: Record<string, string>
} = {
  bundledNames: {
    'disk-cleanup': '临时文件清理',
    'security-guidance': '安全编码指引'
  },
  bundledDescriptions: {
    'disk-cleanup':
      '自动追踪并清理 Hermes 会话期间产生的临时文件（测试脚本、临时输出、定时任务日志），通过插件钩子运行，无需智能体介入',
    'security-guidance':
      '当新写入的内容包含已知危险模式时，在文件写入工具结果中附加安全警告，包含 25 条基于 Anthropic claude-plugins-official 改编的规则，不会阻止写入，并会在下一轮把警告反馈给模型以便自行修正',
    homeassistant:
      'Hermes Agent 的 Home Assistant 集成：一个网关平台适配器外加四个智能家居工具，适配器订阅 HA 的 WebSocket 事件总线，把状态变更事件（支持按实体冷却以及按域/实体过滤）转发给智能体，回复以 HA 持久通知送达，定时任务的 deliver=homeassistant 则经由 notify.notify 服务投递，homeassistant 工具集（ha_list_entities、ha_get_state、ha_list_services、ha_call_service）通过 REST API 查询并控制设备，原先内置于 Hermes 核心'
  }
}
