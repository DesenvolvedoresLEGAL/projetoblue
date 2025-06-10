
import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType } from '@/types/authContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActions } from '@/hooks/useAuthActions';
import { UserRole } from '@/types/auth';
import { hasMinimumRole } from '@/utils/roleUtils';
import { DEFAULT_USER_ROLE } from '@/constants/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, updateState } = useAuthState();
  const { signIn, signUp, signOut, technicalError } = useAuthActions(updateState);
  
  // Set up auth session check and subscription
  useAuthSession(updateState);
  
  // Get user role from profile with safety check
  const userRole: UserRole = state.profile?.role || DEFAULT_USER_ROLE;
  
  // Create hasMinimumRole function bound to current user role with safety check
  const hasMinimumRoleForUser = (requiredRole: UserRole) => {
    try {
      if (!state.user || !state.profile) {
        return false;
      }
      return hasMinimumRole(userRole, requiredRole);
    } catch (error) {
      console.warn('Error checking role permissions:', error);
      return false;
    }
  };
  
  // Calculate isAuthenticated with safety checks
  const isAuthenticated = Boolean(state.user && state.profile && !state.isLoading);
  
  // Log auth state changes to help with debugging
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated,
      hasUser: !!state.user,
      hasProfile: !!state.profile,
      userRole,
      isLoading: state.isLoading,
      hasError: !!state.error
    });
  }, [state.user, state.profile, state.isLoading, state.error, userRole, isAuthenticated]);

  // Create safe context value
  const contextValue: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    technicalError,
    userRole,
    hasMinimumRole: hasMinimumRoleForUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
