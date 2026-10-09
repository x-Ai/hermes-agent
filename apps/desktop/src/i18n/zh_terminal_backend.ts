import type { Translations } from './types'

type TerminalBackendCopy = Translations['settings']['toolsets']['terminalBackend']

// Terminal backend picker rows (Settings › Capabilities), spread into
// `settings.toolsets.terminalBackend` in zh.ts. `descriptions` is keyed by backend
// name; `details` by the exact English probe outcome the dashboard router emits
// (`hermes_cli/web_routers/tools.py`, `_BACKEND_PROBES`): the panel matches that
// prose verbatim, so a reworded probe needs its key updated here.
export const zhTerminalBackend: Pick<TerminalBackendCopy, 'descriptions' | 'details'> = {
  descriptions: {
    local: '直接在本机上运行命令，不进行隔离',
    docker: '在隔离的 Docker 或 Podman 容器中运行命令，并使用持久化工作区',
    singularity: '在 Singularity/Apptainer 容器中运行命令（适合 HPC，无需 root）',
    modal: '在 Modal 云沙箱中运行命令',
    daytona: '在 Daytona 云沙箱中运行命令',
    ssh: '通过 SSH 在远程主机上运行命令'
  },
  details: {
    'Docker CLI not found — install Docker Desktop, docker-ce, or Podman.':
      '未找到 Docker CLI — 请安装 Docker Desktop、docker-ce 或 Podman',
    'Docker not reachable — start Docker and retry.': '无法连接 Docker — 请启动 Docker 后重试',
    'Podman not reachable — run `podman machine start` and retry.':
      '无法连接 Podman — 请运行 `podman machine start` 后重试',
    'Docker not responding (timed out).': 'Docker 无响应（已超时）',
    'Podman not responding (timed out).': 'Podman 无响应（已超时）',
    'Neither singularity nor apptainer found on PATH.': 'PATH 中未找到 singularity 或 apptainer',
    'Modal credentials not found — set MODAL_TOKEN_ID and MODAL_TOKEN_SECRET (or run `modal setup`).':
      '未找到 Modal 凭据 — 请设置 MODAL_TOKEN_ID 和 MODAL_TOKEN_SECRET（或运行 `modal setup`）',
    'Set DAYTONA_API_KEY to use the Daytona backend.': '请设置 DAYTONA_API_KEY 以使用 Daytona 后端',
    'Set terminal.ssh_host and terminal.ssh_user in config.yaml (or the matching TERMINAL_SSH_* env vars).':
      '请在 config.yaml 中设置 terminal.ssh_host 和 terminal.ssh_user（或对应的 TERMINAL_SSH_* 环境变量）',
    'Set terminal.ssh_host in config.yaml (or the matching TERMINAL_SSH_* env vars).':
      '请在 config.yaml 中设置 terminal.ssh_host（或对应的 TERMINAL_SSH_* 环境变量）',
    'Set terminal.ssh_user in config.yaml (or the matching TERMINAL_SSH_* env vars).':
      '请在 config.yaml 中设置 terminal.ssh_user（或对应的 TERMINAL_SSH_* 环境变量）'
  }
}
