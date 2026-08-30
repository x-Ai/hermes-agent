import { afterEach, describe, expect, it } from 'vitest'

import { setRuntimeI18nLocale } from '@/i18n'

import { localizeAssistantSystemNotices } from './assistant-system-notices'

afterEach(() => setRuntimeI18nLocale('en'))

describe('assistant system notice localization', () => {
  it('localizes the complete file-mutation footer and embedded write error', () => {
    setRuntimeI18nLocale('zh')

    const input = [
      '⚠️ File-mutation verifier: 1 file(s) were NOT modified this turn despite any wording above that may suggest otherwise. Run `git status` or `read_file` to confirm.',
      '  • `/tmp/demo.sh` — [write_file] Failed to write file: permission denied',
      '  • `/tmp/other.sh` — [patch] failed',
      '  • … and 2 more'
    ].join('\n')

    expect(localizeAssistantSystemNotices(input)).toBe(
      [
        '⚠️ 文件修改校验：本轮有 1 个文件未被修改，即使上文可能有不同表述。请运行 `git status` 或 `read_file` 确认。',
        '  • `/tmp/demo.sh` — [write_file] 写入文件失败： permission denied',
        '  • `/tmp/other.sh` — [patch] 失败',
        '  • … 另有 2 个'
      ].join('\n')
    )
  })

  it('localizes the related no-reply notice without rewriting ordinary prose', () => {
    setRuntimeI18nLocale('zh')
    expect(localizeAssistantSystemNotices('⚠️ No reply: provider unavailable')).toBe(
      '⚠️ 未生成回复：provider unavailable'
    )
    expect(localizeAssistantSystemNotices('The File-mutation verifier can help.')).toBe(
      'The File-mutation verifier can help.'
    )
  })
})
