import type { Locale } from "./types";
import type { DashboardCopy } from "./dashboard";
import type { McpTestResult } from "@/lib/api";

const ZH_SPECIAL_SETUP: Record<string, string> = {
  alltrails:
    "无需账号或凭据；重启会话后工具即可使用。\n\n注意：该服务器只有 5 个工具，但 schema 特别冗长（合计约 2.4 万 Token）。如果只是偶尔查询步道，建议保持禁用并按需开启，或运行以下命令精简工具：\n  hermes mcp configure alltrails",
  amplitude:
    "首次连接时，Hermes 会打开浏览器授权 Amplitude（也可运行 `hermes mcp login amplitude`）。批准访问后重启会话以加载工具。\n\n数据位于欧盟的组织：请在 config.yaml 中将 mcp_servers.amplitude.url 改为 https://mcp.eu.amplitude.com/mcp。",
  betterstack:
    "首次连接时，Hermes 会打开浏览器授权 Better Stack（也可运行 `hermes mcp login betterstack`）。批准访问后重启会话以加载工具。\n\n注意：该服务器暴露大量工具（截至 2026 年 8 月约 106 个）。Hermes 安装时会自动应用精选排除列表；可随时运行以下命令检查或修改选择：\n  hermes mcp configure betterstack",
  cloudflare:
    "首次连接时，Hermes 会打开浏览器授权 Cloudflare。请选择账号以及要授予的权限，并把令牌范围限制在希望代理操作的资源。授权后重启 Hermes 会话以加载工具。\n\n此条目把各 Cloudflare API 端点作为独立工具暴露。清单已排除企业合同、组织级管理和只读分析等产品族；DNS、Workers、R2、KV、D1、Queues、Pages、WAF、规则集、隧道、Access、Stream、Images、AI、Vectorize 等常用产品仍可按需通过 tool_search 发现，不会一次性塞满上下文。\n\n如果需要恢复 Zero Trust、Radar、Magic 或 API Shield 等工具，请编辑 ~/.hermes/config.yaml 中 mcp_servers.cloudflare.tools.exclude。\n\n无界面 / CI 环境可在 https://dash.cloudflare.com/profile/api-tokens 创建 API 令牌，并在 ~/.hermes/config.yaml 中为该服务器配置 Authorization: Bearer ${CLOUDFLARE_API_TOKEN}。\n\n若希望使用 Cloudflare 提供的 Code Mode（两个搜索/执行元工具），请从 URL 移除 `?codemode=false`。不建议与 Hermes tool_search 同时使用，以免叠加两层工具发现。\n\n可随时重新运行工具清单：\n  hermes mcp configure cloudflare",
  "comfy-cloud":
    "首次连接时，Hermes 会打开浏览器使用你的 Comfy 账号完成认证。授权后重启 Hermes 会话以加载 Comfy Cloud 工具。\n\n发现工具（search_templates / search_models / search_nodes）可用于任何 Comfy 账号；生成工具会消耗 Comfy Cloud 点数，需要订阅或点数余额，套餐见 https://www.comfy.org/cloud。\n\n默认启用精选的 20 个工具（发现、生成、任务生命周期和计费）。批处理、已保存/共享工作流管理和 App Mode 工具可按需运行以下命令开启：\n  hermes mcp configure comfy-cloud",
  context7:
    "无需账号或凭据；重启会话后工具即可使用。\n\n匿名使用有速率限制；如需更高限额，请在 context7.com/dashboard 创建 API 密钥，并通过 config.yaml 的 mcp_servers.context7.headers 添加 Bearer 请求头。",
  figma:
    "首次连接时，Hermes 会打开浏览器授权 Figma（也可运行 `hermes mcp login figma`）。批准访问后重启会话以加载工具。\n\nFigma 的 OAuth DCR 会严格检查 client_name；Hermes 会自动以 \"Claude Code\" 注册，无需粘贴 client_id。\n\n可在提示词中附上画框/文件链接，例如：\n  implement this design: https://www.figma.com/design/<fileKey>/...\n\nDesktop 替代方案（无需 OAuth，仅限本机）：在 Figma 桌面应用中启用 Dev Mode MCP（Shift+D → Inspect → Enable desktop MCP server），再将 URL 指向 http://127.0.0.1:3845/mcp。",
  gitlab:
    "首次连接时，Hermes 会打开浏览器授权 GitLab（也可运行 `hermes mcp login gitlab`）。批准访问后重启会话以加载工具。\n\n默认覆盖 gitlab.com。对于自行托管的 GitLab 18.6+，请将 mcp_servers.gitlab.url 指向 https://<your-host>/api/v4/mcp。",
  grafana:
    "首次连接时，Hermes 会打开浏览器授权 Grafana Cloud（也可运行 `hermes mcp login grafana`）。授权时请输入 Grafana Cloud Stack URL（https://<your-stack>.grafana.net），选择只读或读写权限并批准，然后重启会话以加载工具。\n\n需要托管的 Grafana Cloud Stack 和 \"Assistant Cloud MCP User\" 角色（Editor 或更高角色默认具备）。此端点不支持自托管 Grafana，请改用开源 mcp-grafana 服务器。\n\n计费提示：Grafana 会把每位通过 MCP 连接的用户计为活跃 Grafana Assistant 用户，详情见 grafana.com 的 Assistant 定价。",
  kiwi:
    "无需账号或凭据；重启会话后工具即可使用。\n\n仅提供搜索；预订与付款会通过返回的链接在 kiwi.com 上完成，不会在对话中执行。",
  klaviyo:
    "首次连接时，Hermes 会打开浏览器授权 Klaviyo（也可运行 `hermes mcp login klaviyo`）。批准访问后重启会话以加载工具。\n\n需要 Klaviyo 的 Owner、Admin 或 Manager 角色。\n\nHermes 默认固定约 40 个核心工具，并通过 URL 参数启用 Klaviyo 的提示注入缓解措施。如需完整的 262 个工具，请从 config.yaml 的 mcp_servers.klaviyo.url 中移除查询参数。",
  linear:
    "首次连接时，Hermes 会打开浏览器使用 Linear 账号完成认证。授权后重启 Hermes 会话以加载 Linear 工具。\n\n可随时重新运行工具清单：\n  hermes mcp configure linear",
  n8n:
    "n8n 桥接器会通过你提供的 URL 连接正在运行的 n8n 实例。请在 n8n 的 Settings → API 中生成 API 密钥。\n\n工作流启用/停用调用会真实修改在线 n8n 实例，请谨慎操作。\n\n新建 Hermes 会话以加载 n8n 工具。",
  robinhood:
    "首次连接时，Hermes 会打开浏览器授权 Robinhood（也可运行 `hermes mcp login robinhood`）。批准访问后重启会话以加载工具。\n\n警告：该服务器可以在专用 Robinhood 智能体账号中执行真实交易（股票、期权和加密货币）。Hermes 的常规工具审批流程仍然适用，但批准前请仔细核对订单。",
  strava:
    "首次连接时，Hermes 会打开浏览器授权 Strava（也可运行 `hermes mcp login strava`）。批准访问后重启会话以加载工具。\n\n需要 Strava 订阅。",
  trivago:
    "无需账号或凭据；重启会话后工具即可使用。\n\n仅提供搜索；预订会在链接指向的预订网站中完成，不会在对话中执行。",
  "unreal-engine":
    "此条目连接 Epic 官方 Unreal MCP 插件；服务器运行在 Unreal Editor 内部。连接前请：\n\n  1. 使用 Unreal Editor 5.8+ 打开项目。\n  2. 打开 Edit > Plugins，搜索 \"Unreal MCP\"，启用后重启编辑器（Toolset Registry 依赖会自动启用）。\n  3. 打开 Edit > Editor Preferences > General > Model Context Protocol，开启 \"Auto Start Server\"；也可在编辑器控制台运行 `ModelContextProtocol.StartServer`。默认监听 http://127.0.0.1:8000/mcp。\n\n请在编辑器服务器启动后再启动 Hermes。如果在 Editor Preferences 中更改了端口或 URL 路径，请同步更新 mcp_servers.unreal-engine.url。\n\n状态：Epic 将此功能标记为实验性。服务器会在引擎游戏线程中串行执行工具调用，请避免并发调用。\n\n可随时重新运行工具清单：\n  hermes mcp configure unreal-engine"
};

const FIRST_CONNECTION_RE = /^On first connection,? Hermes (?:will )?opens? a browser to (?:authorize|authenticate) with\s+(.+?)(?:\s+\(or run `([^`]+)`\))?\.\s+Approve access,?\s+then restart (?:the|your Hermes) session so (?:the )?tools (?:are )?load(?:ed)?\.?$/is;

export function localizeMcpSetup(name: string, setup: string, locale: Locale): string {
  if (locale !== "zh" || !setup.trim()) return setup.trim();

  const special = ZH_SPECIAL_SETUP[name];
  if (special) return special;

  const normalized = setup.trim().replace(/\s*\n\s*/g, " ");
  if (/^No account or credentials needed\s+—\s+tools are available as soon as the session restarts\.?$/i.test(normalized)) {
    return "无需账号或凭据；重启会话后工具即可使用。";
  }

  const match = FIRST_CONNECTION_RE.exec(normalized);
  if (match) {
    const service = match[1].trim();
    const command = match[2] ? `（也可运行 \`${match[2]}\`）` : "";
    return `首次连接时，Hermes 会打开浏览器授权 ${service}${command}。批准访问后重启会话以加载工具。`;
  }

  return setup.trim();
}

export function localizeMcpTestError(
  result: McpTestResult,
  copy: DashboardCopy["mcp"],
  locale: Locale
): string {
  if (
    result.code === "oauth_required" ||
    result.error === "OAuth authentication required — no token found."
  ) {
    return copy.oauthRequired;
  }
  if (result.error) {
    return locale === "zh" ? `${copy.connectionFailed}：${result.error}` : result.error;
  }
  return copy.connectionFailed;
}
