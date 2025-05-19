
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PrivateRoute } from '@/features/auth/components/PrivateRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '@/features/auth/context/AuthContext';

// Mock the useAuth hook values
const mockAuthContext = {
  isLoading: false,
  isAuthenticated: true,
  user: { id: 'test-user-id', email: 'test@example.com' },
  profile: { id: 'test-user-id', email: 'test@example.com', role: 'analyst', is_active: true, is_approved: true, created_at: '', last_login: '', bits_referral_code: '' },
  error: null,
  session: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  hasProfile: true,
};

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Protected component for testing
const ProtectedComponent = () => <div>Protected Content</div>;

describe('PrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when auth is loading', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={{ ...mockAuthContext, isLoading: true } as any}>
          <Routes>
            <Route path="/protected" element={<PrivateRoute />}>
              <Route index element={<ProtectedComponent />} />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={{ ...mockAuthContext, isAuthenticated: false } as any}>
          <Routes>
            <Route path="/protected" element={<PrivateRoute />}>
              <Route index element={<ProtectedComponent />} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Should redirect to login
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows access when authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthContext.Provider value={mockAuthContext as any}>
          <Routes>
            <Route path="/protected" element={<PrivateRoute />}>
              <Route index element={<ProtectedComponent />} />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Should render the protected component
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to unauthorized when role check fails', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthContext.Provider value={mockAuthContext as any}>
          <Routes>
            <Route path="/admin" element={<PrivateRoute requiredRole="admin" />}>
              <Route index element={<div>Admin Content</div>} />
            </Route>
            <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Should redirect to unauthorized
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });
});
