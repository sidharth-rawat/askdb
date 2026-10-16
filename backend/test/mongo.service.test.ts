import { describe, it, expect } from 'vitest'
import { validateMongoPipeline } from '../src/services/database/mongo.service.js'

describe('validateMongoPipeline', () => {
  it('accepts a $match/$project pipeline', () => {
    const result = validateMongoPipeline([{ $match: { a: 1 } }, { $project: { a: 1 } }])
    expect(result.isValid).toBe(true)
  })

  it('rejects $out', () => {
    const result = validateMongoPipeline([{ $out: 'x' }])
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('rejects $merge', () => {
    const result = validateMongoPipeline([{ $merge: {} }])
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('rejects $where', () => {
    const result = validateMongoPipeline([{ $where: 'true' }])
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('rejects a stage with no $ operator', () => {
    const result = validateMongoPipeline([{ foo: 1 }])
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })
})
