import { afterEach, describe, expect, it } from 'vitest'

import { setRuntimeI18nLocale } from '@/i18n'

import {
  buildToolView,
  clampForDisplay,
  countDiffLineStats,
  inlineDiffFromResult,
  MAX_TOOL_RENDER_CHARS,
  prettyJson,
  type ToolPart
} from './fallback-model'

const part = (overrides: Partial<ToolPart>): ToolPart => ({
  args: {},
  isError: false,
  result: {},
  toolCallId: 'call_1',
  toolName: 'vision_analyze',
  type: 'tool-call',
  ...overrides
})

afterEach(() => {
  setRuntimeI18nLocale('en')
})

describe('buildToolView image handling', () => {
  // vision_analyze reports the input image as a local path; an <img> pointed at
  // a bare path resolves against the renderer origin and 404s, so we render the
  // tool codicon instead of a broken image.
  it('drops bare filesystem paths', () => {
    expect(buildToolView(part({ args: { path: '/Users/me/shot.png' } }), '').imageUrl).toBe('')
    expect(buildToolView(part({ result: { image_path: '/tmp/out.jpg' } }), '').imageUrl).toBe('')
  })

  it('keeps fetchable data URLs', () => {
    const dataUrl = 'data:image/png;base64,AAAA'

    expect(buildToolView(part({ result: { image_url: dataUrl } }), '').imageUrl).toBe(dataUrl)
  })

  it('keeps remote http(s) image URLs', () => {
    const url = 'https://example.com/pic.webp'

    expect(buildToolView(part({ result: { url } }), '').imageUrl).toBe(url)
  })
})

describe('buildToolView localized errors', () => {
  it.each([
    ['zh', '写入文件失败：'],
    ['zh-hant', '寫入檔案失敗：'],
    ['ja', 'ファイルへの書き込みに失敗しました：'],
    ['ar', 'فشل في كتابة الملف: ']
  ] as const)(
    'localizes the write-file failure prefix in %s while preserving the shell diagnostic',
    (locale, prefix) => {
      setRuntimeI18nLocale(locale)
      const diagnostic = 'bash: line 4: cd: G:\\XenForo: No such file or directory'

      const view = buildToolView(
        part({
          args: { path: 'G:\\XenForo\\config.php' },
          isError: true,
          result: { error: `Failed to write file: ${diagnostic}` },
          toolName: 'write_file'
        }),
        ''
      )

      expect(view.subtitle).toBe(`${prefix}${diagnostic}`)
    }
  )

  it('localizes the sensitive-system-path refusal while preserving the path', () => {
    setRuntimeI18nLocale('zh')
    const path = '/etc/nginx/sites-available/xf-loose'

    const view = buildToolView(
      part({
        args: { path },
        isError: true,
        result: {
          error: `Refusing to write to sensitive system path: ${path}\nUse the terminal tool with sudo if you need to modify system files.`
        },
        toolName: 'write_file'
      }),
      ''
    )

    expect(view.subtitle).toBe(`拒绝写入敏感系统路径：${path} 如需修改系统文件，请使用终端工具并通过 sudo 执行`)
  })

  it('localizes a session-kernel timeout only at the Desktop execute_code render boundary', () => {
    setRuntimeI18nLocale('zh')

    const raw =
      'Cell timed out after 300s; the session kernel was killed and its state was lost. The next execute_code call starts a fresh kernel.'

    const localized =
      '执行单元在 300 秒后超时；会话内核已被终止，其状态已丢失。下一次 execute_code 调用将启动一个全新的内核。'

    const codeView = buildToolView(
      part({
        isError: true,
        result: { error: raw, output: `⏰ ${raw}`, status: 'timeout' },
        toolName: 'execute_code'
      }),
      ''
    )

    expect(codeView.subtitle).toBe(localized)
    expect(codeView.detail).toBe(`${localized}\n\n⏰ ${localized}`)

    const terminalView = buildToolView(part({ isError: true, result: { error: raw }, toolName: 'terminal' }), '')

    expect(terminalView.subtitle).toBe(raw)
  })

  it('localizes the remote-kernel timeout variant and preserves unknown backend text', () => {
    setRuntimeI18nLocale('zh')

    const raw =
      'Cell timed out after 42s; the remote session kernel was killed and its state was lost. The next call starts fresh.'

    const localized =
      '执行单元在 42 秒后超时；远程会话内核已被终止，其状态已丢失。下一次 execute_code 调用将启动一个全新的内核。'

    expect(buildToolView(part({ isError: true, result: { error: raw }, toolName: 'execute_code' }), '').subtitle).toBe(
      localized
    )

    const unknown = 'Cell timed out with a future kernel protocol.'

    expect(
      buildToolView(part({ isError: true, result: { error: unknown }, toolName: 'execute_code' }), '').subtitle
    ).toBe(unknown)
  })

  it.each([
    ['zh', 'questions 参数必须是一个由问题对象组成的数组'],
    ['zh-hant', 'questions 參數必須是由問題物件組成的陣列'],
    ['ja', 'questions パラメーターは質問オブジェクトの配列である必要があります。'],
    ['ar', 'يجب أن تكون المعلمة questions مصفوفة من كائنات الأسئلة.']
  ] as const)('localizes the clarify batch-shape error in %s', (locale, expected) => {
    setRuntimeI18nLocale(locale)

    const view = buildToolView(
      part({
        isError: true,
        result: { error: 'questions must be an array of question objects.' },
        toolName: 'clarify'
      }),
      ''
    )

    expect(view.subtitle).toBe(expected)
  })

  it.each([
    ['questions supports at most 5 items.', 'questions 参数最多支持 5 项'],
    ["questions[2] must be an object with a 'question'.", 'questions[2] 必须是包含 question 字段的对象'],
    ['questions[1].question must be non-empty text.', 'questions[1].question 必须是非空文本'],
    ['questions[3].choices must be a list.', 'questions[3].choices 必须是数组'],
    ['choices must be a list of strings.', 'choices 参数必须是字符串数组'],
    [
      "No question provided. Pass questions=[{question: '...', choices?: [...], multi_select?: bool}, ...] — a single question is a one-entry array.",
      '未提供问题。请在 questions 数组中至少传入一个对象并填写 question；choices 和 multi_select 为可选字段'
    ],
    ['Clarify tool is not available in this execution context.', '当前环境无法使用澄清问题工具'],
    ['Failed to get user input: renderer disconnected', '获取用户输入失败：renderer disconnected']
  ] as const)('localizes related clarify validation error: %s', (source, expected) => {
    setRuntimeI18nLocale('zh')

    const view = buildToolView(part({ isError: true, result: { error: source }, toolName: 'clarify' }), '')

    expect(view.subtitle).toBe(expected)
  })

  it('localizes generic desktop tool-error fallbacks', () => {
    setRuntimeI18nLocale('zh')

    expect(buildToolView(part({ isError: true, result: {} }), '').subtitle).toBe('工具返回了错误')
    expect(buildToolView(part({ result: { success: false } }), '').subtitle).toBe('工具返回 success=false')
    expect(buildToolView(part({ result: { status: 'failed' } }), '').subtitle).toBe('工具返回了“failed”状态')
    expect(buildToolView(part({ result: { exit_code: 127 }, toolName: 'terminal' }), '').subtitle).toBe(
      '命令执行失败，退出码为 127'
    )
  })
})

describe('buildToolView localized counts', () => {
  it('localizes the session-search title and item count', () => {
    setRuntimeI18nLocale('zh')

    const view = buildToolView(
      part({
        result: { items: [{ id: 1 }, { id: 2 }, { id: 3 }] },
        toolName: 'session_search_recall'
      }),
      ''
    )

    expect(view.title).toBe('已搜索会话历史')
    expect(view.countLabel).toBe('3 项')
  })
})

describe('buildToolView localized skill loading', () => {
  it('describes skill_view by its loading action instead of its implementation name', () => {
    setRuntimeI18nLocale('zh')

    const pending = buildToolView(part({ result: undefined, toolName: 'skill_view' }), '')
    const done = buildToolView(part({ result: { success: true }, toolName: 'skill_view' }), '')

    expect(pending.title).toBe('正在加载技能')
    expect(done.title).toBe('已加载技能')
  })
})

describe('buildToolView localized protocol-tool fallback', () => {
  it('humanizes an unknown stable tool id and applies the localized running template', () => {
    setRuntimeI18nLocale('zh')

    const pending = buildToolView(part({ result: undefined, toolName: 'drive_preview' }), '')
    const done = buildToolView(part({ result: { success: true }, toolName: 'drive_preview' }), '')

    expect(pending.title).toBe('正在运行 Drive Preview')
    expect(done.title).toBe('已运行 Drive Preview')
  })

  it('adds the localized completed-action prefix to computer-use calls', () => {
    setRuntimeI18nLocale('zh')

    const view = buildToolView(part({ result: { success: true }, toolName: 'computer_use' }), '')

    expect(view.title).toBe('已运行 Computer Use')
  })
})

describe('buildToolView terminal exit-code status', () => {
  const terminal = (result: Record<string, unknown>) => buildToolView(part({ result, toolName: 'terminal' }), '')

  // A non-zero exit code with real output is not a failure (grep no-match,
  // diff differences, piped commands surfacing the last stage's code, etc.) —
  // it should render as success so the card isn't painted red.
  it('treats non-zero exit with output as success', () => {
    expect(terminal({ exit_code: 7, output: 'node ... 5174 (LISTEN)' }).status).toBe('success')
    expect(terminal({ exit_code: 1, stdout: 'partial results' }).status).toBe('success')
  })

  // No output + non-zero exit is a genuine failure worth flagging.
  it('treats non-zero exit with no output as error', () => {
    expect(terminal({ exit_code: 127, output: '' }).status).toBe('error')
    expect(terminal({ exit_code: 1 }).status).toBe('error')
  })

  it('treats zero exit as success', () => {
    expect(terminal({ exit_code: 0, output: 'done' }).status).toBe('success')
  })

  // Explicit error signals still win regardless of output presence.
  it('keeps explicit error signals red even with output', () => {
    expect(terminal({ error: 'boom', exit_code: 0, output: 'partial' }).status).toBe('error')
    expect(buildToolView(part({ isError: true, result: { output: 'x' }, toolName: 'terminal' }), '').status).toBe(
      'error'
    )
  })

  it('keeps the command and exit code for the terminal transcript', () => {
    const view = buildToolView(
      part({
        args: { command: 'npm run check --workspace=apps/desktop' },
        result: { exit_code: 0, output: 'done' },
        toolName: 'terminal'
      }),
      ''
    )

    expect(view.terminalCommand).toBe('npm run check --workspace=apps/desktop')
    expect(view.terminalExitCode).toBe(0)
  })
})

describe('buildToolView browser_exec step label', () => {
  const bexec = (code: string) =>
    buildToolView(part({ args: { code }, result: undefined, toolName: 'browser_exec' }), '')

  it('uses the leading # comment as the title', () => {
    expect(bexec('# Searching Amazon for paper towels\nnew_tab("https://amazon.com")').title).toBe(
      'Searching Amazon for paper towels'
    )
  })

  it('falls back to the generic title when code has no leading comment', () => {
    const view = bexec('new_tab("https://amazon.com")')

    expect(view.title).not.toBe('')
    expect(view.title).not.toContain('new_tab')
  })

  it('truncates long labels and keeps the ellipsis', () => {
    const long = `# ${'x'.repeat(120)}`

    expect(bexec(long).title.length).toBeLessThanOrEqual(80)
    expect(bexec(long).title.endsWith('…')).toBe(true)
  })

  it('keeps the label after the result arrives', () => {
    const view = buildToolView(
      part({
        args: { code: '# Checking workspace persistence\nprint(1)' },
        result: { output: 'ok', success: true },
        toolName: 'browser_exec'
      }),
      ''
    )

    expect(view.title).toBe('Checking workspace persistence')
  })
})

describe('buildToolView web-search query', () => {
  it('keeps the query separate from structured search results', () => {
    const view = buildToolView(
      part({
        args: { query: 'Hermes Agent Desktop tool calls' },
        result: { web: [{ snippet: 'Desktop docs', title: 'Hermes docs', url: 'https://example.com/docs' }] },
        toolName: 'web_search'
      }),
      ''
    )

    expect(view.searchQuery).toBe('Hermes Agent Desktop tool calls')
    expect(view.searchHits).toEqual([
      { snippet: 'Desktop docs', title: 'Hermes docs', url: 'https://example.com/docs' }
    ])
  })

  it('separates the Simplified Chinese action from the quoted query', () => {
    setRuntimeI18nLocale('zh')

    const view = buildToolView(
      part({
        args: { query: 'nginx location priority' },
        result: { web: [] },
        toolName: 'web_search'
      }),
      ''
    )

    expect(view.title).toBe('已搜索 "nginx location priority"')
  })
})

describe('buildToolView browser_navigate title', () => {
  it('shows failed title when navigate returns success=false', () => {
    const view = buildToolView(
      part({
        toolName: 'browser_navigate',
        args: { url: 'https://hermes-agent.nousresearch.com/docs' },
        result: { success: false, error: 'Command timed out after 60 seconds' }
      }),
      ''
    )

    expect(view.status).toBe('error')
    expect(view.title).toBe('Failed to open hermes-agent.nousresearch.com/docs')
  })

  it('shows opened title on success', () => {
    const view = buildToolView(
      part({
        toolName: 'browser_navigate',
        args: { url: 'https://hermes-agent.nousresearch.com/docs' },
        result: { success: true, url: 'https://hermes-agent.nousresearch.com/docs', title: 'Docs' }
      }),
      ''
    )

    expect(view.status).toBe('success')
    expect(view.title).toBe('Opened hermes-agent.nousresearch.com/docs')
  })
})

describe('buildToolView file edit diffs', () => {
  const patchDiff = '--- a/src/demo.ts\n+++ b/src/demo.ts\n@@ -1 +1 @@\n-old\n+new'

  it('reads inline_diff and diff fields from patch results', () => {
    expect(inlineDiffFromResult({ inline_diff: patchDiff })).toBe(patchDiff)
    expect(inlineDiffFromResult({ diff: patchDiff })).toBe(patchDiff)
  })

  it('suppresses raw patch args when a diff is available', () => {
    const view = buildToolView(
      part({
        args: { context: 'src/demo.ts', mode: 'replace', new_string: 'new', path: 'src/demo.ts' },
        result: { diff: patchDiff, success: true },
        toolName: 'patch'
      }),
      patchDiff
    )

    expect(view.title).toBe('demo.ts')
    expect(view.subtitle).toBe('src/demo.ts')
    expect(view.detail).toBe('')
    expect(view.inlineDiff).toBe(patchDiff)
  })

  it('shows path subtitle instead of patch args JSON while pending', () => {
    const view = buildToolView(
      part({
        args: { context: 'src/demo.ts', mode: 'replace', new_string: 'new', path: 'src/demo.ts' },
        result: undefined,
        toolName: 'patch'
      }),
      ''
    )

    expect(view.title).toBe('demo.ts')
    expect(view.subtitle).toBe('src/demo.ts')
    expect(view.detail).toBe('')
  })
})

describe('buildToolView title actions', () => {
  it('marks the pending action separately from the rest of the title', () => {
    const read = buildToolView(part({ args: { path: '/tmp/demo.txt' }, result: undefined, toolName: 'read_file' }), '')

    const web = buildToolView(
      part({ args: { url: 'https://example.com/docs' }, result: undefined, toolName: 'web_extract' }),
      ''
    )

    const terminal = buildToolView(
      part({ args: { command: 'npm test -- --runInBand' }, result: undefined, toolName: 'terminal' }),
      ''
    )

    const code = buildToolView(
      part({ args: { code: 'print("hello")' }, result: undefined, toolName: 'execute_code' }),
      ''
    )

    expect(read.title).toBe('Reading demo.txt')
    expect(read.titleAction).toEqual({ prefix: '', text: 'Reading', suffix: ' demo.txt' })
    expect(web.title).toBe('Reading example.com/docs')
    expect(web.titleAction).toEqual({ prefix: '', text: 'Reading', suffix: ' example.com/docs' })
    expect(terminal.title).toBe('Running npm test -- --runInBand')
    expect(terminal.titleAction).toEqual({ prefix: '', text: 'Running', suffix: ' npm test -- --runInBand' })
    expect(code.title).toBe('Scripting print("hello")')
    expect(code.titleAction).toEqual({ prefix: '', text: 'Scripting', suffix: ' print("hello")' })
  })

  it('does not mark completed tool titles as pending actions', () => {
    const view = buildToolView(part({ args: { url: 'https://example.com/docs' }, toolName: 'web_extract' }), '')

    expect(view.title).toBe('Read example.com/docs')
    expect(view.titleAction).toBeUndefined()
  })

  it('uses the filename for completed read_file rows', () => {
    const view = buildToolView(
      part({ args: { path: './package.json' }, result: { content: '1|{"name":"demo"}' }, toolName: 'read_file' }),
      ''
    )

    expect(view.title).toBe('Read package.json')
    expect(view.subtitle).toBe('')
    expect(view.titleAction).toBeUndefined()
  })

  it('adds a compact line range to line-scoped read_file rows', () => {
    const view = buildToolView(
      part({
        args: { limit: 10, offset: 25, path: './src/main.ts' },
        result: { content: '25|function toggleDock() {\n26|  dock.classList.toggle("hidden");\n34|}' },
        toolName: 'read_file'
      }),
      ''
    )

    expect(view.title).toBe('Read main.ts L25-34')
    expect(view.subtitle).toBe('')
  })

  it('uses the requested positive offset/limit for read_file row line ranges', () => {
    const view = buildToolView(
      part({
        args: { limit: 5, offset: 1, path: './package.json' },
        result: {
          content:
            '1|{\n2|  "name": "bb-rainbows",\n3|  "private": true,\n4|  "version": "0.0.1",\n5|  "type": "module",\n6|  "description": "extra"'
        },
        toolName: 'read_file'
      }),
      ''
    )

    expect(view.title).toBe('Read package.json L1-5')
  })

  it('uses inherited backend context for live read_file rows', () => {
    const view = buildToolView(
      part({
        args: { context: 'package.json L1-5', path: './package.json' },
        result: undefined,
        toolName: 'read_file'
      }),
      ''
    )

    expect(view.title).toBe('Reading package.json L1-5')
    expect(view.titleAction).toEqual({ prefix: '', text: 'Reading', suffix: ' package.json L1-5' })
  })

  it('uses returned line numbers for negative-offset read_file rows', () => {
    const view = buildToolView(
      part({
        args: { limit: 2, offset: -2, path: './src/main.ts' },
        result: { content: '99|lastLine();\n100|done();' },
        toolName: 'read_file'
      }),
      ''
    )

    expect(view.title).toBe('Read main.ts L99-100')
  })

  it('renders compact terminal titles for session 20260624_231846_bdbd1e commands', () => {
    const rows = [
      [
        'cd /Users/brooklyn/www/bb-rainbows && pnpm run lint 2>&1 | tail -20; echo "lint_exit=${PIPESTATUS[0]}"',
        'Ran pnpm run lint'
      ],
      [
        'cd /Users/brooklyn/www/bb-rainbows && pnpm run build 2>&1 | tail -20; echo "build_exit=${PIPESTATUS[0]}"',
        'Ran pnpm run build'
      ],
      [
        'which node pnpm corepack; node -v; echo "---"; corepack --version 2>&1; echo "---pnpm via corepack---"; pnpm --version 2>&1 | tail -5',
        'Ran which node pnpm corepack + 3 commands'
      ],
      [
        'echo "--- proto pnpm direct ---"; ~/.proto/tools/node/24.11.0/bin/pnpm --version 2>&1 | tail -3; echo "--- proto node ---"; ls ~/.proto/tools/node/ 2>&1; echo "--- corepack cache ---"; ls ~/.cache/node/corepack/v1/pnpm/ 2>&1',
        'Ran ~/.proto/tools/node/24.11.0/bin/pnpm --version + 2 commands'
      ],
      [
        'cd /Users/brooklyn/www/bb-rainbows && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm@10.20.0 --version 2>&1 | tail -3',
        'Ran COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm@10.20.0 --version'
      ],
      [
        'cd /Users/brooklyn/www/bb-rainbows && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack use pnpm@10.20.0 2>&1 | tail -10; echo "exit=$?"',
        'Ran COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack use pnpm@10.20.0'
      ]
    ] as const

    for (const [command, expectedTitle] of rows) {
      const view = buildToolView(
        part({ args: { command }, result: { output: 'ok', exit_code: 0 }, toolName: 'terminal' }),
        ''
      )

      expect(view.title).toBe(expectedTitle)
    }
  })

  it('uses inherited backend context for live terminal rows', () => {
    const view = buildToolView(
      part({
        args: {
          command: 'cd /Users/brooklyn/www/bb-rainbows && pnpm run lint 2>&1 | tail -20',
          context: 'pnpm run lint'
        },
        result: undefined,
        toolName: 'terminal'
      }),
      ''
    )

    expect(view.title).toBe('Running pnpm run lint')
    expect(view.subtitle).toBe('')
    expect(view.titleAction).toEqual({ prefix: '', text: 'Running', suffix: ' pnpm run lint' })
  })

  it('never stutters the verb or echoes the command when the backend context is a phrased label', () => {
    // Older backends stamped tool.start with a *phrased* label
    // ("Running sleep 70 + 2 commands") rather than a raw arg preview, and the
    // desktop merges that into args.context. The row must still prepend its own
    // verb exactly once, show the real command in the `$` transcript, and not
    // repeat either string as detail.
    const command = 'sleep 70; echo "a"; echo "b"'

    const view = buildToolView(
      part({
        args: { command, context: 'Running sleep 70 + 2 commands' },
        result: { exit_code: 0 },
        toolName: 'terminal'
      }),
      ''
    )

    expect(view.title).toBe('Ran sleep 70 + 2 commands')
    expect(view.terminalCommand).toBe(command)
    expect(view.detail).toBe('')
  })

  it('uses the runtime locale for title text and action placement', () => {
    setRuntimeI18nLocale('ja')

    const read = buildToolView(part({ args: { path: '/tmp/demo.txt' }, result: undefined, toolName: 'read_file' }), '')

    const web = buildToolView(
      part({ args: { url: 'https://example.com/docs' }, result: undefined, toolName: 'web_extract' }),
      ''
    )

    expect(read.title).toBe('demo.txt を読み取り中')
    expect(read.titleAction).toEqual({ prefix: 'demo.txt を', text: '読み取り中', suffix: '' })
    expect(web.title).toBe('example.com/docs を読み取り中')
    expect(web.titleAction).toEqual({ prefix: 'example.com/docs を', text: '読み取り中', suffix: '' })
  })
})

describe('clampForDisplay', () => {
  it('passes short payloads through untouched', () => {
    expect(clampForDisplay('hello')).toBe('hello')
    expect(clampForDisplay('x'.repeat(MAX_TOOL_RENDER_CHARS))).toHaveLength(MAX_TOOL_RENDER_CHARS)
  })

  it('truncates oversized payloads and reports the omitted count', () => {
    const oversized = 'x'.repeat(MAX_TOOL_RENDER_CHARS + 5_000)
    const clamped = clampForDisplay(oversized)

    expect(clamped.length).toBeLessThan(oversized.length)
    expect(clamped.startsWith('x'.repeat(MAX_TOOL_RENDER_CHARS))).toBe(true)
    expect(clamped).toContain('5,000 more characters truncated')
    expect(clamped).toContain('Copy')
  })
})

// A large tool result (e.g. a 100KB read_file during a `/learn` run) must not
// be serialized at full size — that JSON.stringify payload is what floods the
// renderer. buildToolView no longer prettyJson's every result eagerly; the
// web_search drilldown serializes lazily via prettyJson, which clamps.
describe('prettyJson caps serialized result size', () => {
  it('clamps an oversized result', () => {
    const huge = 'y'.repeat(MAX_TOOL_RENDER_CHARS * 3)
    const out = prettyJson({ content: huge })

    expect(out.length).toBeLessThanOrEqual(MAX_TOOL_RENDER_CHARS + 200)
    expect(out).toContain('truncated')
  })
})

describe('countDiffLineStats', () => {
  it('counts added and removed lines', () => {
    expect(countDiffLineStats(`--- a/x\n+++ b/x\n@@\n-old\n+new\n context\n+another`)).toEqual({ added: 2, removed: 1 })
  })
})

describe('buildToolView memory status', () => {
  const memory = (overrides: Partial<Parameters<typeof part>[0]> = {}) =>
    buildToolView(part({ toolName: 'memory', ...overrides }), '')

  it('treats an explicit success payload as success even with isError', () => {
    const view = memory({
      isError: true,
      result: {
        success: true,
        entry_count: 13,
        message: 'Applied 1 operation(s).',
        duration_s: 0.003
      }
    })

    expect(view.status).toBe('success')
    expect(view.title).toBe('Saved to memory')
    expect(view.countLabel).toBe('13 entries')
    expect(view.subtitle).toBe('Applied 1 operation(s).')
  })

  it('uses soft warning copy for over-budget refusals, not "Saved"', () => {
    const view = memory({
      result: {
        success: false,
        error: 'Memory is full (2,200/2,200). Consolidate before adding more.'
      }
    })

    expect(view.status).toBe('warning')
    expect(view.title).toBe('Memory write noted')
    expect(view.subtitle).toContain('Memory is full')
  })
})
