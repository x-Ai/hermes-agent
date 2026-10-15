// Measure words for the tool card's count label (`assistant.tool.countLabel` in zh.ts).
// Keyed by the singular English noun the tool card's count metric carries
// (`components/assistant-ui/tool/fallback-model`: `entry`, `file`, `result`, a
// `*_count` payload key, …); a noun without a row keeps its English plural.
export const TOOL_COUNT_UNITS: Record<string, string> = {
  directory: '个目录',
  document: '个文档',
  entry: '条记录',
  error: '个错误',
  file: '个文件',
  folder: '个文件夹',
  image: '张图片',
  item: '项',
  line: '行',
  link: '个链接',
  match: '个匹配项',
  message: '条消息',
  page: '个页面',
  process: '个进程',
  request: '个请求',
  result: '个结果',
  row: '行',
  search: '次搜索',
  session: '个会话',
  skill: '个技能',
  source: '个来源',
  step: '个步骤',
  task: '个任务',
  test: '个测试',
  todo: '个待办',
  token: '个 Token',
  tool: '个工具',
  warning: '个警告'
}
