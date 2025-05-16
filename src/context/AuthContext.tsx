
import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActions } from '@/hooks/useAuthActions';
import { AuthContextType } from '@/types/authContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, updateState } = useAuthState();
  const { signIn, signUp, signOut } = useAuthActions(updateState);
  
  // Initialize auth session on first render
  useAuthSession(updateState);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        // isAuthenticated should depend only on user, not on profile
        isAuthenticated: !!state.user,
        // Optional: maintain compatibility with existing code that might check for profile
        hasProfile: !!state.profile
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
