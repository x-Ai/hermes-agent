import { describe, expect, it, vi } from 'vitest'

import { JsonRpcGatewayClient } from './json-rpc-gateway'

/** EventTarget-based WebSocket stand-in whose open is driven by hand. */
class FakeWebSocket extends EventTarget {
  readyState = 0
  sent: string[] = []

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = 3
    this.dispatchEvent(new CloseEvent('close'))
  }

  open(): void {
    this.readyState = 1
    this.dispatchEvent(new Event('open'))
  }
}

describe('JsonRpcGatewayClient onOpen', () => {
  it('runs once per successful open, with a client that already accepts requests', async () => {
    const sockets: FakeWebSocket[] = []

    const onOpen = vi.fn((client: JsonRpcGatewayClient) => {
      void client.request('i18n.client_locale', { lang: 'zh' }).catch(() => {})
    })

    const client = new JsonRpcGatewayClient({
      socketFactory: () => {
        const socket = new FakeWebSocket()
        sockets.push(socket)

        return socket as unknown as WebSocket
      },
      heartbeatIntervalMs: 0,
      heartbeatDeadlineMs: 0,
      replay: false,
      onOpen
    })

    const first = client.connect('ws://gateway.test/api/ws')
    sockets[0].open()
    await first

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith(client)
    expect(sockets[0].sent.map(frame => JSON.parse(frame).method)).toEqual(['i18n.client_locale'])

    sockets[0].close()
    const second = client.connect('ws://gateway.test/api/ws')
    sockets[1].open()
    await second

    // A reconnect is a new transport on the backend: the announcement rides it again.
    expect(onOpen).toHaveBeenCalledTimes(2)
    expect(sockets[1].sent.map(frame => JSON.parse(frame).method)).toEqual(['i18n.client_locale'])
  })
})
