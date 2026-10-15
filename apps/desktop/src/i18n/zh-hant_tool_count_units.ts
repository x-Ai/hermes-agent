// Traditional-Chinese twin of zh_tool_count_units.ts (`assistant.tool.countLabel` in zh-hant_assistant.ts).
// Keyed by the singular English noun the tool card's count metric carries
// (`components/assistant-ui/tool/fallback-model`: `entry`, `file`, `result`, a
// `*_count` payload key, …); a noun without a row keeps its English plural.
export const TOOL_COUNT_UNITS: Record<string, string> = {
  directory: '個目錄',
  document: '個文件',
  entry: '筆記錄',
  error: '個錯誤',
  file: '個檔案',
  folder: '個資料夾',
  image: '張圖片',
  item: '項',
  line: '行',
  link: '個連結',
  match: '個相符項目',
  message: '則訊息',
  page: '個頁面',
  process: '個程序',
  request: '個請求',
  result: '個結果',
  row: '列',
  search: '次搜尋',
  session: '個工作階段',
  skill: '個技能',
  source: '個來源',
  step: '個步驟',
  task: '個任務',
  test: '個測試',
  todo: '個待辦',
  token: '個 Token',
  tool: '個工具',
  warning: '個警告'
}
