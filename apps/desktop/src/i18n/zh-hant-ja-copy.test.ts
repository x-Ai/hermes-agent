import { describe, expect, it } from 'vitest'

import { jaOverrides } from './ja'
import { zhHantOverrides } from './zh-hant'

// The zh-hant and ja overlays came from machine translation. These blocks have been
// reviewed against English; a key an overlay leaves out falls back to English and is
// not read here.
const REVIEWED = {
  'zh-hant': [
    'fileMenu',
    'titlebar',
    'keybinds',
    'paletteCommands',
    'findInPage',
    'sidebar',
    'shell',
    'rightSidebar',
    'zones',
    'contextMenu',
    'settings.connections',
    'notifications',
    'settings.managedUpdates',
    'settings.uninstall',
    'boot.causes',
    'boot.steps',
    'boot.errors',
    'boot.failure',
    'commandCenter.maintenance',
    'assistant.thread',
    'sendDiagnostics',
    'errors',
    'skills.plugins',
    'assistant.mcpSetup',
    'settings.mcp',
    'promptNotices.sessionCommands',
    'settings.plugins',
    'skills.hub'
  ],
  ja: [
    'fileMenu',
    'titlebar',
    'keybinds',
    'paletteCommands',
    'findInPage',
    'notifications',
    'sidebar',
    'shell',
    'rightSidebar',
    'zones',
    'contextMenu',
    'freeTier',
    'desktop',
    'billingPage',
    'settings.billing',
    'settings.mcp'
  ]
} as const

const OVERLAYS: Record<keyof typeof REVIEWED, unknown> = { 'zh-hant': zhHantOverrides, ja: jaOverrides }

// Characters that exist only in Simplified Chinese (each has a different Traditional
// form). Machine translation slipped them into zh-hant copy: 过滤器, 合并, 全部折叠, 触发.
const SIMPLIFIED_ONLY =
  /[过这们为个对时会发开关还从进应网无与认设说话请让读写选择删叠机动页图码务级线连载档输键显隐闭间问题项览计运执实现处历记录换简数据库账户单么样经终侧边栏视标签编辑复并触]/u

// Terms Taiwan says differently (端口 → 連接埠, 網關 → 閘道, 會話 → 工作階段, 加載 → 載入,
// 調試 → 偵錯, 日志 → 日誌, 默認 → 預設, 插件 → 外掛程式, ...), and 您, since zh-hant copy
// says 你. Machine translation left 您, 端口, 網關, 會話, 加載, 調試 and 日志 in blocks now reviewed.
const NOT_TAIWAN_USAGE = /您|端口|網關|會話|加載|調試|日志|默認|視頻|軟件|屏幕|菜單|鼠標|服務器|緩存|激活|插件|文件夾/u

// Three English words in a row outside a code span: a sentence the overlay kept in
// English ("now run through your Nous subscription", "405 Method Not Allowed").
const ENGLISH_RUN = /\b[A-Za-z]{2,}(?: +[A-Za-z]{2,}){2,}\b/

// A button the copy quotes as the user sees it, on a page the app embeds but never
// localizes: the docs site's skills hub picker (website/src/pages/skills/index.tsx).
const UNLOCALIZED_LABEL = /「\+ Add to this Agent」/g

type Leaf = { path: string; value: unknown }

function leaves(value: unknown, path: string): Leaf[] {
  if (Array.isArray(value)) {
    return value.flatMap((child, index) => leaves(child, `${path}[${index}]`))
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, path ? `${path}.${key}` : key))
  }

  return [{ path, value }]
}

const at = (root: unknown, path: string) =>
  path.split('.').reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], root)

// A one-element array reads as its marker in a template and still takes the `.map` /
// `.join` / `.at` a list argument gets.
function rendered(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value !== 'function') {
    return undefined
  }

  try {
    const out = value(...Array.from({ length: Math.max(value.length, 1) }, (_, index) => [`⟦${index}⟧`]))

    return typeof out === 'string' ? out : undefined
  } catch {
    return undefined // needs a structured argument; nothing to inspect
  }
}

function copy(found: Leaf[]): { path: string; text: string }[] {
  return found.flatMap(({ path, value }) => {
    const text = rendered(value)

    return text === undefined ? [] : [{ path, text }]
  })
}

function reviewedCopy(locale: keyof typeof REVIEWED): { path: string; text: string }[] {
  return copy(REVIEWED[locale].flatMap(block => leaves(at(OVERLAYS[locale], block), block)))
}

describe.each(['zh-hant', 'ja'] as const)('the reviewed %s copy', locale => {
  it('reads every reviewed block', () => {
    for (const block of REVIEWED[locale]) {
      expect(at(OVERLAYS[locale], block), block).toBeTypeOf('object')
    }
  })

  it('keeps no English sentence outside code', () => {
    const faults = reviewedCopy(locale)
      .filter(({ text }) => ENGLISH_RUN.test(text.replace(/`[^`]*`/g, '').replace(UNLOCALIZED_LABEL, '')))
      .map(({ path, text }) => `${path}: ${text}`)

    expect(faults).toEqual([])
  })
})

// Unlike the English check, this one reads the whole zh-hant overlay: no leaf, reviewed
// or not, may hold a Simplified character.
describe('the zh-hant overlay', () => {
  it('is written in Traditional characters', () => {
    const faults = copy(leaves(zhHantOverrides, ''))
      .filter(({ text }) => SIMPLIFIED_ONLY.test(text))
      .map(({ path, text }) => `${path}: ${text}`)

    expect(faults).toEqual([])
  })
})

// Like the English check, this one reads only the reviewed blocks: the unswept rest of
// the overlay still has these.
describe('the reviewed zh-hant copy', () => {
  it('uses Taiwan terms and addresses the user as 你', () => {
    const faults = reviewedCopy('zh-hant')
      .filter(({ text }) => NOT_TAIWAN_USAGE.test(text))
      .map(({ path, text }) => `${path}: ${text}`)

    expect(faults).toEqual([])
  })
})

// The ja MCP copy takes server names and counts, which ja copy sets apart with a space
// ("${name} のインストールに失敗しました"). Machine translation glued them to the sentence
// ("インストールに失敗しました${name}"). Other reviewed ja blocks attach a localized duration
// to its particle on purpose ("${time}後にリセット"), so this reads only the blocks listed here.
const JA_SPACED_ARGUMENTS = ['settings.mcp'] as const

const GLUED_ARGUMENT = /[\p{sc=Hira}\p{sc=Kana}\p{sc=Han}]⟦\d+⟧|⟦\d+⟧[\p{sc=Hira}\p{sc=Kana}\p{sc=Han}]/u

describe('the reviewed ja copy', () => {
  it('sets each server name and count apart from the sentence around it', () => {
    const faults = copy(JA_SPACED_ARGUMENTS.flatMap(block => leaves(at(jaOverrides, block), block)))
      .filter(({ text }) => GLUED_ARGUMENT.test(text))
      .map(({ path, text }) => `${path}: ${text}`)

    expect(faults).toEqual([])
  })
})
