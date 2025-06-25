
import React, { useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActions } from '@/hooks/useAuthActions';
import { UserRole } from '@/types/auth';
import { hasMinimumRole } from '@/utils/roleUtils';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, updateState } = useAuthState();
  const { signIn, signUp, signOut, technicalError } = useAuthActions(updateState);
  
  // Set up auth session check and subscription
  useAuthSession(updateState);
  
  // Get user role from profile
  const userRole: UserRole = state.profile?.role || 'cliente';
  
  // Create hasMinimumRole function bound to current user role
  const hasMinimumRoleForUser = (requiredRole: UserRole) => 
    hasMinimumRole(userRole, requiredRole);
  
  // Log auth state changes to help with debugging
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated: !!state.user && !!state.profile,
      hasUser: !!state.user,
      hasProfile: !!state.profile,
      userRole,
      isLoading: state.isLoading,
      hasError: !!state.error
    });
  }, [state.user, state.profile, state.isLoading, state.error, userRole]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!state.user && !!state.profile,
        technicalError,
        userRole,
        hasMinimumRole: hasMinimumRoleForUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


