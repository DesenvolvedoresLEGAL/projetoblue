import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import React from 'react'
import { useAuthSession } from '../useAuthSession'
import { AuthState } from '@/types/auth'
import { useAuthActions } from '../useAuthActions'

vi.mock('../useAuthActions')
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: '1' } } } }))
    }
  }
}))

describe('useAuthSession', () => {
  const baseState: AuthState = { user: null, profile: null, isLoading: false, error: null }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  function Wrapper() {
    const [state, setState] = React.useState(baseState)
    const updateState = (s: Partial<AuthState>) => setState(prev => ({ ...prev, ...s }))
    const dialog = useAuthSession(updateState, state)
    return <div>{dialog}</div>
  }

  it('shows dialog when refresh fires', async () => {
    render(<Wrapper />)
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000)
    expect(await screen.findByText('Olá, ainda está ai?')).toBeInTheDocument()
  })

  it('clicking "sim" keeps session', async () => {
    const signOut = vi.fn()
    ;(useAuthActions as unknown as vi.Mock).mockReturnValue({ signOut })
    render(<Wrapper />)
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000)
    fireEvent.click(await screen.findByText('sim'))
    expect(signOut).not.toHaveBeenCalled()
  })

  it('clicking "não" signs out', async () => {
    const signOut = vi.fn()
    ;(useAuthActions as unknown as vi.Mock).mockReturnValue({ signOut })
    render(<Wrapper />)
    await vi.advanceTimersByTimeAsync(30 * 60 * 1000)
    fireEvent.click(await screen.findByText('não'))
    expect(signOut).toHaveBeenCalled()
  })
})

