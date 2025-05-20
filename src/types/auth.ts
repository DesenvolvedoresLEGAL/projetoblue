
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'gestor' | 'consultor' | 'cliente' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login?: string;
  is_active: boolean;
  is_approved: boolean;
  bits_referral_code?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
