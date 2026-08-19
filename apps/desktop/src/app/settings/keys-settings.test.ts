import { describe, expect, it } from 'vitest'

import { zh } from '@/i18n/zh'
import type { EnvVarInfo } from '@/types/hermes'

import { credentialRowLabel } from './credential-key-ui'
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
    const localized = localizedCredentialInfo('SUDO_PASSWORD', backendInfo, zh.settings.envKeys, zh.messaging.fieldCopy)

    expect(localized.description).toContain('终端命令')
    expect(localized).toMatchObject({
      category: backendInfo.category,
      is_password: backendInfo.is_password,
      is_set: backendInfo.is_set,
      url: backendInfo.url
    })
    expect(backendInfo.description).toBe('Sudo password for terminal commands requiring root access')
    expect(credentialRowLabel('SUDO_PASSWORD', localized)).toBe('SUDO PASSWORD')
  })

  it('keeps backend copy for plugin-provided settings with no locale entry', () => {
    expect(localizedCredentialInfo('PLUGIN_SETTING', backendInfo, zh.settings.envKeys, zh.messaging.fieldCopy)).toBe(
      backendInfo
    )
  })

  it('reuses localized messaging help for settings rows owned by a platform', () => {
    const info = {
      ...backendInfo,
      description: 'Default space for cron / notification delivery.'
    }

    expect(
      localizedCredentialInfo('GOOGLE_CHAT_HOME_CHANNEL', info, zh.settings.envKeys, zh.messaging.fieldCopy).description
    ).toContain('通知投递')
  })
})
