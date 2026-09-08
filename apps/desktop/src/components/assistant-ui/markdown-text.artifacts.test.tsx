import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { artifactsForSession, clearArtifactRegistry } from '@/store/artifacts'
import { $previewTabs } from '@/store/preview'
import { $activeSessionId, $selectedStoredSessionId } from '@/store/session'

import { MarkdownTextContent } from './markdown-text'

const HTML_DOC = `<!doctype html>
<html>
<head><title>Pomodoro Timer</title></head>
<body>
<h1>Pomodoro</h1>
<p>A tiny focus timer that counts down twenty-five minutes.</p>
<script>let seconds = 25 * 60; setInterval(() => { seconds -= 1 }, 1000)</script>
</body>
</html>`

const SMALL_SNIPPET = 'const x = 1'

function jsonVersion(version: number): string {
  return JSON.stringify(
    {
      version,
      entries: Array.from({ length: 24 }, (_, index) => ({ id: index + 1, enabled: index % 2 === 0 }))
    },
    null,
    2
  )
}

function fenced(language: string, body: string): string {
  return `Here you go:\n\n\`\`\`${language}\n${body}\n\`\`\`\n`
}

// End-to-end for the artifact path: a substantial ```html fence in assistant
// markdown must come out of preprocessMarkdown -> Streamdown -> SyntaxHighlighter
// as an artifact card (registered in the store), while small fences keep the
// plain code-card path.
describe('MarkdownTextContent artifacts', () => {
  beforeEach(() => {
    $activeSessionId.set('session-artifacts')
    $selectedStoredSessionId.set(null)
    window.localStorage.clear()
    clearArtifactRegistry()
  })

  afterEach(() => {
    cleanup()
    $activeSessionId.set(null)
    $selectedStoredSessionId.set(null)
    clearArtifactRegistry()
    window.localStorage.clear()
  })

  it('renders a substantial html fence as an artifact card and registers it', async () => {
    render(<MarkdownTextContent isRunning={false} text={fenced('html', HTML_DOC)} />)

    const card = await screen.findByText('Pomodoro Timer')

    expect(card.closest('button')?.dataset.slot).toBe('aui_artifact-card')
    expect(artifactsForSession('session-artifacts')).toHaveLength(1)
    expect(artifactsForSession('session-artifacts')[0]?.kind).toBe('html')
    // Registration alone must not open the rail (offer, don't hijack).
    expect($previewTabs.get()).toHaveLength(0)
  })

  it('keeps a small fence as a plain code block', async () => {
    const { container } = render(<MarkdownTextContent isRunning={false} text={fenced('js', SMALL_SNIPPET)} />)

    // The code card mounts synchronously; Shiki may split tokens into spans,
    // so assert on the card slots rather than text content.
    expect(container.querySelector('[data-slot="code-card"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="aui_artifact-card"]')).toBeNull()
    expect(artifactsForSession('session-artifacts')).toHaveLength(0)
  })

  it('renders a copy control on a fenced code block', async () => {
    render(<MarkdownTextContent isRunning={false} text={fenced('js', SMALL_SNIPPET)} />)

    expect(await screen.findByRole('button', { name: 'Copy code' })).toBeTruthy()
  })

  it('keeps repeated artifact rows and labels each version', async () => {
    const { container } = render(
      <MarkdownTextContent
        isRunning={false}
        text={`${fenced('json', jsonVersion(1))}\n${fenced('json', jsonVersion(2))}`}
      />
    )

    expect(await screen.findAllByRole('button', { name: /json/i })).toHaveLength(2)
    expect(await screen.findByText('v1/2')).toBeTruthy()
    expect(screen.getByText('v2/2')).toBeTruthy()
    expect(screen.getAllByText(/^\+\d+$/)).toHaveLength(2)

    const rows = [...container.querySelectorAll<HTMLElement>('[data-slot="aui_artifact-card"]')]

    expect(rows).toHaveLength(2)

    for (const row of rows) {
      expect(row.hasAttribute('data-conversation-scaffold')).toBe(true)
      expect(row.classList.contains('h-(--conversation-line-height)')).toBe(true)
      expect(row.querySelector('[data-slot="aui_artifact-card-glyph"]')?.classList.contains('size-3.5')).toBe(true)
      expect(
        row
          .querySelector('[data-slot="aui_artifact-card-title"]')
          ?.classList.contains('text-[length:var(--conversation-tool-font-size)]')
      ).toBe(true)
    }
  })

  it('does not register while the message is still streaming', async () => {
    render(<MarkdownTextContent isRunning text={fenced('html', HTML_DOC)} />)

    await screen.findByText('Pomodoro Timer')

    expect(artifactsForSession('session-artifacts')).toHaveLength(0)
  })
})
