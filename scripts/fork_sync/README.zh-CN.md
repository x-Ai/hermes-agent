# Fork 自动同步上游

工作流：`.github/workflows/fork-upstream-sync.yml`，也支持在 Actions 页面手动执行。**这是 fork 上唯一启用的工作流**：上游的代码由上游自己的 CI 测试，而上游的工作流在 fork 上本来也跑不起来（它们要的是只有上游才有的 Blacksmith runner，只会排队几个小时后被取消）。每次同步发布都会推送 main，触发了几十个这样的运行（11-07 以来 Docker 34 次、Nix 34 次、auto-fix lint 12 次……全部取消），GitHub 于 2026-11-10 00:16 UTC 以“减少浪费的算力”为由停用了这个 fork 的 Actions。现在另外 49 个工作流都已停用，Publish 每次推送后还会停用任何重新启用或新合并进来的上游工作流（`run.py` 的 `quiet_others`）。这里只测这次合并的结果（fork 的本地化和二开加上 Pi 的冲突处理），这是上游从来没有测过的部分。

每一轮同步结束时都会启动下一轮（`next` 作业），失败的也一样：发布时上游已经超过刚落地的提交，就立即开始下一轮；否则启动一个计时运行。计时运行只有一个作业，GitHub 先按 `fork-sync-timer` 环境的等待计时器（Wait timer，30 分钟）把它挡住，等待期间不占 runner、不计费，`deployment: false` 让这些等待不进部署历史。等完以后，它在稀疏、不带文件内容的 checkout 上检查上游（`run.py` 的 `gate`，几秒钟，不装工具链）：上游 main 有 fork 没有的提交，或者有 fork 还没发布的上游 Release，并且不在失败退避期内，就启动一轮同步，否则启动下一个计时运行。环境被删除后重建、或者没有等待计时器时，计时运行会一个接一个地立即启动，所以 `gate` 发现这个计时运行被挡住不到 5 分钟时就报错，整条链停下（`ensure_waited`）。计时运行有单独的并发组，等待中的计时运行不会挡住手动触发的同步。定时任务（UTC 每小时第 23 和 53 分）只负责重启断掉的链：GitHub 只触发 fork 很少一部分定时时段（这个 cron 在 2026-11-09/11 约 100 个时段里只触发了 5 次），以前追平上游的一轮不接力、只等定时任务，11-11 08:18 之后就有 6 个多小时没有任何运行。取消计时运行会让链停下，直到下一次定时运行；`SYNC_PAUSED` 停掉一切。任何作业都不会占着 runner 空等：以前的 `wait` 作业用 sleep 等待，一直占着一台机器，是 11-10 被停用时的浪费之一。每一轮都从开始合并时的 fork main 出发，而不是触发时的那个提交（`run.py` 的 `start_from_latest_main`）：排在别的运行后面的一轮开始时，前一轮通常已经发布，从触发时的提交出发会把同一批上游提交再合一遍。run 42612409554 就是这样，重做了 run 42611615376 刚落地的 340 个提交，其中一篇文档的中文译法和前一轮不同，发布时与 main 冲突。

## 启用

将本目录、`tests/scripts/test_fork_sync_*.py`、工作流及 `.github/workflows/README.md` 的修改提交到 fork 的默认分支 `main`。仅在本地存在文件不会启用 GitHub Actions。编码 Agent 使用 **Pi**，不包含自研 AI 工具循环。工作流在 runner 临时目录安装固定版本 `@earendil-works/pi-coding-agent@1.5.0`（与本机已安装的 Pi 版本一致），升级时修改工作流中的 `PI_VERSION`。Node 由 Actions 安装，要求版本至少 22.19。

在仓库 **Settings → Secrets and variables → Actions** 配置：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Secret | `SYNC_AI_API_KEY` | 你的 Anthropic 兼容 API Key |
| Variable | `SYNC_AI_BASE_URL` | 你的 HTTPS API 根地址，或包含 `/v1` / `/v1/messages` 的地址 |
| Variable | `SYNC_AI_MODEL` | 端点接受的精确模型 ID，必须支持 Anthropic Messages 的 `tool_use` / `tool_result` |
| Variable（可选） | `SYNC_RELEASES_SINCE` | 开始复制新 Release 的 UTC 时间；默认 `2026-11-07T00:00:00Z` |
| Variable（可选） | `SYNC_PAUSED` | 设为 `true` 暂停整个工作流 |
| Secret（可选） | `SYNC_PUSH_TOKEN` | 仅发布任务使用的专用 GitHub App token 或细粒度 PAT，见下方权限说明 |

控制器在临时 `PI_CODING_AGENT_DIR/models.json` 中创建 `fork-sync` provider：`api` 为 `anthropic-messages`，模型 ID 来自 `SYNC_AI_MODEL`，`apiKey` 只写环境变量引用 `$SYNC_AI_API_KEY`。不读取本机 `auth.json` 或复制登录信息。接口地址的 `/v1` 或 `/v1/messages` 后缀会去掉，由 Pi 的 Anthropic 客户端添加；代理路径前缀会保留。思考级别由 `config.json` 的 `agent.thinking` 决定，默认 `max`：模型标为支持思考（`reasoning: true`），使用 Anthropic 自适应思考（`compat.forceAdaptiveThinking`，请求带 `thinking.type: adaptive` 和 `output_config.effort`），并把 `max` 映射为 effort `max`（不映射时 Pi 会把 max 降为 high）。端点必须接受这两个字段，否则把 `agent.thinking` 改为 `high` 或 `off`。`context_window`（默认 1,000,000）和 `max_tokens`（默认 128,000）按 Opus 5.5 的 1M 上下文和 128k 最大输出设置：`max_tokens` 同时容纳思考和回答，太小会让回答被截断、这一步失败；Pi 在剩余上下文少于 16,384 个 token 时才压缩，所以一步的会话几乎不会被压缩，但每轮请求都带上已有的全部上下文，会话越长，每轮的耗时和费用越高。换模型，或端点的上限更小时，按实际能力调整这两个值。思考越深，每步耗时和费用也越高。端点需要支持 Anthropic 流式工具调用，实际兼容性以首次 Actions 运行验证。

在 **Settings → Environments** 新建 `fork-sync-timer` 环境，只设置 **Wait timer** 为 30 分钟（`gh api -X PUT repos/<owner>/<repo>/environments/fork-sync-timer -F wait_timer=30`）。不要给它加自定义的部署保护规则：它们与 `deployment: false` 不兼容，计时作业会立即失败。公开仓库在免费计划上就能用等待计时器。

在 **Actions** 页面为 fork 启用工作流，然后手动运行 **Fork upstream sync** 检查配置与结果。工作流只在 fork 的 `main` 运行。仓库策略必须允许工作流使用 `contents: write`。若规则要求所有修改走 PR、签名或限制机器人直推，需要为专用自动化身份配置适用规则；脚本不会强推或绕过保护规则。

默认使用自动提供的 `GITHUB_TOKEN`。若上游同步包含 `.github/workflows` 修改，GitHub 可能要求具有 **Workflows: write** 和 **Contents: write** 的 `SYNC_PUSH_TOKEN`。该 token 还会使推送触发普通 CI；仅使用 `GITHUB_TOKEN` 的推送通常不触发后续工作流，因此本工作流已经在推送前独立测试候选提交。无需将写 token 交给 AI 阶段。

## 执行过程

1. **Prepare（只有仓库读取权限）**：获取 upstream main，分页枚举发布时间不早于起始时间的公开 Release，跳过草稿和已存在的 fork Release。上游标签抓取到独立 Git 命名空间，避免覆盖 fork 同名标签。
2. **先处理新 Release，再同步 main**：有尚未包含的上游 Release 时，本轮只朝最早的那个 Release 的提交合并，合并到它就停下，验证后在这次合并上发布 fork 的同名 Release，然后立刻触发下一轮继续同步 main；没有待处理的 Release 时朝 upstream main 最新提交合并。两种情况都分成**有界的步骤**，见下文「分步合并与时间预算」。每一步先由 Git 执行真实合并，没有冲突的改动直接合入；然后无论有没有冲突都调用 `pi --mode json --no-session`，按顺序做三件事：处理合并冲突，为这一步新增的界面文案补齐 i18n，确认没有破坏已有的 i18n 和二开（见「i18n 与二开保留规则」）。Pi 负责工具调用、文件编辑和上下文管理，可使用 Bash 运行针对性检查；控制器只启动 CLI、检查 JSONL 事件和最终 Git 状态。显式启用 read/grep/find/ls/edit/write/bash，禁用 extensions、skills、prompt templates、MCP 和自动加载上下文，不批准项目本地配置。`--offline` 禁止模型目录刷新等自动网络活动，不影响显式模型请求。Pi 不提供工具审批，Bash 能访问该进程的 API 环境及 runner 网络；仅在一次性的 GitHub 托管 runner 中运行。GitHub 凭证不传入 Pi，仓库写凭证只在 Publish 任务出现。
3. **Validate 与 Python tests（无 AI 密钥、无写 token，并行运行）**：两类任务都从 Git bundle 恢复准确的候选提交，通过现有 PM 机制构建锁定依赖。Validate 运行 `scripts/check`、TUI check、桌面端 lint/typecheck 与 UI 测试、Web check，以及 desktop i18n 导出一致性检查，分成几条并行的 lane（`run.py` 的 `validation_lanes`）：一条依次跑 `config.json` 的 `checks`，其余 `ui_shards`（5）条用 vitest 的 `--shard` 把桌面端 UI 测试分开跑。以前一个 4 核作业依次跑完要 23–41 分钟，其中检查约 5 分钟、UI 测试 18–33 分钟；拆开后大约是一个分片加上约 2 分钟准备的时间，检查一项不少。上游是用一台 32 核机器一次跑完，公开仓库的标准 runner 免费，所以这里拆成多台。Python tests 只运行本次合并可能影响的测试文件，分片并行，见下文「Python 测试选择」。测试只能写入任务设置的临时 `HERMES_HOME`，托管 runner 起始时也没有账户默认的 Hermes 主目录；若 `~/.hermes` 在测试期间出现，说明某个测试的子进程没有隔离 `HERMES_HOME`（见 `tests/AGENTS.md`），该分片判定失败。这是 Linux 验证，不包含 macOS/Windows 原生集成或桌面安装包 E2E。
4. **Reconcile（无写 token）**：一轮约两小时，期间 fork 自己的会话常会推送 main。以前发布时 main 一变就整轮作废：2026-11-09 的 run 42545414309 合进了 514 个上游提交，因为期间三个桌面文案修复被推上 main 而被拒，下一轮的起点不到一小时也被两次推送超过。上游的做法是直接推送、事后在 main 上跑 CI；这里仍坚持“未经检查的内容不发布”，但只复查 main 的新提交在候选之上改变了什么（`reconcile.py`）：git 必须能无冲突地合并新 main 和候选；合并结果上跑 `config.json` 的检查——不带 `--dir` 的每次都跑（`scripts/check` 以新 main 为基准），带 `pnpm --dir <目录>` 的只在新提交改到那个目录（或根目录的 `package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`apps/shared/`）时跑；再跑新提交改动的每个桌面文件同目录的 UI 测试，以及从候选到合并结果能波及的 Python 测试（`select_tests.py`）。Python 测试超过一个分片（例如依赖锁或 conftest 改了），或者有冲突，就不合并，下一轮照旧从新 main 开始。main 没变时这个任务只花约一分钟。用当时的真实数据回放：自动生成的合并和手动落地的 `2f5ab6fb04` 树完全一致，选中的检查是 `scripts/check`、桌面 typecheck+lint、i18n key 导出，以及同样的 771 个桌面测试文件。
5. **Publish（仅此任务可写仓库）**：main 还是这一轮的起点时，用普通 fast-forward push 推进到候选；main 已经包含候选（例如只发布 Release 的一轮）时不推送；否则只推送 Reconcile 复查过的合并，并先证明它正是“当前 main 与已验证候选的无冲突合并”：两个父提交分别是当前 main 和候选，树与 `git merge-tree` 重算的结果相同。复查期间 main 又变了，或者没有复查过的合并，就照旧失败，下一轮从新 main 重新计算。然后创建缺失的 Release，Tag 仍打在候选的历史里。

fork 的稳定版 Release 也由本工作流发布，原来手动运行的 `fork-stable-release.yml` 已并入（见「Release 语义」），因此只有本工作流移动 Release 的 Tag；同一时间只运行一个同步，较新的排队运行会替换较旧的。Publish 任务会输出 `continue`：准备阶段结束时还有没合并的 upstream main 或 Release（`remaining`），或者发布时重新拉取的 upstream main 已经超过刚落地的提交，`next` 作业就直接开始下一轮，不经过计时运行。上游整个小时都在合并，一轮跑完通常又落后了；以前只看准备阶段的 `remaining`，追平上游的一轮就不接力，只能等定时任务：run 42581981713 合完了全部 193 个提交，发布时上游又多了一批，之后 1.5 小时都没有运行。AI 时间预算、步骤上限、检查与测试命令、分片参数保存在 `config.json`；Prepare、每条 Validate lane、每个 Python 测试分片、Reconcile 和 Publish 分别有 155/60/90/90/20 分钟硬超时。有更新才调用 AI；落后很多时，追上之前的几轮 API 花费和执行时间会明显增加。

## 分步合并与时间预算

2026-11-07/08 的两次运行都在 Pi 的 60 分钟上限处超时：每轮都从同一个 fork main 出发，合并当时的上游 main 全部新提交，第一次 89 个、第二次 131 个提交（310 个文件、42 个冲突，主要是桌面端 `hermes-bots` 群聊的大改动）。每失败一小时，上游又多出一批提交，下一轮的工作量只会更大，固定时限永远追不上；到 11-08 早上已落后 547 个提交。

现在 Prepare 把积压拆成步骤（`steps.py`），每步只合并上游 main first-parent 链上的一段：

- 用 `git merge-tree --write-tree` 试合并（每次约 0.2 秒，不碰工作区），找出冲突文件不超过 `steps.max_conflicts`（12）、需要审阅的文件不超过 `steps.max_review_files`（60）的最远提交。测试文件、`plugin-catalog/` 和 `contributors/` 不计入审阅文件：它们没有需要本地化的界面文案。
- 上游把一个 PR 的多个提交用同一个提交时间一起落地，CI 只检查其中最后一个；批次中间的状态可能从未验证过（这次积压里就有一个提交新建文件时多了空行，同批后面的提交才删掉）。所以步骤尽量停在批次末尾，只有一个批次本身超过上限时才在批次内拆分。单个提交永不拆分，所以一个超限的提交仍是一步。
- 每轮的 Pi 总时间预算为 `agent.budget_seconds`（100 分钟）。每步可以用完剩余预算，剩余不足 `agent.min_step_seconds`（10 分钟）时不再开始新步骤；预算越少，后面步骤的上限按比例缩小。
- 一轮里一旦完成了一个批次，就不再开始需要拆分的批次（超过步骤上限、只能停在批次中间的那种）：候选提交停在这个批次末尾照常验证发布，并发出警告注解；发布任务随即启动下一轮，由它带着完整预算从大批次开头拆分。以前这一轮会接着拆分，到结束时还没做完的批次里的步骤全部丢弃、下一轮重做：2026-11-08 的 run 42469565069 和 42485861081 各丢掉了约 65–70 分钟的 Pi 工作。从需要拆分的批次开始的一轮照常在批次内拆分，并发布已合并的步骤，避免没有任何进展。
- 第一步失败时本轮失败（与以前相同）；后面的步骤失败或超时，只丢弃这一步，发出 `::warning::` 注解，已完成的步骤照常验证并发布，下一轮从那里继续。
- 每轮只有一个目标：最早的待处理 Release 的提交，没有时是 upstream main 的最新提交。步骤只朝这个目标走，所以发布 Release 的那一轮不会顺带合并它之后的 main 提交。候选提交还不包含的 Release 本轮不发布，下一轮重新发现。

用 11-08 的真实积压（538 个 first-parent 提交）离线演练：7 步到达上游最新提交，控制器自身开销共 22 秒。其中 24 个提交的批次因冲突过多拆成 3 步，另有一个单独的提交带 19 个冲突（把各语言里的“群聊”统一成一个叫法）。

### Pi 的进度日志与超时

以前控制器在 Pi 结束前什么都看不到，超时还会丢掉全部事件，所以 60 分钟用在哪里无从查起。现在 `pi_session.py` 逐行读取 Pi 的 JSON 事件，把每次工具调用写入 Actions 日志：工具名和路径、搜索模式或 bash 命令的第一行，以及失败或超过 1 分钟的调用、模型重试、上下文压缩；不写工具输出或模型正文，API Key 由 Actions 的 secret 遮蔽。每次结束时汇总模型轮数、输出 token、各工具耗时，并列出超时那一刻仍在运行的工具。Pi 最后的完成摘要也会写入日志。Pi 返回 `blocked` 时，它给出的原因（合成一行，最多 600 个字符）写进这一步被丢弃的警告注解和 `step-<n>.json`：进度日志不记录模型正文，以前只剩一句 “Pi did not confirm completion”，看不出为什么停下。

Pi 的 bash 工具没有默认超时，每条命令都在自己的进程组里运行；Pi 收到 SIGTERM 时会杀掉这些进程组，收到 SIGKILL 则来不及清理。两次超时的运行结束时都留下了仍在运行的 node 孤儿进程。现在超时先发 SIGTERM，20 秒后仍未退出才 SIGKILL。

`prompt.md` 会告诉 Pi 本步的剩余时间和截止时间（`time_limit_minutes`、`deadline_utc`），并说明完整验证由后续任务负责：不要跑整个 Python 测试集、整个测试目录、`pnpm install` 或整个桌面端/TUI 测试套件，每条 bash 命令带不超过 600 秒的超时。依赖已经装好，所以它要跑覆盖自己改动的测试文件，见下文「桌面端改动要过测试」。每一轮不管命令多小，Pi 都要完整思考一次：拟合 30 次会话的数据，每轮的固定开销约 1 秒，其余时间和输出 token 数成正比（约 104 token/s）；而它约 62% 的命令是只读的，48% 处在连续 3 条以上只读命令的串里。所以提示词要求它把已经知道要看的只读命令合成一次调用（每部分用 head、sed -n 或 grep -n 限定范围），或在同一轮里一起发出，只有后一条依赖前一条的输出时才分开；一次调用的输出要控制在约 50 KB 以内，因为 Pi 的 bash 工具只保留最后 2,000 行或 50 KB。思考等级保持 `max` 不变，测试要求也不变。

### 不允许丢失测试

第二次超时时 Pi 已经清掉全部冲突标记，但为此删掉了上游的测试：两个新测试文件整个删除，一个文件从 463 行删到 80 行，9 个冲突文件直接整体保留 fork 版本，共丢失 17 个测试用例。如果它按时完成，验证会通过，因为对应的测试已经不在了。

现在每步结束后，控制器（`dropped_tests.py`）比较本步涉及的每个测试文件在共同祖先、fork 和 upstream 中的测试用例名（Python 的 `def test_*`，JS/TS 的 `it(...)`/`test(...)` 标题），按三方合并规则计算应保留的用例：任一方新增的、双方都保留的都必须在；只有一方删除的视为有意删除。按名称在同类文件间汇总计数，所以随文件重命名移动的测试不算丢失；标题按去掉转义后的文本比较，格式化工具换引号不影响结果。用 fork 过去 6 次合并上游的结果检验：5 次无误报；另一次（`0e00c9a356`，v0.23.0 合并）报告的 7 个用例确实被那次合并丢掉了，至今不在 main 上。

发现丢失的测试或残留的冲突标记时，只要剩余时间不少于 5 分钟，控制器会把问题清单交给 Pi 做一次修复；仍未解决则本步失败。

### 桌面端改动要过测试

2026-11-08 的 run 42496743929 合并了上游 Bot Mode 群聊批次的前 4 步，Validate 里桌面端 `test:ui` 有 4 个测试失败。一是 `hermes-bots/i18n_ru_ar.test.ts` 的守护测试：上游新增的 `manual | smart`、`hermes gateway run` 是要原样输入的值，不能翻译，但守护测试的白名单里没有它们。二是 `hermes-bots/group-chat-gateway-owner.test.ts`：群聊的网关归属在 fork 的存储路径里丢了。Pi 当时没法发现这些问题：Prepare 的 runner 上没有 `node_modules`，提示词也禁止 `pnpm install` 和跑桌面端测试，它每次的总结里都写着 “No tests or type checks ran”。失败也不会反馈给下一轮，下一轮从同一个基点重做同样的合并。

现在：

- Prepare 先装好与 Validate 相同的工具链和锁定的 JS 依赖（`setup-pm` 加 `pnpm install --frozen-lockfile`，命中缓存时不到一分钟）。Pi 可以跑覆盖自己改动的 vitest 文件，改了 TypeScript 后跑 `typecheck`，也可以跑定向的 Python 测试文件，测试环境已经就绪。
- 同样在每次 Pi 结束一轮后，控制器（`repo_checks.py`）先对合并后的工作区跑一遍 `scripts/check --staged --base <这一步开始时的提交>`：用一个临时索引装下工作区的内容，不动合并本身的索引；失败的检查连同它打印的行（包括 `fix:` 提示）交给 Pi 修复，规则与下面的桌面测试相同。2026-11-10/11 有两轮在 Validate 的 `scripts/check` 上失败，整轮合并都白做了：run 42905269398 的合并让 `hermes_cli/model_switch.py` 变成 2,001 行，比上限多一行（fork 自己的行加上上游新增的行）；run 42935109164 停在上游一个提交上，那里的插件目录文案写死了系统临时目录的路径，上游在这一轮拉取后 9 分钟才改掉。这两种 Pi 都能在这一步里修：把 fork 的代码挪进同主题的 `<stem>_<topic>.py`，或者按检查要求改写那一行。拿 run 42905269398 被拒的候选提交回放，这项检查在本机 17 秒就报出了同一个 `FILE_LINES` 问题。
- 每次 Pi 结束一轮后，只要没有残留冲突标记，控制器（`desktop_tests.py`）就自己跑一遍这一步涉及的桌面端 UI 测试：这一步新增或修改的测试文件，加上每个改动的桌面端文件所在目录里的全部测试文件（不含子目录）。不按 import 关系选（`vitest related`），因为任何语言包或 SDK 入口都会牵出几乎整个测试集（在 runner 上约半小时）；同目录的测试就是为这些文件写的，语言包旁边的 i18n 守护测试也在其中。拿那次失败的候选提交回放：50 个改动文件分布在 3 个目录，选中 203 个测试文件，本机 44 秒跑完，失败的正好是 Validate 那 4 个，其余 1,800 个通过。
- 失败的测试（文件、测试名、错误的第一行和所在行号，最多列 20 个）交给 Pi 做修复，规则与冲突标记、丢失测试相同：剩余时间不少于 5 分钟才修，仍失败则本步失败。第一步失败时整轮失败，后面的步骤失败只丢弃这一步。
- 这一步改了 `pnpm-lock.yaml`、`pnpm-workspace.yaml` 或任何 `package.json` 时，先执行 `pnpm install --frozen-lockfile`；锁文件装不上也算这一步的问题，交给 Pi 修复。
- 测试跑的是候选代码，所以测试进程的环境去掉了 `GH_*` 和 `SYNC_*`，不带 AI Key 和 GitHub token。单次最长 45 分钟：runner 上每个测试文件约 1.1 秒，run 42545414309 的一步选中了 753 个文件，跑了 13.5 分钟，离原来 15 分钟的上限只差一点；完整的 UI 套件在 Validate 里要 18–33 分钟，一步改动波及大部分目录时，检查不能因为超时而误判失败。最后一步的检查可能超出 Pi 的预算，所以 Prepare 的硬超时是 155 分钟。

Pi 的 bash 工具把每个非零退出码都标成 `isError`（没有匹配的 grep、Pi 随后修好的失败测试都会这样），控制器以前把它当成会话错误，所以任何一次正常的失败命令都会让整轮无法发布。现在工具调用失败只是给模型的反馈；模型或服务端错误仍会阻止发布。合并结果的空白检查也只拦截两个父提交里都没有的空白错误，上游自己写的空白（例如 Markdown 用行尾两个空格换行）不再导致失败。

## Python 测试选择

完整 Python 测试集约 7,300 个文件、5.4 万个测试，在一台 4 核托管 runner 上约需 3 小时，超过单条命令 60 分钟的上限。候选提交与已通过验证的 fork main 只差这次合并，上游 CI 也已在上游代码上跑过上游的测试，所以 Prepare 在合并完成后用 `select_tests.py` 静态分析候选树，把可能受影响的测试文件写入产物 `tests.txt`：

- 本次改动的测试文件；
- 直接引用改动文件的测试：import（包括函数内的延迟 import）、指向模块的点分字符串（`mock.patch` 目标、`import_module` 参数）、按路径或少见文件名写出的文件，以及「目录名 + 文件名、通配符或后缀」引用的数据文件（如 `"locales"` 与 `"*.yaml"`）。`tests/` 下的辅助模块算作导入它的测试的一部分；
- fork 自有代码用到改动文件时，该 fork 模块的测试。只看与上游不同的那些行（新增的 import、这些行用到的已导入名称和字符串），fork 为某个功能改过的大文件不会因为任意上游改动拉入它的全部测试；
- `conftest.py` 改动，或 conftest 加载的测试辅助模块改动时，该 conftest 所在目录下的全部测试。产品模块经 conftest 间接到达时不扩散。

`pyproject.toml`、`uv.lock`、`pm/lock.json`（`config.json` 的 `tests.full_suite`）改动时运行全部测试。不追踪完整的传递 import 闭包：延迟 import 让几乎所有模块互相可达，任何改动都会选中整个测试集。

选中的测试按 `def test_` 数量估算工作量（测试运行器自己的进度估计），每个分片约 `tests_per_shard`（10,000 个，约 30 分钟），最多 `max_shards` 个；每个分片是一个并行任务，运行 `run_tests.sh --files-from tests.txt --slice i/N`。全量测试约 6 个分片。没有选中任何测试时（例如只改了前端或文档），跳过 Python 测试任务，Publish 照常进行。ubuntu-latest 不带 ripgrep 和 tmux，测试任务先安装它们：搜索工具和 doctor 的 PM 存储探针测试要用 ripgrep（与上游 `tests.yml` 同一个固定版本，校验 sha256），经典视图聊天套件在 tmux 里驱动真实 CLI（上游 Blacksmith 镜像自带）。

失败的测试文件会在新的子进程里重跑一次（`--file-retries 1`，即测试运行器的默认值，上游 CI 也这样跑）。重跑通过的文件算通过，但运行器会在摘要里把它列为 FLAKY 并附上两次的输出，分片还会为它发一条警告注解，所以绿色的运行也看得到。确定性的失败两次都会失败，照样阻止发布；超时或被杀掉的文件不重跑。以前这里设为 0 次：2026-11-08 的 run 42469565069 中，Prepare 花了约 85 分钟 Pi 时间，最后整轮作废，原因只是上游新加的真实浏览器测试 `tests/tools/test_browser_real_profile_logins_live.py` 有一次在 20 秒内没等到 Chrome 的 CDP 端口。同一个候选提交、同一个分片换一台 runner 重放，全部通过；这个文件单独在 ubuntu-26.04 和 24.04 上跑也都通过。上游 CI 是 32 核 runner、单文件重跑一次，fork 的分片是 4 核 runner、负载约 5，上游测试的偶发失败在这里更常见。

用 2026-10-31 以来上游 main 的逐小时窗口回放：中位数约为全量测试时间的 5%，四分之三的窗口不超过约 24%，多数只需一个分片；约 12% 的窗口因 conftest、根测试 fixture 或依赖锁改动需要全量，此时 6 个分片并行，墙钟时间约 40 分钟。

这是静态分析的取舍：经过两层以上、且中间模块与上游相同的间接依赖不会被选中，例如测试导入 B、B 再使用改动的 C。这类组合已由上游 CI 在上游代码上验证。若某类改动必须全量测试，把对应路径加入 `full_suite`。在本地预览某个候选提交会选中哪些测试（先检出该候选提交）：

```bash
python scripts/fork_sync/select_tests.py --base <fork main 提交> --upstream <合并的上游提交> --list
```

## i18n 与二开保留规则

`prompt.md` 让 Pi 在每一步按这个顺序工作（工作流步骤名 “Merge upstream (new release first), resolve conflicts, localize new text, keep fork i18n and features” 即此意）：

1. **处理合并冲突，二开要智能判断**：改冲突文件之前，先用 `git log <merge_base>..<base> -- <文件>` 查 fork 自己在这个文件上的提交，用 `git show` 看每个提交改了什么，从提交说明了解二开的意图（本地化、二开功能、fork 修复、端点或发布身份）；用 `<merge_base>..<upstream>` 同样了解上游的改动。然后比较共同祖先、fork 和 upstream 三个版本，逐块保留双方意图：上游的修复或功能要合入，fork 的改动也要保留（代码挪动时改写到上游的新代码上）；上游已经做了同样修复、或删掉了被二开定制的代码时，fork 的改动可以去掉，但要在总结里说明；上游改写了 fork 已翻译的文案时，按上游的新英文重新翻译，不保留过时译文，也不换回英文。禁止整批 ours/theirs 取舍、删除测试或放松检查。
2. **新增文本做 i18n**：即使没有冲突，也审查这一步上游改动的全部界面文案，新增的英文接入项目现有的 Python、TUI、Desktop i18n API。简体中文和繁体中文完整覆盖，其他语言遵循现有键与覆盖率约束，保留变量、占位符和运行时类型。
3. **不破坏 i18n 和二开**：保留 fork 的端点与模型配置、更新器与发布身份、界面行为、已有译文和 i18n 机制等二开改动，非平凡的冲突处理要加回归测试。

冲突文件如果被整体解决成某一方的版本（与 fork 或 upstream 的版本逐字节相同），控制器会在日志里列出，并写进这一步的合并提交说明（“Conflicted files left exactly as the fork / upstream had them: …”）：有时确实应该取一方，但整体取一方也正是二开改动或上游修复悄悄丢失的方式。Pi 必须在总结里说明每个这样的文件和理由；总结没提到的会发出警告注解，但不阻止合并。合并提交标题为 `chore(sync): merge <目标> <提交>, keep the fork's i18n and features`。

Pi 能读取上下文并尝试解决二开冲突，但不能保证所有语义冲突都判断正确。已有测试和新增回归测试提供检查依据。`.github/`、`scripts/fork_sync/` 和本自动化的测试文件在提示词中禁止改动，并在 Agent 调用前后比较文件快照；变化则阻塞。调用后还会核对 HEAD 和 MERGE_HEAD，防止 Agent 自行提交或中止合并。自动化控制文件冲突需维护者处理；无法可靠解决的冲突必须返回 blocked。检查失败不会因为 Agent 自称成功就继续发布。

## Release 语义

fork 的 vX.Y.Z = 上游 vX.Y.Z 加上本仓库的改动，`hermes update --set-channel stable` 和桌面端的稳定版选择器解析的就是这些 Release（`hermes_cli/source_releases._resolve_release`）。以前由手动的 `fork-stable-release.yml` 发布，现在每次定时同步自动完成：

- 新 Release 的 **Tag 名、标题和 prerelease 标志**来自上游；正文是上游原文，后面追加 fork 说明：上游标签提交、fork 发布提交、已同步到的上游 main 提交、自上一个 fork 稳定版以来本仓库的自有提交（最多列 40 个），以及与上游同版本的完整差异链接。
- Tag 指向**最早包含该上游标签提交的 fork 提交**，也就是合并它的那次提交：先处理 Release 的流程里就是这一轮验证过的候选提交，不含之后的 main 提交。包含中文、二开及该上游 Release 的真实提交；GitHub 自动生成的 Source code ZIP/TAR 因而包含 fork 改动。已经被 main 包含的 Release（回填或上游晚发布）不再合并，直接在 main 当初合并它的提交上发布，这一轮也跳过 Validate。v0.23.0 以前手动发布的 v0.21.7–v0.22.6 打在当时的 main 上，保持原样。
- Release 分支可能含 main 没有的提交，准备阶段也会合并它们；发布前要求真实祖先关系，不把缺少对象或 Git 错误当作已同步。
- 已存在的 fork Release 和已上传附件保持原样，避免轮询重写人工发布记录；这也意味着不会追踪上游对旧 Release 正文的后续编辑。要重新发布某个版本，在 GitHub 上删除该 fork Release，下一轮会重新发布（版本须在 `SYNC_RELEASES_SINCE` 之后）。
- 只将上游 `/releases/latest` 对应的正式版本标记为 latest，补发历史版本不会抢占 latest；预发布保留预发布标志。
- 不直接复制上游二进制附件：它们没有你的本地化或二开代码。当前核实的上游 Release 没有附件。若以后需要中文安装包，应基于 fork Tag 接入现有构建流程并上传；本工作流仅发布源码 Release。
- 默认从 `2026-11-07T00:00:00Z` 开始，不自动补全之前缺失的历史版本。修改 `SYNC_RELEASES_SINCE` 可显式回填；所有符合条件的版本分页处理，不只读取 latest。

## 故障与重试

Pi 非零退出、超时、JSONL 中的模型错误、缺少 `agent_settled` 或最终成功 JSON、冲突残留、丢失测试、测试失败（重跑一次仍失败）或推送拒绝都会让对应步骤或整轮失败，不能发布未通过检查的内容；第一步之后的步骤失败时，只丢弃这一步，已完成的步骤照常验证发布。模型错误采用保守策略：即使 Pi 后续自行重试成功，这一步仍算失败。prepare 会尽量上传 `fork-sync-candidate` 诊断产物；成功准备时包含候选 bundle/manifest，每个失败的步骤还会保存 `step-<n>.patch`（已跟踪文件的工作区 patch）和 `step-<n>.json`（步骤信息、错误和冲突列表）。以前的恢复 bundle 打包了整个仓库历史（约 1.2 GB），已删除。产物保存 7 天，不包含 API Key、模型完整对话或环境转储。失败时没有自动创建 PR/远端待处理分支，避免依赖额外 PR 写权限。

失败后由计时运行（链断了时由定时任务）重试，并按失败次数退避：自上次成功发布（同步机器人在 main 上最新的提交）以来每多失败一轮，等待时间翻倍，从最近一次失败结束算起，依次为 30 分钟、1、2 小时，最长 4 小时（`run.py` 的 `backoff_until`）。这样偶发的网络故障（例如 GitHub Release 下载 504，2026-11-09 的 run 42568240608 就是因此在 Validate 安装依赖时失败）半小时后就会重试，而反复出现的失败不会每半小时都花一次模型预算。退避期间，计时运行的 `gate` 只检查，然后启动下一个计时运行，并在日志里给出下一次合并的时间；退避中的定时运行只做检查就结束，并在运行页面给出下一次合并的时间。手动触发的运行和发布后接力的运行不退避。计时运行在空闲时占了运行列表的大部分，所以退避读取最近 100 个运行，而不是 30 个，这样最长的退避也还能看到之前的失败。新 Release 优先处理，所以一个反复合并失败的 Release 也会挡住 main 的同步；要跳过它，在 fork 中为同一个 Tag 创建 Release（草稿也可以，它会占用这个 Tag 名），同步就不再处理它。持续失败时可设置 `SYNC_PAUSED=true` 控制 API 支出，在 Actions 日志定位失败步骤。检查失败不会自动放松测试；调整规则应作为独立维护变更审查。发布阶段若 main 已推进但 Release 创建失败，不回滚 main，后续轮询补齐尚未创建的 Release；已发布版本不会重复创建。

上游无变更、且没有待同步的新 Release 时，计时运行的 `gate` 不启动同步，只启动下一个计时运行，几秒钟就结束，不安装工具链、不调用模型。定时或手动触发的一轮遇到这种情况时，由 Prepare 判定后结束，不调用模型；Prepare 在判定前已经装好工具链和前端依赖（约 2 分钟）。每轮 Pi 总预算默认 100 分钟，配置位于 `config.json`；Pi CLI 没有采用自研轮数计数器，上下文压缩交给 Pi。任一 Validate lane、Python 测试分片或 Reconcile 的复查失败后，本轮停止，下一轮重新尝试。

## 本地验证自动化本身

按照项目规定使用 `scripts/run_tests.sh`，测试采用临时 Git 仓库、模拟 CLI 结果与 GitHub API，不调用付费模型、不操作真实 Release：

```bash
bash scripts/run_tests.sh tests/scripts/test_fork_sync_releases.py tests/scripts/test_fork_sync_run.py tests/scripts/test_fork_sync_select.py tests/scripts/test_fork_sync_steps.py tests/scripts/test_fork_sync_pi.py tests/scripts/test_fork_sync_desktop.py tests/scripts/test_fork_sync_reconcile.py -j 7 --file-retries 0 -q
python scripts/check --base HEAD
```

`run.py prepare/publish` 会访问实际远端；不要把这些子命令当作本地单元测试执行。首次端到端验证需要用户自己的端点、模型与 GitHub Secrets，并以 Actions 首次运行结果为准。
