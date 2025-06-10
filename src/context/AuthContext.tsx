
import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType } from '@/types/authContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActions } from '@/hooks/useAuthActions';
import { UserRole } from '@/types/auth';
import { hasMinimumRole } from '@/utils/roleUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, updateState } = useAuthState();
  const { signIn, signUp, signOut, technicalError, isAuthProcessing } = useAuthActions(updateState);
  
  // Set up auth session check and subscription
  useAuthSession(updateState);
  
  // Get user role from profile
  const userRole: UserRole = state.profile?.role || 'cliente';
  
  // Create hasMinimumRole function bound to current user role
  const hasMinimumRoleForUser = (requiredRole: UserRole) => 
    hasMinimumRole(userRole, requiredRole);
  
  // Log auth state changes to help with debugging
  useEffect(() => {
    console.log('🔍 Auth state updated:', { 
      isAuthenticated: !!state.user && !!state.profile,
      hasUser: !!state.user,
      hasProfile: !!state.profile,
      userRole,
      isLoading: state.isLoading,
      isAuthProcessing, // Novo log para debug
      hasError: !!state.error
    });
  }, [state.user, state.profile, state.isLoading, state.error, userRole, isAuthProcessing]);

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
        hasMinimumRole: hasMinimumRoleForUser,
        isAuthProcessing // Exposição do estado para componentes
      }}
    >
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
