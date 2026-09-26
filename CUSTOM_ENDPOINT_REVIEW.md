# "提供方 → 自定义端点" 二开实现审查

审查对象：`origin/main`（HEAD `fbe96035ae`）相对 `upstream/main`（merge-base `d0288be5b3`）在自定义端点链路上的全部差异，以及这些差异所嵌入的运行时路径。范围覆盖桌面端设置页（`apps/desktop/src/app/settings/custom-endpoints-settings.tsx`）、Web 路由（`hermes_cli/web_routers/config_env.py`）、配置归一化（`hermes_cli/config_providers.py`）、运行时解析（`hermes_cli/runtime_provider*.py`）、模型发现（`hermes_cli/models.py`、`model_switch_providers.py`）、请求构造（`agent/anthropic_adapter.py`、`agent/output_tokens.py`、`run_agent.py`、`agent/auxiliary_client.py`）和 TUI/Desktop 会话同步（`tui_gateway/session_compression.py`、`tui_gateway/model_switch.py`）。

方法：逐文件读 diff，再回到完整源码追踪每个新字段从 UI → 配置 → 运行时 → 请求体的全链路。仓库自带 `.venv` 是 macOS 解释器，沙箱内无法执行 `scripts/run_tests.sh`，因此本报告结论全部基于静态阅读，未运行测试。行号以当前 HEAD 为准。

---

## 1. 二开引入了什么（先说做对的部分）

这轮二开把"自定义端点"从"URL + key + 模型名"扩展成了带 token 预算、认证方式和协议同步的完整提供方模型，主线方向是对的：

| 能力 | 实现位置 | 评价 |
|---|---|---|
| 每模型 `context_length / max_input_tokens / max_output_tokens`（`model_token_limits`） | `config_providers.py:190,585,625`、`config_env.py:423,694`、UI 每模型表格 | 精确到模型、可清空回落自动推断，设计合理 |
| provider 级 `max_output_tokens` / `max_tokens` 别名 | `config_providers.py:283-289`、`runtime_provider_custom.py:94` | 合理 |
| `/models` 目录采集 `max_output_tokens` 并持久化（`DiscoveredModelList`、cache schema v2） | `models.py:2499-2540`、`model_switch_providers.py:31-96` | 用端点自述能力替代模型名猜测，是通用化的正确抓手 |
| `auth_scheme: bearer / x-api-key` 显式覆盖 | `config_providers.py:299`、`anthropic_adapter.py:363-397` | 覆盖优先于内置主机表，方向正确（但只接了一条协议，见 2.1-D） |
| 命名端点的显式 `api_mode` 不再被 host-mandated 模式覆盖 | `model_switch.py:1600-1603` | "用户显式配置优先"，正确 |
| 端点协议被修改后驻留会话自动 `switch_model` | `tui_gateway/model_switch.py:464` | 合理 |
| `_max_tokens_param` 去掉按模型名猜 `max_completion_tokens` | `run_agent.py:698` | 方向正确，但只改了一半（见 2.1-E） |
| provider_key 与显示名冲突 / 同 URL 多端点的身份隔离 | `config_providers.py:585`、`runtime_provider_custom.py:171-177` | 合理 |
| `max_input_tokens` 由 `ContextCompressor` 自己解析 | `context_compressor.py:2614` | **这是正确的接线模式**：在消费组件内解析，所有入口自动生效；`max_output_tokens` 没有照此做（见 2.3-1） |

---

## 2. 问题清单

严重程度：**高** = 导致请求失败/静默行为错误，或能力在主要入口不生效；**中** = 通用化缺口，尚可用配置绕过；**低** = 一致性/维护性。

### 2.1 二开自身引入的"特定模型 / 厂商兜底"与非通用行为

**A. 新建端点默认写入伪装的 Chrome User-Agent（高）**

`custom-endpoints-settings.tsx:58-59,75` 把 `Mozilla/5.0 (Windows NT 10.0; Win64; x64) ... Chrome/138.0.0.0 Safari/537.36` 作为 `EMPTY_FORM.userAgent`，保存后经 `config_env.py:791-802` 写进 `extra_headers.User-Agent`，运行时在 OpenAI 线和 Anthropic 线（`anthropic_adapter.py:399-419`，配置头最后合并、覆盖 SDK/归因头）都生效。i18n 提示写明动机是"避免被代理或 WAF 拦截"——这是针对一类中继站的兜底，却成了所有新端点的默认值：

它会破坏依赖 UA 做能力判定的端点（Kimi `/coding` 要求 claude-code UA，upstream `anthropic_endpoints._is_kimi_coding_endpoint` 专门为它设 UA，而用户 `extra_headers` 优先级更高会把它盖掉）；对自建网关/审计日志隐藏了真实客户端身份，对部分厂商属于违反使用条款的行为，不应是隐式默认；`Chrome/138` 硬编码会过期。

建议：默认留空（SDK 默认 UA），浏览器 UA 只作占位符/一键预设；更进一步把 UA 单字段换成通用的 `extra_headers` 键值编辑器（见 2.3-4）。

**B. Anthropic 线第三方端点未知模型 `max_tokens` 兜底 16 384（中）**

`anthropic_adapter.py:162-177`：`_resolve_positive_anthropic_max_tokens(requested)` → 模型名子串表 `_ANTHROPIC_OUTPUT_LIMITS`（`:120`，含 claude 各代、`minimax`、`qwen3`）→ 第三方主机固定 `16_384`，Anthropic 官方主机 `128_000`。upstream 原本对未知模型统一 128K（依赖 400 后按 `"max_tokens is limited to N"` 解析重试），二开改成 16K 是为了避开某些中继的 400，代价是 GLM / Kimi / DeepSeek 等经 Anthropic 兼容中继服务的模型长输出被静默截断在 16K。

现状里用户可以用每模型 `max_output_tokens` 覆盖，所以不算死锁，但：这个默认值本身不可配置（provider 级默认在桌面端保存时会被抹掉，见 2.3-3）；`minimax` / `qwen3` 仍然是靠模型名命中的表项，与"通用化"目标相悖。建议把"第三方未知模型默认输出上限"变成 provider 级可配置项（UI 提供"所有模型默认"一行），代码常量只作最后兜底，并在日志里标明 `max_tokens` 来源。

**C. 与内置 provider 同名的自定义端点靠 `HERMES_CUSTOM_*_API_KEY` 命名约定识别（中）**

`providers.py:431 is_saved_custom_endpoint` 以 `key_env` 是否匹配 `HERMES_CUSTOM_<ID>_API_KEY` 判断"这是自定义端点"，被 `runtime_provider.py:481-512`、`model_switch_providers.py:985-991`、`web_server_config.py:496-506` 三处用来把 `providers.xai`（用户把中继命名为 `xai`）改写成 `custom:xai`。这是用一个偶然的实现痕迹（env 变量命名）承载结构性语义，以下场景全部漏判：无 key 的本地端点（Ollama / vLLM 取名 `openai`）、手写 `key_env: MY_KEY`、内联 `api_key`、`${VAR}` 模板、`key_cmd`。

更根本的问题在写入侧：`providers.<内置 id>` 同时是 upstream 定义的内置 provider 覆盖块（`providers.<id>.request_timeout_seconds`、`providers.openai.models.<m>.timeout_seconds` 等，见 `website/docs/user-guide/configuration.md:164-166`），桌面端 `_write_custom_endpoint`（`config_env.py:605`）对 id 没有任何冲突校验，允许用户直接写进这个块。建议在写入侧拒绝或自动改写与 `PROVIDER_REGISTRY` / models.dev id 冲突的端点 id（422 并提示），运行时三处兜底随之删除；若必须保留运行时识别，判据应改为"条目有 `base_url` 且其 host 不是该内置 provider 的默认 host"。

**D. `auth_scheme` 只接入 Anthropic 线（中）**

后端接受任意 `api_mode` 的 `auth_scheme`（`config_providers.py:299`），但唯一消费者是 `anthropic_adapter._requires_bearer_auth`；UI 只在 `apiMode === 'anthropic_messages'` 时显示，其它模式强制清空（`custom-endpoints-settings.tsx:149,583`）。`chat_completions` / `codex_responses` 线固定 `Authorization: Bearer`，Azure 风格 `api-key`、企业网关 `x-api-key` 等 OpenAI 兼容端点无法通过 UI 配置。`api_mode` 为空（自动检测）而 URL 命中 `/anthropic` 后缀时，UI 也不给出该字段。建议把 `auth_scheme` 扩成 `auth_header`（名称）+ `auth_prefix`（可空）两个通用字段，三条协议线共用一个注入点，`api_mode` 为空时也允许设置。

**E. `max_completion_tokens` 的模型名猜测只在主路径删除，辅助路径仍在（中）**

`run_agent.py:698 _max_tokens_param` 已改为只看 URL；`agent/auxiliary_client.py:5743 auxiliary_max_tokens_param` 仍调用 `utils.model_forces_max_completion_tokens(model)`（`utils.py:670`，`gpt-4o / gpt-4.1 / gpt-5 / o1 / o3 / o4` 前缀）。同一个自定义端点，主对话发 `max_tokens`，压缩 / 标题 / 视觉等辅助调用发 `max_completion_tokens`。并且删除猜测后没有给出替代配置：严格透传到 OpenAI 的中继（不做参数翻译）在 gpt-5 / o 系列上主路径会 400 `unsupported_parameter`，而主路径没有辅助路径那样的"剥离 `max_tokens` 重试"梯子（`auxiliary_client.py:7500-7530`）。建议增加 provider / 模型级 `max_tokens_field: max_tokens | max_completion_tokens`（默认 `max_tokens`），两条路径共用；至少让两条路径一致。

### 2.2 能力接线不完整 / 缺失

**1. `max_output_tokens` 只在 gateway 和 TUI/Desktop 生效，CLI、batch、cron、ACP、side-agent 全部不生效（高）**

生效路径只有两条：messaging gateway / api_server 经 `gateway/run.py:2325 _runtime_output_limit_kwargs` 把 `runtime["max_output_tokens"]` 传给 `AIAgent(max_tokens=...)`；TUI/Desktop 经 `tui_gateway/session_compression.py:218-225` 在每轮开始的配置同步里写 `agent.max_tokens`。而 `hermes_cli/cli_agent_setup_mixin.py:660`（`hermes` REPL / `-q`）、`tui_gateway/server.py:2533 _make_agent`（会话初建，依赖后续同步补上）、`batch_runner.py`、`cron/scheduler.py`、`acp_adapter/session.py`、`tui_gateway/methods_prompt.py:919,997`（后台/预览 side agent）构造 `AIAgent` 时都不传 `max_tokens`，`agent/agent_init.py` 也没有从 `_custom_providers` 解析的兜底（`max_tokens` 仅作 `_PASSTHROUGH_PARAMS`，`:2374`）。`/model` 切换路径 `agent_runtime_helpers.py` 同样不重算 `max_tokens`。

同时存在三套优先级不完全一致的解析实现：`runtime_provider_custom._lift_max_output_tokens`（`:94`）、`config_providers.get_custom_provider_token_limits`（`:625`）、`agent/output_tokens.resolve_output_token_limit`（`:62`，把 discovered 的 `models[m]` 排在 provider 级之后，前两者排在之前）。`output_tokens.output_token_limit_for_agent`（`:199`）在生产代码里无任何调用者，只有测试引用——按 `AGENTS.md`"不要接入没有 E2E 的死代码"应删除或真正接入。

建议：照 `max_input_tokens` 的做法，在 `agent_init` 的路由解析阶段（`_resolve_context_length` 旁边）用 `get_custom_provider_token_limits` 统一解析 `max_tokens`（显式传入 > 配置 > discovered > None），删除各入口的零散传参和 `output_tokens.py` 中重复的解析层，只保留 `compression_output_budget`。

**2. "测试"探测不使用二开新增的认证 / 头字段（高）**

`config_env.py:956 validate_custom_endpoint` 只带 `Accept` 和 `Authorization: Bearer`；`auth_scheme`、`user_agent`、已保存的 `extra_headers` 一概不发，`_probe_transport_route` 对 Anthropic 线同时发 Bearer 和 `x-api-key`（`:1040-1043`）。结果是探测与真实运行时的请求头不一致：WAF 拦 UA 的中继"测试失败、实际能用"，只认 Bearer 的中继"测试通过、实际 401"。此外编辑已保存端点时表单 `apiKey` 为空，探测不带任何凭据直接 401（upstream 已有的问题，但新增字段放大了偏差）。建议探测复用运行时同一个头构造函数，编辑态用 `key_env` 解析已存 key。

**3. 桌面端每次保存都抹掉 provider 级默认值（中）**

`toPayload` 对每个模型总是发送三字段（`custom-endpoints-settings.tsx:121-140`），后端 `owned_fields` 因而恒为全集，`config_env.py:700-708` 无条件 `pop` 掉 `entry.context_length / max_input_tokens / max_output_tokens / max_tokens`。读路径把 provider 级值展开成每模型显示值（`:432,448`），保存后变成 `model_token_limits` 里的每模型钉死值；之后新发现的模型没有默认可继承，`_lift_max_output_tokens` 的 `provider` 来源也随之消失。UI 没有"所有模型默认"一行，几十上百个 discovered 模型只能逐个填。建议 UI 增加 provider 级默认行，后端只在用户显式清空该行时才 `pop` 条目级字段。

**4. UI 暴露的字段远少于配置面（中）**

`config_providers._KNOWN_PROVIDER_KEYS`（`:117-126`）和 upstream 文档（`website/docs/integrations/providers.md:1350`）支持 `extra_body`、`extra_headers`、`key_cmd`、`catalog_provider`、`ssl_verify / ssl_ca_cert`、`session_affinity_header`、`request_timeout_seconds / stale_timeout_seconds`、`rate_limit_delay`、`enabled`，每模型 `supports_vision / supports_reasoning / timeout_seconds`。桌面端只有 name / id / URL / api_mode / auth_scheme / 默认模型 / 三个 token 字段 / key / UA / 两个开关。对"通用化"最关键、缺失影响最大的四个：`extra_body`（`enable_thinking`、`chat_template_kwargs`、`reasoning` 等任意端点私有字段的唯一通用出口）、`extra_headers`（通用头而非 UA 单字段）、每模型 `supports_vision / supports_reasoning`（否则回落到 models.dev 按模型名查表，见 2.4）、`catalog_provider`（中继场景一键继承厂商元数据）。

**5. discovered 目录的"过期"判定改为整 dict 比较，会覆盖用户 / 桌面写入的每模型字段（中）**

`model_switch_providers.py:79-94`：upstream 只比较模型 id 列表，二开改为 `existing != expected`（`expected` 只含探测到的 metadata）。对 `models_discovered: True` 的条目，任何额外字段——桌面保存写入的 `canonical_model / reasoning_effort`（`config_env.py:668-674`）、手写的 `supports_vision`——都会让目录被判为过期并在下次 picker 探测时整体重写清空。二开同时把 `_save_discovered_models_to_config` 的写入范围从 legacy 列表扩大到 `providers:` 字典（`:42-50`），放大了影响面。建议比较时只看 metadata 子集（对每个模型只比较 `max_output_tokens` 等采集字段），或重写时合并而非替换。

**6. 新字段零文档（低）**

`model_token_limits`、`max_input_tokens`、`max_output_tokens`、`auth_scheme`、`extra_headers.User-Agent` 约定在 `website/docs`（含 zh-CN）中均无描述；`AGENTS.md` 要求字段变更同 PR 更新文档。

**7. 其它小项（低）**

`_normalize_model_token_limits`（`config_providers.py:190`）和 `_normalize_custom_provider_entry` 的 `max_*` 校验只接受 `int`，手写 YAML 的 `"131072"` 字符串被静默丢弃，而 `get_custom_provider_token_limits._positive_int` 接受字符串，两处不一致。`_sync_named_custom_endpoint_protocol`（`tui_gateway/model_switch.py:464`）在条目没有显式 `api_mode` 时用 `_fallback_api_mode` 的 URL 推断值与会话 `api_mode` 比较，理论上可能在首轮触发一次多余的 `switch_model`（重建客户端），建议只在条目显式配置了 `api_mode` 时同步。`models.py:2514 _models_from_catalog` 把 `/models` 行里的裸 `max_tokens` 当输出上限，个别服务器用这个键表示上下文窗口，建议只在 `capabilities.max_output_tokens / max_output_tokens / max_completion_tokens` 缺失时才采用并打 debug 日志。

### 2.3 继承自 upstream、作用于自定义端点且目前无法按端点覆盖的模型名 / 厂商特判

这些不是二开引入的，但决定了"通用化"还差多远。列出的是会在**任意第三方 host** 上触发的条目：

| 位置 | 条件 | 影响 | 现有覆盖手段 |
|---|---|---|---|
| `auxiliary_client.py:656 _fixed_temperature_for_model`（主路径 `chat_completion_helpers.py:1482` 也调用） | 模型名 `kimi-*`、`gpt-5* / o1 / o3 / o4`（非 `gpt-5-chat`）、`trinity-large-thinking` | 省略或固定 `temperature` | 无按端点开关；运行时已有"被 400 后记忆并省略"的通用机制（`_TEMPERATURE_REJECTED_ROUTES`），名字表只是抢跑 |
| `anthropic_adapter.py:209 _forbids_sampling_params` | 模型名含 `claude` 且不在旧代列表 | Anthropic 线省略 temperature/top_p/top_k | 无 |
| `anthropic_adapter.py:120 _ANTHROPIC_OUTPUT_LIMITS` | claude 各代、`minimax`、`qwen3` 子串 | 决定 `max_tokens` | 每模型 `max_output_tokens`（二开已提供） |
| `auxiliary_client.py:5743 auxiliary_max_tokens_param` | `model_forces_max_completion_tokens` 模型名前缀 | 辅助调用改发 `max_completion_tokens` | 无（见 2.1-E） |
| `image_routing._lookup_supports_vision`（`:330`） | 无覆盖时按模型名查 models.dev | 非目录模型图片被降级为 `vision_analyze` 文本 | 每模型 `supports_vision`（配置有，UI 无） |
| 自定义端点默认 `reasoning_effort: medium`（`configuration.md:1935`） | 未配置 effort 时一律发 | 不支持的端点 400 后才关闭 | `supports_reasoning: false` 需走 `model_overrides` / catalog，UI 无 |
| `runtime_provider._detect_api_mode_for_url`（`:99`） | 路径以 `/anthropic` 结尾、`api.kimi.com/coding` | 自动选 `anthropic_messages` | 显式 `api_mode`（已可覆盖） |
| `runtime_provider._resolve_plain_custom_api_mode`（`:183`） | 非 OpenAI host 上忽略持久化的 `codex_responses` | 裸 `provider: custom` 无法用 Responses 中继 | 改用命名端点即可 |
| `anthropic_endpoints._requires_bearer_auth`（内置 host 表） | 已知第三方 host | Bearer vs x-api-key | `auth_scheme`（二开已提供，仅 Anthropic 线） |

---

## 3. 建议的通用化路线（按收益排序）

第一步是把"能力声明"全部下沉到端点条目并在 UI 暴露：每模型 `supports_vision / supports_reasoning / max_tokens_field / temperature 策略`，provider 级 `auth_header / auth_prefix`、`extra_headers`、`extra_body`、`catalog_provider`、默认 token 预算。每一项都有对应的模型名表可以随之退化为"仅在未声明且未探测到时才参考"。

第二步是让运行时只在一个地方解析这些声明：`agent_init` 路由阶段解析 `max_tokens` / `max_tokens_field` / 认证头，`ContextCompressor` 已经是这么做 `max_input_tokens` 的；删除 `output_tokens.output_token_limit_for_agent` 及重复的解析层，删除 `is_saved_custom_endpoint` 三处兜底，改在写入侧拒绝冲突 id。

第三步是把探测与运行时对齐：`validate_custom_endpoint` 复用运行时的头构造，探测结果里回显实际发送的认证方式与 UA，让"测试通过"等价于"运行时可用"。

第四步是补文档（英文 + zh-CN）与把 `DEFAULT_USER_AGENT`、`16_384`、`Chrome/138` 这类常量从代码里移到可配置默认值。

---

## 4. 本次未覆盖

未运行 `scripts/run_tests.sh`（沙箱无可用解释器）；未审查 `hermes model` CLI 向导（`model_setup_flows_custom.py`）对新字段的支持程度，仅确认其模型发现路径已接入 `model_metadata`；未审查 `web/`（浏览器 Dashboard）是否有对应的自定义端点编辑面。

---

## 5. 实施与自检记录（2026-09-26）

按第 3 节路线在工作区实施完毕（38 文件，+1212/-527，未提交，基于 `fbe96035ae`）。逐项对照第 2 节问题清单的落地证据：

| 问题 | 状态 | 证据（file:line，以本工作区为准） |
|---|---|---|
| A. 默认 Chrome UA | ✅ | `custom-endpoints-settings.tsx:106` 默认空串；Chrome UA 降级为 `:80` 预设常量 + `:827` 一键填入按钮；测试 "does not send a User-Agent unless the user set one" |
| B. 第三方 16 384 兜底 | ✅（降为末位兜底） | provider 级默认输出预算可配（`config_env.py:808-821` `default_token_limits`）；`_ANTHROPIC_OUTPUT_LIMITS`（含 `minimax`/`qwen3`）与 `16_384` 保留在 `anthropic_adapter.py:120,134`，仅在端点未声明任何预算时参考 |
| C. `is_saved_custom_endpoint` | ✅ | 全仓 0 引用；写入侧拦截内置 id 冲突并 422（`config_env.py:661-670`，判据 `is_builtin_provider_id`）；存量条目走结构化判据 |
| D. `auth_scheme` 仅 Anthropic 线 | ✅ | 新增 `agent/endpoint_auth.py` 统一注入，消费方覆盖 `agent_init` / `client_lifecycle` / `auxiliary_client` / `anthropic_adapter` 三条协议线；UI 选择器不再按 `apiMode` 门控（`custom-endpoints-settings.tsx:727-737`），后端校验 `config_env.py:872` |
| E. 主/辅 `max_completion_tokens` 不一致 | ✅ | 新增 `max_tokens_field`（`config_providers.py:327-329`、`web_models.py:85`）；主辅共用 `chat_max_tokens_field`（`output_tokens.py:178`，辅路径 `auxiliary_client.py:5755-5758`）；`model_forces_max_completion_tokens` 生产零调用（函数与测试为 upstream 所有，保留以减小合并摩擦） |
| 2.2-1 `max_output_tokens` 入口覆盖 | ✅ | 统一在 `agent_init.py:1934 _resolve_output_limit`（`:2568` 调用）解析，所有 `AIAgent` 构造入口自动生效；`/model` 切换经 `agent_runtime_helpers.py:2245 _refresh_route_output_limit`（`:1312,:2227`）重算；死代码 `output_token_limit_for_agent` 已删（全仓 0 引用）；旧 `test_max_tokens_propagation.py` 删除，新增 `test_output_limit_resolution_at_init.py` |
| 2.2-2 探测头不一致 | ✅ | `validate_custom_endpoint` 经 `_probe_request_headers` 复用运行时头（auth scheme + 已存 `extra_headers` + UA），编辑态经 `key_env` 解析已存凭据（`config_env.py:373-375`），响应回显 `auth_header_checked` |
| 2.2-3 保存抹掉 provider 级默认 | ✅ | 条目级字段仅在 `model_fields_set` 显式携带时才写/删（`config_env.py:800-806`）；UI 新增"所有模型默认"行（i18n `defaultRowLabel`） |
| 2.2-4 UI 字段缺口 | ✅ | `extra_headers` 键值编辑器（`config_env.py:856-885`）、`extra_body`（`:838-843`）、`max_tokens_field`（`:844-848`）、`catalog_provider`（`:849-853`）、每模型 `supports_vision`/`supports_reasoning`（`:823-836`）；新增 21 个 i18n key，en/zh/zh-hant 齐全 |
| 2.2-5 discovered 目录整体重写 | ✅ | 改为合并：`_discovered_rows` 只拥有 `_DISCOVERY_OWNED_KEYS = ("max_output_tokens",)`，用户/桌面写入字段保留（`model_switch_providers.py:77-94`）；新增 `test_discovered_catalog_merge.py` |
| 2.2-6 零文档 | ✅ | `website/docs/integrations/providers.md:1353-1375`（含示例）+ zh-Hans 对应更新 |
| 2.2-7 小项 | ✅ | 字符串整数接受（`config_providers.py:202`）；裸 `max_tokens` 降为末位候选（`models.py:2532-2535`）；协议同步仅在条目显式钉 `api_mode` 时触发（`runtime_provider_custom.py:234-247` 只返回显式值，`model_switch.py:487` 早退） |

**回归验证（Linux 沙箱，uv + CPython 3.13.15，依赖按 uv.lock 锁定版）：**受影响的 8 个后端测试文件 82 用例全过（`test_output_token_resolution` 21、`test_output_limit_resolution_at_init` 4、`test_custom_endpoint_token_isolation` 14、`test_custom_provider_extra_headers` 13、`test_runtime_provider_custom_collision` 4、`test_web_routers_endpoint_probe` 10、`test_discovered_catalog_merge` 2、`test_compression_config_hot_reload` 14）。桌面端 `custom-endpoints-settings.test.tsx` 8/8、i18n 目录完整性测试 25/25、`npm run typecheck` 四段 tsc 全过。未跑全量 `scripts/run_tests.sh`，提交前建议本地跑一遍。

**遗留已知项：**(1) `agent/endpoint_auth.py:44-55` 用 `default_headers` 里的 `Omit()` 压掉 SDK bearer 头，该机制在 openai SDK 3.x 失效（`_validate_headers` 只认 per-request 的 omit 标记）；当前锁定 `openai==2.24.0` 无影响，升级时 `test_x_api_key_scheme_replaces_bearer_on_openai_wire_clients` 会先红。(2) `utils.py:670 model_forces_max_completion_tokens` 在本 fork 生产路径已无调用，为 upstream 代码故保留。(3) 2.3 节 upstream 特判（`_fixed_temperature_for_model`、`_forbids_sampling_params` 等）未动，但均已可被端点声明覆盖或仅在未声明时生效。
