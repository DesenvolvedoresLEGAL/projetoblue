
import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile, AuthState } from '@/types/auth';

export const useAuthState = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const updateState = useCallback((newState: Partial<AuthState>) => {
    try {
      setState(prevState => ({
        ...prevState,
        ...newState,
      }));
    } catch (error) {
      console.error('Error updating auth state:', error);
      // Fallback to safe state
      setState({
        user: null,
        profile: null,
        isLoading: false,
        error: 'Erro ao atualizar estado de autenticação',
      });
    }
  }, []);

  return {
    state,
    updateState,
  };
};
