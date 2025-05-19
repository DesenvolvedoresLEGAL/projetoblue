
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';

// Mock Supabase User and Session
const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z',
  role: '',
  updated_at: '2023-01-01T00:00:00Z',
};

const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  token_type: 'bearer',
  user: mockUser,
  expires_at: 123456789,
  expires_in: 3600,
};

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ 
      data: { 
        session: mockSession 
      } 
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-user-id',
            email: 'test@example.com',
            role: 'analyst',
            is_active: true,
            is_approved: true,
          },
          error: null,
        }),
      }),
    }),
  }),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock toast for notifications
vi.mock('@/utils/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Test component that uses auth context
const TestComponent = () => {
  const { isAuthenticated, user, signIn, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <button data-testid="login-button" onClick={() => signIn('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="logout-button" onClick={() => signOut()}>
        Logout
      </button>
    </div>
  );
};

// Wrapper for the AuthProvider with routing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides authentication status and user data', async () => {
    render(<TestComponent />, { wrapper });

    // Initial state should show loading and then authenticated
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('handles sign in action', async () => {
    render(<TestComponent />, { wrapper });

    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));

    // Should call signIn
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('handles sign out action', async () => {
    render(<TestComponent />, { wrapper });

    // Click logout button
    fireEvent.click(screen.getByTestId('logout-button'));

    // Should call signOut and navigate to login
    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
