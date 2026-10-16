import { describe, it, expect } from 'vitest'
import { validateSQL } from '../src/services/database/sql.service.js'

describe('validateSQL', () => {
  it('accepts a SELECT', () => expect(validateSQL('SELECT * FROM users').isValid).toBe(true))
  it('accepts a WITH/CTE', () => expect(validateSQL('WITH x AS (SELECT 1) SELECT * FROM x').isValid).toBe(true))
  it('rejects DELETE', () => expect(validateSQL('DELETE FROM users').isValid).toBe(false))
  it('rejects DROP', () => expect(validateSQL('DROP TABLE users').isValid).toBe(false))
  it('rejects a non-SELECT leading statement', () => expect(validateSQL('EXPLAIN SELECT 1').isValid).toBe(false))
  it('rejects stacked statements', () => expect(validateSQL('SELECT 1; SELECT 2').isValid).toBe(false))
  it('allows a single trailing semicolon', () => expect(validateSQL('SELECT 1;').isValid).toBe(true))
})
