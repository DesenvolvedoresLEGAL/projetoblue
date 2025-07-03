import { describe, it, expect } from 'vitest'
import { getLoginSuccessMessage, getLogoutSuccessMessage } from '../roleToastMessages'

const cases = [
  { role: 'admin', label: 'Administrador' },
  { role: 'suporte', label: 'Suporte' },
  { role: 'cliente', label: 'Cliente' },
  { role: 'user', label: 'Usuário' }
] as const

describe('role toast message helpers', () => {
  it('returns role specific login message', () => {
    cases.forEach(c => {
      const msg = getLoginSuccessMessage(c.role, 'Joao')
      expect(msg).toContain(c.label)
      expect(msg).toContain('Joao')
    })
  })

  it('returns role specific logout message', () => {
    cases.forEach(c => {
      const msg = getLogoutSuccessMessage(c.role)
      expect(msg).toContain(c.label)
    })
  })
})
