
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
  const sessionDialog = useAuthSession(updateState, state);
  
  // Get user role from profile
  const userRole: UserRole = state.profile?.role || 'cliente';
  
  // Create hasMinimumRole function bound to current user role
  const hasMinimumRoleForUser = (requiredRole: UserRole) => 
    hasMinimumRole(userRole, requiredRole);

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
      {sessionDialog}
    </AuthContext.Provider>
  );
};


