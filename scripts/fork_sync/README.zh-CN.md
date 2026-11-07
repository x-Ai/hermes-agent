# Fork 自动同步上游

工作流：`.github/workflows/fork-upstream-sync.yml`。**每小时检查一次**，在 UTC 每小时第 **7 分钟**轮询 `NousResearch/hermes-agent/main` 和 Releases，也支持在 Actions 页面手动执行。GitHub 的定时任务可能延迟；长任务串行执行，排队的定时任务也可能被替换，不能承诺严格一小时内完成同步。

## 启用

将本目录、两个 `tests/scripts/test_fork_sync_*.py`、工作流及 `.github/workflows/README.md` 的修改提交到 fork 的默认分支 `main`。仅在本地存在文件不会启用 GitHub Actions。编码 Agent 使用 **Pi**，不包含自研 AI 工具循环。工作流在 runner 临时目录安装固定版本 `@earendil-works/pi-coding-agent@1.5.0`（与本机已安装的 Pi 版本一致），升级时修改工作流中的 `PI_VERSION`。Node 由 Actions 安装，要求版本至少 22.19。

在仓库 **Settings → Secrets and variables → Actions** 配置：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Secret | `SYNC_AI_API_KEY` | 你的 Anthropic 兼容 API Key |
| Variable | `SYNC_AI_BASE_URL` | 你的 HTTPS API 根地址，或包含 `/v1` / `/v1/messages` 的地址 |
| Variable | `SYNC_AI_MODEL` | 端点接受的精确模型 ID，必须支持 Anthropic Messages 的 `tool_use` / `tool_result` |
| Variable（可选） | `SYNC_RELEASES_SINCE` | 开始复制新 Release 的 UTC 时间；默认 `2026-11-07T00:00:00Z` |
| Variable（可选） | `SYNC_PAUSED` | 设为 `true` 暂停整个工作流 |
| Secret（可选） | `SYNC_PUSH_TOKEN` | 仅发布任务使用的专用 GitHub App token 或细粒度 PAT，见下方权限说明 |

控制器在临时 `PI_CODING_AGENT_DIR/models.json` 中创建 `fork-sync` provider：`api` 为 `anthropic-messages`，模型 ID 来自 `SYNC_AI_MODEL`，`apiKey` 只写环境变量引用 `$SYNC_AI_API_KEY`。不读取本机 `auth.json` 或复制登录信息。接口地址的 `/v1` 或 `/v1/messages` 后缀会去掉，由 Pi 的 Anthropic 客户端添加；代理路径前缀会保留。默认纯文本、关闭 thinking；`context_window` 和 `max_tokens` 在 `config.json` 中按实际模型能力调整。端点需要支持 Anthropic 流式工具调用，实际兼容性以首次 Actions 运行验证。

在 **Actions** 页面为 fork 启用工作流，然后手动运行 **Fork upstream sync** 检查配置与结果。工作流只在 fork 的 `main` 运行。仓库策略必须允许工作流使用 `contents: write`。若规则要求所有修改走 PR、签名或限制机器人直推，需要为专用自动化身份配置适用规则；脚本不会强推或绕过保护规则。

默认使用自动提供的 `GITHUB_TOKEN`。若上游同步包含 `.github/workflows` 修改，GitHub 可能要求具有 **Workflows: write** 和 **Contents: write** 的 `SYNC_PUSH_TOKEN`。该 token 还会使推送触发普通 CI；仅使用 `GITHUB_TOKEN` 的推送通常不触发后续工作流，因此本工作流已经在推送前独立测试候选提交。无需将写 token 交给 AI 阶段。

## 执行过程

1. **Prepare（只有仓库读取权限）**：获取 upstream main，分页枚举发布时间不早于起始时间的公开 Release，跳过草稿和已存在的 fork Release。上游标签抓取到独立 Git 命名空间，避免覆盖 fork 同名标签。
2. 对尚未包含的 main 和 Release 提交逐个执行真实 Git 合并。即使没有文本冲突，也调用 `pi --mode json --no-session` 检查新增用户界面文案、补齐 i18n。Pi 负责工具调用、文件编辑和上下文管理，可使用 Bash 运行针对性检查；控制器只启动 CLI、检查 JSONL 事件和最终 Git 状态。显式启用 read/grep/find/ls/edit/write/bash，禁用 extensions、skills、prompt templates、MCP 和自动加载上下文，不批准项目本地配置。`--offline` 禁止模型目录刷新等自动网络活动，不影响显式模型请求。Pi 不提供工具审批，Bash 能访问该进程的 API 环境及 runner 网络；仅在一次性的 GitHub 托管 runner 中运行。GitHub 凭证不传入 Pi，仓库写凭证只在 Publish 任务出现。
3. **Validate（无 AI 密钥、无写 token）**：从 Git bundle 恢复准确的候选提交，通过现有 PM 机制构建锁定依赖。运行 `scripts/check`、标准 Python 测试集、TUI check、桌面端 lint/typecheck 与 UI 测试、Web check，以及 desktop i18n 导出一致性检查。全部命令见 `config.json`。这是 Linux 验证，不包含 macOS/Windows 原生集成或桌面安装包 E2E。
4. **Publish（仅此任务可写仓库）**：再次确认远端 main 没有被其他人推进，使用普通 fast-forward push 推进 main，然后创建缺失的 Release。测试期间 main 发生变化就失败，下一轮从新 main 重新计算；不会把未经检查的 rebase 结果推送。

自动化与现有 `fork-stable-release.yml` 共用并发组，避免两套发布流程同时移动同名 Tag。AI 上限、测试命令保存在 `config.json`；任务分别有 90/120/20 分钟硬超时。有更新才调用 AI；上游改动很多时，首轮 API 花费和执行时间可能明显增加。

## i18n 与二开保留规则

`prompt.md` 指定：比较共同祖先、fork 和 upstream，保留上游修复及二开行为；禁止整批 ours/theirs 取舍、删除测试或放松检查。新增界面文案使用项目现有的 Python、TUI、Desktop i18n API。简体中文和繁体中文完整覆盖，其他语言遵循现有键与覆盖率约束，保留变量、占位符和运行时类型。

Pi 能读取上下文并尝试解决二开冲突，但不能保证所有语义冲突都判断正确。已有测试和新增回归测试提供检查依据。`.github/`、`scripts/fork_sync/` 和本自动化的测试文件在提示词中禁止改动，并在 Agent 调用前后比较文件快照；变化则阻塞。调用后还会核对 HEAD 和 MERGE_HEAD，防止 Agent 自行提交或中止合并。自动化控制文件冲突需维护者处理；无法可靠解决的冲突必须返回 blocked。检查失败不会因为 Agent 自称成功就继续发布。

## Release 语义

- 新 Release 的 **Tag 名、标题、正文和 prerelease 标志**来自上游，正文不追加 fork 说明。
- Tag 指向通过上述检查的 **fork 代码**，包含中文、二开及该上游 Release 的真实提交；GitHub 自动生成的 Source code ZIP/TAR 因而包含 fork 改动。
- Release 分支可能含 main 没有的提交，准备阶段也会合并它们；发布前要求真实祖先关系，不把缺少对象或 Git 错误当作已同步。
- 已存在的 fork Release 和已上传附件保持原样，避免轮询重写人工发布记录；这也意味着不会追踪上游对旧 Release 正文的后续编辑。
- 只将上游 `/releases/latest` 对应的正式版本标记为 latest，补发历史版本不会抢占 latest；预发布保留预发布标志。
- 不直接复制上游二进制附件：它们没有你的本地化或二开代码。当前核实的上游 Release 没有附件。若以后需要中文安装包，应基于 fork Tag 接入现有构建流程并上传；本工作流仅发布源码 Release。
- 默认从 `2026-11-07T00:00:00Z` 开始，不自动补全之前缺失的历史版本。修改 `SYNC_RELEASES_SINCE` 可显式回填；所有符合条件的版本分页处理，不只读取 latest。

## 故障与重试

Pi 非零退出、超时、JSONL 中的模型/工具错误、缺少 `agent_settled` 或最终成功 JSON、冲突残留、测试失败或推送拒绝都会使 Actions 失败，不能继续发布。事件错误采用保守策略：即使 Pi 后续自行重试成功，本轮仍阻塞发布。prepare 会尽量上传 `fork-sync-candidate` 诊断产物；成功准备时包含候选 bundle/manifest，合并错误时还会保存已跟踪文件的工作区 patch、冲突列表及 Git 恢复 bundle。产物保存 7 天，不包含 API Key、模型完整对话或环境转储。失败时没有自动创建 PR/远端待处理分支，避免依赖额外 PR 写权限。

工作流下一轮会重试。持续失败时可设置 `SYNC_PAUSED=true` 控制 API 支出，在 Actions 日志定位失败步骤。检查失败不会自动放松测试；调整规则应作为独立维护变更审查。发布阶段若 main 已推进但 Release 创建失败，不回滚 main，后续轮询补齐尚未创建的 Release；已发布版本不会重复创建。

上游无变更、且没有待同步的新 Release 时结束，不安装项目依赖、不调用模型。准备任务仍会安装固定版 CLI，确保运行环境一致。每次 Pi 调用默认最长 60 分钟，配置位于 `config.json`；Pi CLI 没有采用自研轮数计数器，上下文压缩交给 Pi。独立 Validate 的完整测试失败后，本轮停止，下一轮重新尝试。

## 本地验证自动化本身

按照项目规定使用 `scripts/run_tests.sh`，测试采用临时 Git 仓库、模拟 CLI 结果与 GitHub API，不调用付费模型、不操作真实 Release：

```bash
bash scripts/run_tests.sh tests/scripts/test_fork_sync_releases.py tests/scripts/test_fork_sync_run.py -j 2 --file-retries 0 -q
python scripts/check --base HEAD
```

`run.py prepare/publish` 会访问实际远端；不要把这些子命令当作本地单元测试执行。首次端到端验证需要用户自己的端点、模型与 GitHub Secrets，并以 Actions 首次运行结果为准。
