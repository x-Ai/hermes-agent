import { describe, expect, it } from 'vitest'

import { dashboardZh } from './dashboard'
import { localizeChannelTestResult } from './channel-metadata'

describe('channel metadata localization', () => {
  const copy = dashboardZh.channels

  it('localizes every stable platform-test result instead of displaying backend prose', () => {
    const cases: Array<[Parameters<typeof localizeChannelTestResult>[1], string]> = [
      [{ ok: false, state: 'disabled', code: 'disabled', message: 'legacy prose' },
        '已禁用。请启用后重启网关。'],
      [{ ok: false, state: 'not_configured', code: 'missing_required_setup',
        message: 'legacy prose', missing: ['TELEGRAM_BOT_TOKEN'] },
        '缺少必需配置：TELEGRAM_BOT_TOKEN'],
      [{ ok: false, state: 'not_configured', code: 'setup_incomplete', message: 'legacy prose' },
        '平台配置尚未完成。'],
      [{ ok: false, state: 'stopped', code: 'gateway_not_running', message: 'legacy prose' },
        '网关未运行。请重启网关以连接此平台。'],
      [{ ok: true, state: 'connected', code: 'connected', message: 'legacy prose' },
        '已连接。'],
      [{ ok: false, state: 'error', code: 'connection_error', message: 'TLS failed' },
        '连接错误：TLS failed'],
      [{ ok: false, state: 'waiting', code: 'awaiting_connection', message: 'legacy prose' },
        '配置看起来已完成，但网关尚未报告连接。请重启网关。']
    ]

    for (const [result, expected] of cases) {
      expect(localizeChannelTestResult('Discord', result, copy, 'zh')).toBe(expected)
    }
  })

  it('also translates fixed replies from a pre-code backend', () => {
    expect(localizeChannelTestResult('Discord', {
      ok: false,
      state: 'disabled',
      message: 'Discord is disabled. Enable it, then restart the gateway.'
    }, copy, 'zh')).toBe('已禁用。请启用后重启网关。')
  })
})
