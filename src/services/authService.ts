import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/utils/toast';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: string;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      return null;
    }

    // Get user profile data
    const profile = await getUserProfile(data.user);
    return {
      id: data.user.id,
      email: data.user.email || '',
      name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
      role: profile?.role || 'user',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data } = await supabase.auth.getUser();
    
    if (!data.user) {
      return null;
    }

    // Get user profile data
    const profile = await getUserProfile(data.user);
    return {
      id: data.user.id,
      email: data.user.email || '',
      name: profile?.full_name || '',
      avatar_url: profile?.avatar_url || '',
      role: profile?.role || 'user',
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: { 
  full_name?: string;
  avatar_url?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

async function getUserProfile(user: User): Promise<any | null> {
  try {
    // Get profile from profiles table
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return null;
    }
    
    // If profile exists, return it
    if (existingProfile) {
      return existingProfile;
    }
    
    // If no profile exists, create one
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          full_name: '',
          avatar_url: '',
          role: 'user',
        },
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return null;
    }
    
    return newProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function resetPassword(email: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Error resetting password:', error);
      toast.error('Erro ao enviar email de recuperação de senha');
      return false;
    }
    
    toast.success('Email de recuperação de senha enviado com sucesso');
    return true;
  } catch (error) {
    console.error('Error in resetPassword:', error);
    toast.error('Erro ao processar solicitação de recuperação de senha');
    return false;
  }
}

export async function updatePassword(newPassword: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      console.error('Error updating password:', error);
      toast.error('Erro ao atualizar senha');
      return false;
    }
    
    toast.success('Senha atualizada com sucesso');
    return true;
  } catch (error) {
    console.error('Error in updatePassword:', error);
    toast.error('Erro ao processar atualização de senha');
    return false;
  }
}
