import { describe, it, expect } from 'vitest'
import { pruneSchema } from '../src/services/schema/schema.service.js'
import type { NormalizedSchema } from '../src/types.js'

const col = (name: string, type = 'text') =>
  ({ name, type, nullable: true, isPrimaryKey: false })

const schema = (names: string[]): NormalizedSchema => ({
  source: 'postgres',
  tables: Object.fromEntries(names.map(n => [n, { columns: [col('id'), col('name'), col('email')] }])),
})

describe('pruneSchema', () => {
  it('returns the full schema when there are <=5 tables', async () => {
    const s = schema(['users', 'orders'])
    expect(Object.keys((await pruneSchema(s, 'anything')).tables)).toHaveLength(2)
  })

  it('keeps only tables relevant to the message when >5 tables', async () => {
    const s = schema(['users', 'orders', 'products', 'payments', 'reviews', 'carts'])
    const pruned = await pruneSchema(s, 'show me all users')
    expect(Object.keys(pruned.tables)).toContain('users')
    expect(Object.keys(pruned.tables).length).toBeLessThanOrEqual(3)
  })

  it('returns empty tables when nothing scores >= MIN_SCORE', async () => {
    const s = schema(['users', 'orders', 'products', 'payments', 'reviews', 'carts'])
    const pruned = await pruneSchema(s, 'zzz qqq')
    expect(Object.keys(pruned.tables)).toHaveLength(0)
  })
})
