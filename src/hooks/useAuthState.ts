
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
    setState(prevState => ({
      ...prevState,
      ...newState,
    }));
  }, []);

  return {
    state,
    updateState,
  };
};
