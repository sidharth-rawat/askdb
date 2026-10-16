import { describe, it, expect, beforeAll } from 'vitest'

beforeAll(() => { process.env.REDIS_ENCRYPTION_SECRET = 'test-secret' })

describe('crypto.util', () => {
  it('round-trips an object through encrypt/decrypt', async () => {
    const { encryptObject, decryptObject } = await import('../src/utils/crypto.util.js')
    const obj = { host: 'db', password: 'p@ss', port: 5432 }
    const token = encryptObject(obj)
    expect(typeof token).toBe('string')
    expect(decryptObject(token)).toEqual(obj)
  })

  it('produces a stable sha256 database id for equal input', async () => {
    const { generateDatabaseId } = await import('../src/utils/crypto.util.js')
    const a = generateDatabaseId({ source: 'postgres', dbCredentials: { host: 'h' } })
    const b = generateDatabaseId({ source: 'postgres', dbCredentials: { host: 'h' } })
    expect(a).toBe(b)
    expect(a).toMatch(/^[0-9a-f]{64}$/)
  })

  it('throws when auth tag fails (wrong secret / tampered token)', async () => {
    const { encryptObject } = await import('../src/utils/crypto.util.js')
    const token = encryptObject({ a: 1 })
    const tampered = Buffer.from(token, 'base64')
    tampered[tampered.length - 1] ^= 0xff
    const { decryptObject } = await import('../src/utils/crypto.util.js')
    expect(() => decryptObject(tampered.toString('base64'))).toThrow()
  })
})
