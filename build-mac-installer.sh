#!/usr/bin/env bash
# 在 macOS 上构建与官方 Hermes-Setup.dmg 同等的 bundled 安装器（本地构建版）。
#
# 与官方产物的差异：官方 CI 用 Apple 证书签名 + 公证（release-signing 环境），
# 本地默认不签名（notarize.mjs 检测到无 APPLE_* 凭据会自动跳过）。
# 本机构建的应用无 quarantine 属性，Gatekeeper 不拦截，可直接运行。
#
# 用法:
#   ./build-mac-installer.sh                # bundled 变体（同官方 Setup，内置 agent payload）
#   ./build-mac-installer.sh --standard     # 不带 payload 的标准变体（更快）
#   SIGN=1 ./build-mac-installer.sh         # 有 Developer ID 证书时启用自动签名
set -euo pipefail
cd "$(dirname "$0")"

[[ "$(uname -s)" == "Darwin" ]] || { echo "错误: DMG 组装依赖 hdiutil，必须在 macOS 上运行" >&2; exit 1; }

VARIANT=bundled
[[ "${1:-}" == "--standard" ]] && VARIANT=""

# ── Node（engines: ^22.22.0 || ^24.11.0 || >=26.0.0）────────────────────────
command -v node >/dev/null || { echo "错误: 未找到 node" >&2; exit 1; }
echo "node $(node -v) / npm $(npm -v)"

# ── 依赖 ────────────────────────────────────────────────────────────────────
if [[ ! -d node_modules ]]; then
  echo "==> npm ci（workspace 根）"
  npm ci --no-audit --no-fund
fi

# ── 构建用 Python（payload 阶段需要，>=3.11）────────────────────────────────
if [[ -z "${HERMES_PYTHON:-}" ]]; then
  for cand in "$PWD/.venv/bin/python" python3.13 python3.12 python3.11 python3; do
    if command -v "$cand" >/dev/null 2>&1 || [[ -x "$cand" ]]; then
      ver=$("$cand" -c 'import sys;print(sys.version_info>=(3,11))' 2>/dev/null || echo False)
      [[ "$ver" == "True" ]] && export HERMES_PYTHON="$cand" && break
    fi
  done
fi
[[ -n "${VARIANT}" && -z "${HERMES_PYTHON:-}" ]] && { echo "错误: 找不到 >=3.11 的 Python，请 export HERMES_PYTHON=<解释器路径>" >&2; exit 1; }
[[ -n "${VARIANT}" ]] && echo "HERMES_PYTHON=$HERMES_PYTHON"
[[ -n "${VARIANT}" ]] && ! command -v uv >/dev/null && echo "警告: 未找到 uv，payload 阶段可能失败（brew install uv）" >&2

# ── 签名开关 ────────────────────────────────────────────────────────────────
if [[ "${SIGN:-0}" != "1" ]]; then
  export CSC_IDENTITY_AUTO_DISCOVERY=false   # 无证书本地构建：跳过 Developer ID 签名
fi

cd apps/desktop

# ── agent payload（bundled 变体 = 官方 Setup 的形态）───────────────────────
if [[ -n "$VARIANT" ]]; then
  echo "==> staging agent payload"
  npm run payload
  export HERMES_DESKTOP_VARIANT=bundled
fi

# ── 构建 + 打 DMG ───────────────────────────────────────────────────────────
echo "==> vite/electron 构建 + electron-builder --mac dmg"
npm run dist:mac:dmg

echo
echo "完成。产物："
ls -lh release/*.dmg
