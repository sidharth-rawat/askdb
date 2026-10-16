import { describe, it, expect, vi, beforeAll } from 'vitest'

beforeAll(() => { process.env.REDIS_ENCRYPTION_SECRET = 'test-secret' })

describe('chatManager.ask', () => {
  it('throws a reconnect error when no cached schema exists', async () => {
    const { ask } = await import('../src/manager/chat.manager.js')
    const redis = { get: vi.fn().mockResolvedValue(null) } as any
    await expect(ask('id', 'hi', redis, {} as any, {} as any))
      .rejects.toThrow(/reconnect the database/i)
  })
})
