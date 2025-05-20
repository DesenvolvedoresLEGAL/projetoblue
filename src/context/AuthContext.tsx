
import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType } from '@/types/authContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActions } from '@/hooks/useAuthActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, updateState } = useAuthState();
  const { signIn, signUp, signOut, technicalError } = useAuthActions(updateState);
  
  // Set up auth session check and subscription
  useAuthSession(updateState);
  
  // Log auth state changes to help with debugging
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated: !!state.user && !!state.profile,
      hasUser: !!state.user,
      hasProfile: !!state.profile,
      isLoading: state.isLoading,
      hasError: !!state.error
    });
  }, [state.user, state.profile, state.isLoading, state.error]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!state.user && !!state.profile,
        technicalError
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
