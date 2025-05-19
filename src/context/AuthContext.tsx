
import React, { createContext, useContext } from 'react';
import { AuthContextType } from '@/types/authContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActions } from '@/hooks/useAuthActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, updateState } = useAuthState();
  const { signIn, signUp, signOut } = useAuthActions(updateState);
  
  // Set up auth session check and subscription
  useAuthSession(updateState);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!state.user && !!state.profile,
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
