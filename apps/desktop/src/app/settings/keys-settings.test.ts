import { describe, expect, it } from 'vitest'

import { zh } from '@/i18n/zh'
import type { EnvVarInfo } from '@/types/hermes'

import { localizedCredentialInfo } from './keys-settings'

const backendInfo: EnvVarInfo = {
  advanced: false,
  category: 'setting',
  description: 'Sudo password for terminal commands requiring root access',
  is_password: true,
  is_set: false,
  redacted_value: null,
  tools: [],
  url: null
}

describe('localizedCredentialInfo', () => {
  it('replaces backend description copy without changing credential behavior metadata', () => {
    const localized = localizedCredentialInfo('SUDO_PASSWORD', backendInfo, zh.settings.envKeys)

    expect(localized.description).toContain('终端命令')
    expect(localized).toMatchObject({
      category: backendInfo.category,
      is_password: backendInfo.is_password,
      is_set: backendInfo.is_set,
      url: backendInfo.url
    })
    expect(backendInfo.description).toBe('Sudo password for terminal commands requiring root access')
  })

  it('keeps backend copy for plugin-provided settings with no locale entry', () => {
    expect(localizedCredentialInfo('PLUGIN_SETTING', backendInfo, zh.settings.envKeys)).toBe(backendInfo)
  })
})
