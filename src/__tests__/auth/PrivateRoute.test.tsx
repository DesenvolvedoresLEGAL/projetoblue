
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PrivateRoute } from '@/features/auth/components/PrivateRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';

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

// Mock useAuth hook
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => mockAuthContext)
}));

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
    vi.mocked(useAuth).mockReturnValueOnce({
      ...mockAuthContext,
      isLoading: true
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<PrivateRoute />}>
            <Route index element={<ProtectedComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValueOnce({
      ...mockAuthContext,
      isAuthenticated: false
    });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<PrivateRoute />}>
            <Route index element={<ProtectedComponent />} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to login
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows access when authenticated', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={<PrivateRoute />}>
            <Route index element={<ProtectedComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Should render the protected component
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to unauthorized when role check fails', () => {
    vi.mocked(useAuth).mockReturnValueOnce({
      ...mockAuthContext,
      profile: { ...mockAuthContext.profile, role: 'analyst' }
    });
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<PrivateRoute requiredRole="admin" />}>
            <Route index element={<div>Admin Content</div>} />
          </Route>
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to unauthorized
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });
});
