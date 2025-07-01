import { render, screen } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useAuthSession } from '../useAuthSession'
import type { AuthState } from '@/types/auth'
import type { User } from '@supabase/supabase-js'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '1' } } } }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }
}))

describe('useAuthSession', () => {
  vi.useFakeTimers()

  const baseState: AuthState = {
    user: { id: '1' } as unknown as User,
    profile: null,
    isLoading: false,
    error: null
  }

  it('shows dialog on refresh interval', async () => {
    const update = vi.fn()
    const signOut = vi.fn()

    const { result } = renderHook(() => useAuthSession(update, baseState, signOut))
    render(<>{result.current}</>)

    await act(async () => {
      vi.advanceTimersByTime(30 * 60 * 1000)
      await Promise.resolve()
    })

    expect(screen.getByText('Olá, ainda está ai?')).toBeInTheDocument()
  })

  it('keeps session when clicking sim', async () => {
    const update = vi.fn()
    const signOut = vi.fn()

    const { result } = renderHook(() => useAuthSession(update, baseState, signOut))
    render(<>{result.current}</>)

    await act(async () => {
      vi.advanceTimersByTime(30 * 60 * 1000)
      await Promise.resolve()
    })

    act(() => {
      screen.getByText('sim').click()
    })

    expect(signOut).not.toHaveBeenCalled()
  })

  it('logs out when clicking não', async () => {
    const update = vi.fn()
    const signOut = vi.fn()

    const { result } = renderHook(() => useAuthSession(update, baseState, signOut))
    render(<>{result.current}</>)

    await act(async () => {
      vi.advanceTimersByTime(30 * 60 * 1000)
      await Promise.resolve()
    })

    act(() => {
      screen.getByText('não').click()
    })

    expect(signOut).toHaveBeenCalled()
  })
})
