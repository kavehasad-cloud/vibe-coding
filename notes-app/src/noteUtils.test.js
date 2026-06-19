import { describe, it, expect } from 'vitest'
import { isBlank } from './noteUtils'

describe('isBlank', () => {
  it('returns true for an empty string', () => {
    expect(isBlank('')).toBe(true)
  })

  it('returns true for spaces only', () => {
    expect(isBlank('   ')).toBe(true)
  })

  it('returns false for real text', () => {
    expect(isBlank('hello')).toBe(false)
  })
})