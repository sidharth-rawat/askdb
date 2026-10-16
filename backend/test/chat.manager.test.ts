import { describe, it, expect, vi, beforeAll } from 'vitest'

beforeAll(() => { process.env.REDIS_ENCRYPTION_SECRET = 'test-secret' })

// Pretend a live pool already exists so ensureConnected() is a no-op and we can
// test the schema-cache-miss guard in isolation.
vi.mock('../src/manager/pool.manager.js', () => ({
  getPool: () => ({}),
  getActivePool: () => ({}),
  setPool: () => {},
  removePool: () => {},
  clearAllPools: async () => {},
}))

describe('chatManager.ask', () => {
  it('throws a reconnect error when the schema cache is missing (pool present)', async () => {
    const { ask } = await import('../src/manager/chat.manager.js')
    const redis = { get: vi.fn().mockResolvedValue(null) } as any
    await expect(ask('id', 'hi', redis, {} as any, {} as any))
      .rejects.toThrow(/reconnect the database/i)
  })
})
