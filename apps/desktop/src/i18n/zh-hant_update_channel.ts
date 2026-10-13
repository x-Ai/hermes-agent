export const zhHantUpdateChannel = {
  title: '更新頻道',
  description: '穩定版只安裝已發布版本，滾動更新跟隨 main 分支最新。',
  stable: '穩定版發布',
  main: '滾動更新',
  stableConfirmTitle: '切換到穩定版發布？',
  stableConfirmBody:
    'Hermes 將切換到最新的已發布版本，它可能比你目前執行的程式碼更舊。較新程式碼寫入的資料可能無法正確讀取，請先備份。',
  stableConfirm: '切換到穩定版',
  failed: '無法變更更新頻道',
  detailsLabel: '頻道',
  branch: (b: string) => `分支：${b}`,
  change: '變更',
  latestRelease: (v: string) => `你正在使用最新的穩定版發布（${v}）。`,
  noReleaseTitle: '尚無穩定版發布',
  noReleaseBody: (repo: string) => `${repo} 尚未發布任何穩定版本。切換到「滾動更新」以繼續跟隨 main 分支。`
}
