import { describe, expect, it } from 'vitest'

import { dropWarning } from './drop-warning'

const item = (name: string) => `Could not attach ${name}`
const more = (count: number) => `and ${count} more`
const folder = "Folders can't be attached by dropping them. Use Attach → Folder… instead."
const limit = 'The file is larger than 16 MiB, the largest file the browser can attach.'

// Reasons are sentences; joined with '; ' their periods used to read '…instead.; Could not attach…'.
describe('dropWarning', () => {
  it('drops the period of a reason another item follows, and keeps the last one', () => {
    const { detail, message } = dropWarning(
      [
        { name: 'somefolder', reason: folder },
        { name: 'huge.zip', reason: limit }
      ],
      item,
      more
    )

    expect(message).toBe(`Could not attach somefolder: ${folder.slice(0, -1)}; Could not attach huge.zip: ${limit}`)
    expect(message).not.toContain('.;')
    expect(detail).toBeUndefined()
  })

  it('drops the period before the count of the rest, and keeps each reason whole in the detail', () => {
    const failures = [
      { name: 'somefolder', reason: folder },
      ...Array.from({ length: 5 }, (_, index) => ({ name: `${'z'.repeat(135)}-${index}.zip`, reason: limit }))
    ]

    const { detail, message } = dropWarning(failures, item, more)

    expect(message).toMatch(/[^.]; and \d+ more$/)
    expect(message).not.toContain('.;')
    expect(detail?.split('\n')).toEqual(failures.map(({ name, reason }) => `Could not attach ${name}: ${reason}`))
  })

  it('drops a full-width period too, the one a Chinese or Japanese reason ends with', () => {
    const zhItem = (name: string) => `无法附加 ${name}`
    const zhLimit = '文件超过 16 MiB，即浏览器可附加文件的大小上限。'

    const { message } = dropWarning(
      [
        { name: '报告', reason: zhLimit },
        { name: '日志', reason: zhLimit }
      ],
      zhItem,
      more
    )

    expect(message).toBe(`无法附加 报告: ${zhLimit.slice(0, -1)}; 无法附加 日志: ${zhLimit}`)
    expect(message).not.toContain('。;')
  })

  it('keeps a lone reason as it is, period included, with no detail', () => {
    expect(dropWarning([{ name: 'huge.zip', reason: limit }], item, more)).toEqual({
      message: `Could not attach huge.zip: ${limit}`
    })
  })
})
