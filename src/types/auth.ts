
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'suporte' | 'cliente' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  username: string; // Adicionado campo username obrigatório
  role: UserRole;
  created_at: string;
  last_login?: string;
  is_active: boolean;
  is_approved: boolean;
  bits_referral_code?: string; // Adicionado campo bits_referral_code
  updated_at?: string;
  deleted_at?: string; // Adicionado para soft delete
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
