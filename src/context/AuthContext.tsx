
import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActions } from '@/hooks/useAuthActions';
import { AuthContextType } from '@/types/authContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { state, updateState } = useAuthState();
  const { signIn, signUp, signOut } = useAuthActions(updateState);
  
  // Set up session handling
  useAuthSession(updateState);
  
  // Map the state and actions to the context value
  const value: AuthContextType = {
    user: state.user,
    profile: state.profile,
    isLoading: state.isLoading,
    error: state.error,
    login: signIn,
    signIn, // Alias for backward compatibility
    signUp,
    logout: signOut,
    signOut, // Alias for backward compatibility
    isAuthenticated: !!state.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
