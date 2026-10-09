import type { Translations } from './types'

type TerminalBackendCopy = Translations['settings']['toolsets']['terminalBackend']

// Traditional-Chinese twin of zh_terminal_backend.ts, spread into
// `settings.toolsets.terminalBackend` in zh-hant_settings.ts; the `details` keys are
// the verbatim probe outcomes of `hermes_cli/web_routers/tools.py`.
export const zhHantTerminalBackend: Pick<TerminalBackendCopy, 'descriptions' | 'details'> = {
  descriptions: {
    local: '直接在本機上執行命令，不進行隔離',
    docker: '在隔離的 Docker 或 Podman 容器中執行命令，並使用持久化工作區',
    singularity: '在 Singularity/Apptainer 容器中執行命令（適合 HPC，無需 root）',
    modal: '在 Modal 雲端沙箱中執行命令',
    daytona: '在 Daytona 雲端沙箱中執行命令',
    ssh: '透過 SSH 在遠端主機上執行命令'
  },
  details: {
    'Docker CLI not found — install Docker Desktop, docker-ce, or Podman.':
      '找不到 Docker CLI——請安裝 Docker Desktop、docker-ce 或 Podman',
    'Docker not reachable — start Docker and retry.': '無法連線 Docker——請啟動 Docker 後重試',
    'Podman not reachable — run `podman machine start` and retry.':
      '無法連線 Podman——請執行 `podman machine start` 後重試',
    'Docker not responding (timed out).': 'Docker 無回應（已逾時）',
    'Podman not responding (timed out).': 'Podman 無回應（已逾時）',
    'Neither singularity nor apptainer found on PATH.': 'PATH 中找不到 singularity 或 apptainer',
    'Modal credentials not found — set MODAL_TOKEN_ID and MODAL_TOKEN_SECRET (or run `modal setup`).':
      '找不到 Modal 憑證——請設定 MODAL_TOKEN_ID 和 MODAL_TOKEN_SECRET（或執行 `modal setup`）',
    'Set DAYTONA_API_KEY to use the Daytona backend.': '請設定 DAYTONA_API_KEY 以使用 Daytona 後端',
    'Set terminal.ssh_host and terminal.ssh_user in config.yaml (or the matching TERMINAL_SSH_* env vars).':
      '請在 config.yaml 中設定 terminal.ssh_host 和 terminal.ssh_user（或對應的 TERMINAL_SSH_* 環境變數）',
    'Set terminal.ssh_host in config.yaml (or the matching TERMINAL_SSH_* env vars).':
      '請在 config.yaml 中設定 terminal.ssh_host（或對應的 TERMINAL_SSH_* 環境變數）',
    'Set terminal.ssh_user in config.yaml (or the matching TERMINAL_SSH_* env vars).':
      '請在 config.yaml 中設定 terminal.ssh_user（或對應的 TERMINAL_SSH_* 環境變數）'
  }
}
