import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { ja } from './ja'
import { zh } from './zh'
import { zhHant } from './zh-hant'

// Platform plugin manifests declare the connector credential fields the backend
// serves to Settings › Messaging (requires_env / optional_env). The Desktop names
// and explains each one through messaging.fieldCopy, so a field upstream adds
// without a catalog entry silently renders in English in every locale the fork
// ships complete. Pin the manifests to those catalogs.
const PLATFORMS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../plugins/platforms')

function manifestEnvKeys(manifest: string): string[] {
  const keys: string[] = []
  let inEnvSection = false

  for (const line of manifest.split('\n')) {
    if (/^\S/.test(line)) {
      inEnvSection = /^(requires_env|optional_env):/.test(line)

      continue
    }

    // A list item is either a bare name or a mapping that starts with `name:`.
    const entry = inEnvSection ? /^\s*-\s*(?:name:\s*)?["']?([A-Z][A-Z0-9_]*)["']?\s*$/.exec(line) : null

    if (entry) {
      keys.push(entry[1])
    }
  }

  return keys
}

const manifestKeys = [
  ...new Set(
    readdirSync(PLATFORMS_DIR)
      .map(dir => resolve(PLATFORMS_DIR, dir, 'plugin.yaml'))
      .filter(path => existsSync(path))
      .flatMap(path => manifestEnvKeys(readFileSync(path, 'utf8')))
  )
]

describe('messaging field copy', () => {
  it('reads the platform plugin manifests', () => {
    expect(manifestKeys).toContain('TELEGRAM_BOT_TOKEN')
    expect(manifestKeys.length).toBeGreaterThan(100)
  })

  it.each([
    ['zh', zh],
    ['zh-hant', zhHant],
    ['ja', ja]
  ])('%s names and explains every connector field a platform plugin declares', (_locale, catalog) => {
    const missing = manifestKeys.filter(key => {
      const copy = catalog.messaging.fieldCopy[key]

      return !copy?.label || !copy.help
    })

    expect(missing).toEqual([])
  })
})
