import { AssistantRuntimeProvider, type ThreadMessage, useExternalStoreRuntime } from '@assistant-ui/react'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { I18nProvider, TRANSLATIONS } from '@/i18n'
import { toRuntimeMessage } from '@/lib/chat-runtime'
import { $displayTimestamps } from '@/store/display-timestamps'

import { assistantMessage, stubThreadEnvironment, ThreadRuntime, userMessage } from '../test-utils'

import { Thread } from '.'

// Timeline timestamps render only when `display.timestamps` is enabled.
$displayTimestamps.set(true)

const timestamp = new Date('2026-05-01T00:00:00.000Z')
stubThreadEnvironment()

const securityCheck = {
  schema_version: 1,
  status: 'pass',
  summary: 'No known matches detected.',
  checks: [
    {
      key: 'private_keys',
      label: 'Private keys',
      status: 'pass',
      finding_count: 0,
      details: []
    }
  ]
}

const professionalismCheck = {
  schema_version: 1,
  status: 'advisory',
  summary: 'One phrase may read as spam-like.',
  checks: [
    {
      key: 'manipulative_or_spam',
      status: 'advisory',
      finding_count: 1,
      details: ['Avoid urgency-based promotional wording.']
    }
  ]
}

function Harness({ asyncResult, displayKind, text }: { asyncResult?: string; displayKind?: string; text: string }) {
  const message = toRuntimeMessage({
    id: 'system-1',
    role: 'system',
    parts: [{ type: 'text', text }],
    timestamp: timestamp.getTime() / 1000,
    ...(asyncResult ? { asyncResult } : {}),
    ...(displayKind ? { displayKind } : {})
  })

  const runtime = useExternalStoreRuntime<ThreadMessage>({
    messages: [message],
    isRunning: false,
    onNew: async () => {}
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  )
}

function expectTimestampSeparated(container: HTMLElement, precedingText: string) {
  const row = container.querySelector('[data-role="system"]')
  const stamp = row?.querySelector('[data-slot="timeline-timestamp"]')?.textContent

  expect(stamp).toBeTruthy()
  expect(row?.textContent).toContain(`${precedingText} ${stamp}`)
}

afterEach(() => {
  cleanup()
  Reflect.deleteProperty(window, 'hermesDesktop')
  window.location.hash = ''
})

describe('background report disclosure', () => {
  it('renders a historical review summary once per skill operation without losing the supporting file', () => {
    const name = 'skill-from-review'
    const file = 'references/gates-and-accounts.md'
    const raw = `review:Self-improvement review: Skill '${name}' patched · Skill '${name}' patched (${file})`
    const copy = TRANSLATIONS.zh.assistant.thread.reviewSummary
    const messages = [toRuntimeMessage({ id: 'review-1', role: 'system', parts: [{ type: 'text', text: raw }] })]

    const { container } = render(
      <I18nProvider configClient={null} initialLocale="zh">
        <ThreadRuntime messages={messages}>
          <Thread />
        </ThreadRuntime>
      </I18nProvider>
    )

    const row = container.querySelector('[data-role="system"]')
    expect(row?.textContent).toBe(`${copy.label}${copy.skillNamedPatched(name, `(SKILL.md, ${file})`)}`)
    expect(row?.textContent?.split(name)).toHaveLength(2)
  })

  it('keeps result bodies out of the transcript until opened and removes them when collapsed', () => {
    const report = '{"blockers":[{"title":"Local-model readiness uses the wrong endpoint"}]}'
    const { container, getByRole } = render(<Harness asyncResult={report} text="2 background agents finished" />)

    expect(container.textContent).not.toContain('blockers')
    expectTimestampSeparated(container, '2 background agents finished')
    const toggle = getByRole('button', { name: '2 background agents finished' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    const output = container.querySelector('[data-slot="aui_assistant-message-content"]')
    expect(output).toBeTruthy()
    expect(container.textContent).toContain(report)

    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(container.textContent).not.toContain('blockers')
  })
})

describe('system message timestamp text separation', () => {
  it('separates an ordinary system row timestamp in accessible and copied text', () => {
    const { container } = render(<Harness text="Review saved." />)

    expectTimestampSeparated(container, 'Review saved.')
  })

  it('separates a slash-status timestamp in accessible and copied text', () => {
    const { container } = render(<Harness text={'slash:/model\nmodel changed'} />)

    expectTimestampSeparated(container, 'model changed')
  })

  it('separates a steer timestamp in accessible and copied text', () => {
    const { container } = render(<Harness text="steer:rerun tests" />)

    expectTimestampSeparated(container, 'rerun tests')
  })

  it('renders Wisdom slash output as a readable command result', () => {
    const { container } = render(
      <Harness text={'slash:/wisdom\nCollective Wisdom commands\n\n/wisdom browse — Search team skills'} />
    )

    const row = container.querySelector('[data-role="system"]')

    expect(row?.className).toContain('w-[min(92%,56rem)]')
    expect(row?.className).toContain('text-(--ui-text-secondary)')
    expect(row?.textContent).toContain('Collective Wisdom commands')
    expect(row?.textContent).toContain('/wisdom browse — Search team skills')
  })

  it('opens Wisdom browse results in an in-app skill preview', async () => {
    const openExternal = vi.fn().mockResolvedValue(undefined)

    const api = vi.fn().mockImplementation(({ path }: { path: string }) => {
      if (path.endsWith('/versions/1')) {
        return Promise.resolve({
          local_compatibility: { outcome: 'compatible' },
          portal_url: 'https://portal.example/orgs/team/wisdom/skills/skill-1?version=1',
          skill: { id: 'skill-1', slug: 'collective-wisdom-canary' },
          version: {
            author_description: 'The first canary release.',
            commit: 'sha256:commit-1',
            content_hash: 'sha256:content-1',
            explanation: 'Validated as a dependency-free canary.',
            package_manifest_hash: 'sha256:manifest-1',
            professionalism_check: professionalismCheck,
            published_at: '2026-01-02T03:04:05Z',
            scan: { verdict: 'pass', findings: [] },
            security_check: securityCheck,
            system_spec: {
              hermes: { minimum_version: '0.20.5' },
              platforms: ['macOS'],
              runtime: { shell: true }
            },
            verified_facts: { scan_verdict: 'pass' },
            version: 1
          }
        })
      }

      return Promise.resolve({
        latest_version_detail: {
          version: {
            author_description: 'Verify the Collective Wisdom canary flow.',
            professionalism_check: professionalismCheck,
            scan: { verdict: 'pass' },
            security_check: securityCheck,
            system_spec: {
              hermes: { minimum_version: '0.20.5' },
              platforms: ['macOS'],
              runtime: { shell: true }
            },
            version: 2
          }
        },
        local_compatibility: { outcome: 'compatible' },
        portal_url: 'https://portal.example/orgs/team/wisdom/skills/skill-1',
        skill: { id: 'skill-1', slug: 'collective-wisdom-canary' },
        versions: [
          {
            author_description: 'Current canary release.',
            professionalism_check: professionalismCheck,
            published_at: '2026-02-03T04:05:06Z',
            security_check: securityCheck,
            verified_facts: { scan_verdict: 'pass' },
            version: 2
          },
          {
            author_description: 'The first canary release.',
            professionalism_check: professionalismCheck,
            published_at: '2026-01-02T03:04:05Z',
            security_check: securityCheck,
            verified_facts: { scan_verdict: 'pass' },
            version: 1
          }
        ]
      })
    })

    Object.defineProperty(window, 'hermesDesktop', { configurable: true, value: { api, openExternal } })

    const { container } = render(
      <Harness
        text={
          'slash:/wisdom browse\nShared skills\n\ncollective-wisdom-canary\nv2 · Verify the canary.\nView: /wisdom show collective-wisdom-canary'
        }
      />
    )

    const preview = screen.getByRole('button', { name: 'Preview: collective-wisdom-canary' })

    expect(container.textContent).not.toContain('/wisdom show collective-wisdom-canary')
    expect(container.textContent).not.toContain('View:')
    fireEvent.click(preview)

    const dialog = await screen.findByRole('dialog', { name: /collective-wisdom-canary/ })

    expect(dialog).toBeTruthy()
    expect(await screen.findByText('Verify the Collective Wisdom canary flow.')).toBeTruthy()
    expect(screen.getByText('Hermes ≥ 0.20.5')).toBeTruthy()
    expect(screen.getByText('macOS')).toBeTruthy()
    expect(screen.getByText('shell')).toBeTruthy()
    expect(screen.getByText('compatible')).toBeTruthy()
    expect(within(dialog).getByRole('region', { name: 'Security check' })).toBeTruthy()
    expect(within(dialog).getByRole('region', { name: 'Professionalism check' })).toBeTruthy()
    expect(within(dialog).getByText('Private keys')).toBeTruthy()
    expect(within(dialog).getByText('Manipulative, deceptive, or spam-like wording')).toBeTruthy()
    expect(
      within(dialog).getByText('Agent-assessed and advisory. It does not block publication or installation.')
    ).toBeTruthy()
    expect(within(dialog).getByRole('button', { name: 'Versions' })).toBeTruthy()
    expect(within(dialog).getByRole('button', { name: 'View in Portal' })).toBeTruthy()
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith(expect.objectContaining({ path: '/api/wisdom/skills/collective-wisdom-canary' }))
    )

    fireEvent.click(within(dialog).getByRole('button', { name: 'View in Portal' }))
    expect(openExternal).toHaveBeenCalledWith('https://portal.example/orgs/team/wisdom/skills/skill-1')

    fireEvent.click(within(dialog).getByRole('button', { name: 'Versions' }))
    const firstVersion = within(dialog).getByRole('button', { name: /v1.*The first canary release/ })

    expect(firstVersion).toBeTruthy()
    fireEvent.click(firstVersion)

    expect(await within(dialog).findByText('Validated as a dependency-free canary.')).toBeTruthy()
    expect(within(dialog).getByText('sha256:content-1')).toBeTruthy()
    expect(within(dialog).getByText('sha256:manifest-1')).toBeTruthy()
    await waitFor(() =>
      expect(api).toHaveBeenCalledWith(expect.objectContaining({ path: '/api/wisdom/skills/skill-1/versions/1' }))
    )

    fireEvent.click(within(dialog).getByRole('button', { name: 'View in Portal' }))
    expect(openExternal).toHaveBeenLastCalledWith('https://portal.example/orgs/team/wisdom/skills/skill-1?version=1')

    fireEvent.click(within(dialog).getByRole('button', { name: /^Install/ }))
    expect(window.location.hash).toBe('#/skills?tab=collective&wisdomAction=install&wisdomSkillId=skill-1%40v1')
  })

  it('keeps non-Wisdom multiline slash output on the compact system-row treatment', () => {
    const { container } = render(<Harness text={'slash:/status\nGateway status\nReady'} />)
    const row = container.querySelector('[data-role="system"]')

    expect(row?.className).toContain('w-[60%]')
    expect(row?.className).toContain('text-muted-foreground/60')
    expect(row?.className).not.toContain('w-[min(92%,56rem)]')
    expect(row?.className).not.toContain('text-(--ui-text-secondary)')
  })
})

describe('system timeline placement', () => {
  it('places delegation completion output on the left reading edge', () => {
    const { container } = render(
      <Harness displayKind="async_delegation_complete" text="4 background agents finished" />
    )

    const row = container.querySelector('[data-role="system"]')

    expect(row?.classList.contains('self-start')).toBe(true)
    expect(row?.classList.contains('text-left')).toBe(true)
    expect(row?.classList.contains('px-(--message-text-indent)')).toBe(true)
    expect(row?.hasAttribute('data-conversation-scaffold')).toBe(true)
    expect(row?.classList.contains('text-[length:var(--conversation-tool-font-size)]')).toBe(true)
    expect(row?.classList.contains('leading-(--conversation-line-height)')).toBe(true)
    expect(row?.classList.contains('self-center')).toBe(false)
    expect(row?.classList.contains('text-center')).toBe(false)
    expect(row?.getAttribute('data-display-kind')).toBe('async_delegation_complete')
  })

  it('aligns an async report heading and partial output to the assistant reading edge', () => {
    const { container, getByRole } = render(
      <Harness
        asyncResult="Partial output"
        displayKind="async_delegation_complete"
        text="4 background agents finished"
      />
    )

    const root = container.querySelector('[data-role="system"]')
    const heading = root?.querySelector('[data-slot="aui_async-result-heading"]')

    expect(heading?.classList.contains('px-(--message-text-indent)')).toBe(true)
    expect(heading?.classList.contains('text-[length:var(--conversation-tool-font-size)]')).toBe(true)
    expect(heading?.classList.contains('leading-(--conversation-line-height)')).toBe(true)
    expect(root?.getAttribute('data-display-kind')).toBe('async_delegation_complete')
    fireEvent.click(getByRole('button', { name: '4 background agents finished' }))
    const output = root?.querySelector('[data-slot="aui_assistant-message-content"]')
    expect(output).toBeTruthy()
  })

  it('keeps the first delegation completion adjacent to a footer-bearing assistant message', () => {
    const completion = toRuntimeMessage({
      id: 'system-1',
      role: 'system',
      parts: [{ type: 'text', text: '4 background agents finished' }],
      timestamp: timestamp.getTime() / 1000,
      displayKind: 'async_delegation_complete'
    })

    const { container } = render(
      <ThreadRuntime messages={[userMessage(), assistantMessage(), completion]}>
        <Thread />
      </ThreadRuntime>
    )

    const assistant = container.querySelector('[data-slot="aui_assistant-message-root"]')
    const system = container.querySelector('[data-display-kind="async_delegation_complete"]')

    expect(assistant?.querySelector('[data-slot="aui_assistant-footer"]')).toBeTruthy()
    expect(assistant?.nextElementSibling).toBe(system)
  })

  it('keeps ordinary one-line timeline statuses centered', () => {
    const { container } = render(<Harness text="model changed" />)
    const row = container.querySelector('[data-role="system"]')

    expect(row?.classList.contains('self-center')).toBe(true)
    expect(row?.classList.contains('text-center')).toBe(true)
  })
})
