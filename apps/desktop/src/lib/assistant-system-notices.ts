import { translateNow } from '@/i18n'

const FILE_MUTATION_HEADER_RE =
  /^(⚠️ File-mutation verifier: )(\d+)( file\(s\) were NOT modified this turn despite any wording above that may suggest otherwise\. Run `git status` or `read_file` to confirm\.)$/gm

const FAILED_WRITE_RE = /(\u2014 \[write_file\] )Failed to write file:/g
const FAILED_MUTATION_RE = /^(\s+• `[^\n]+` \u2014 \[[^\]]+\] )failed$/gm
const MORE_FAILURES_RE = /^(\s+• … )and (\d+) more$/gm

/**
 * Localize backend-authored notices embedded in assistant markdown.
 *
 * These messages are appended after model generation, so they cannot use the
 * renderer's locale at their source. Match their complete, fixed protocol
 * wording: ordinary assistant prose (including partial quotations) must pass
 * through untouched.
 */
export function localizeAssistantSystemNotices(text: string): string {
  return text
    .replace(FILE_MUTATION_HEADER_RE, (_match, _prefix: string, count: string) =>
      translateNow('assistant.systemNotices.fileMutationFailure', Number(count))
    )
    .replace(
      FAILED_WRITE_RE,
      (_match, prefix: string) => `${prefix}${translateNow('assistant.systemNotices.failedToWriteFile')}`
    )
    .replace(
      FAILED_MUTATION_RE,
      (_match, prefix: string) => `${prefix}${translateNow('assistant.systemNotices.failed')}`
    )
    .replace(
      MORE_FAILURES_RE,
      (_match, prefix: string, count: string) =>
        `${prefix}${translateNow('assistant.systemNotices.andMore', Number(count))}`
    )
    .replace(/^\u26a0️ No reply: (.+)$/gm, (_match, detail: string) =>
      translateNow('assistant.systemNotices.noReply', detail)
    )
}
