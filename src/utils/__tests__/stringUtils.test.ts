import { describe, it, expect } from 'vitest'
import { safedParseInt } from '../stringUtils'

describe('safedParseInt', () => {
  it('parses valid numbers', () => {
    expect(safedParseInt('123')).toBe(123)
    expect(safedParseInt('0')).toBe(0)
  })

  it('returns -1 for invalid numbers', () => {
    expect(safedParseInt('abc')).toBe(-1)
    expect(safedParseInt('')).toBe(-1)
  })
})
