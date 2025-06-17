import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { profileService } from '@/services/profileService';
import { UserProfile, UserRole } from '@/types/auth';
import { showFriendlyError } from '@/utils/errorTranslator';

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const clearError = () => {
    setError(null);
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Update last login timestamp
        await profileService.updateLastLogin(data.user.id);
        toast.success('Login realizado com sucesso!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message || 'Ocorreu um erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: UserRole = 'cliente') => {
    setIsLoading(true);
    setError(null);
    let technicalError: any = null;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            role: role,
            is_active: true,
            is_approved: role === 'cliente' // Auto-approve cliente role
          }
        }
      });

      if (error) {
        technicalError = error;
        throw error;
      }

      if (data.user) {
        // Update last login timestamp
        await profileService.updateLastLogin(data.user.id);

        toast.success('Cadastro realizado com sucesso! Verifique seu email para confirmar.');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      setError(error.message || 'Ocorreu um erro durante o cadastro');
    } finally {
      setIsLoading(false);
      return { technicalError };
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/atualizar-senha`,
      });

      if (error) throw error;

      toast.success('Email de recuperação de senha enviado com sucesso!');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      setError(error.message || 'Ocorreu um erro ao solicitar recuperação de senha');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      setError(error.message || 'Ocorreu um erro ao atualizar senha');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      return await profileService.fetchUserProfile(userId);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate('/login');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      showFriendlyError(error, 'Erro ao sair do sistema. Tente novamente.');
    }
  };

  return {
    signIn,
    signUp,
    logout,
    resetPassword,
    updatePassword,
    getUserProfile,
    isLoading,
    error,
    clearError
  };
};
