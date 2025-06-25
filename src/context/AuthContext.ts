import { createContext, useContext } from 'react';
import type { AuthContextType } from '@/types/authContext';

// Create Auth context with undefined as default for safer initialization
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to easily access AuthContext while ensuring proper provider usage.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
