
import { supabase } from '@/integrations/supabase/client';
import { translateAuthError } from '@/utils/errorTranslator';
import { toast } from '@/utils/toast';
import { useState } from 'react';
import { TechnicalErrorInfo } from '@/types/authContext';
import { UserRole } from '@/types/auth';

export const useAuthActions = (updateState?: (updates: any) => void) => {
  const [technicalError, setTechnicalError] = useState<TechnicalErrorInfo | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Erro ao fazer login:', error);
        toast.error(translateAuthError(error));
        setTechnicalError({
          message: error.message,
          timestamp: new Date().toISOString(),
          context: { action: 'signIn' }
        });
        throw error;
      }
      
      setTechnicalError(null);
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast.error(translateAuthError(error));
      setTechnicalError({
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        context: { action: 'signIn' }
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role?: UserRole) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            role: role || 'cliente'
          }
        }
      });

      if (error) {
        console.error('Erro ao fazer cadastro:', error);
        toast.error(translateAuthError(error));
        setTechnicalError({
          message: error.message,
          timestamp: new Date().toISOString(),
          context: { action: 'signUp' }
        });
        throw error;
      }

      setTechnicalError(null);
      return data;
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      toast.error(translateAuthError(error));
      setTechnicalError({
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        context: { action: 'signUp' }
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        toast.error(translateAuthError(error));
        return;
      }
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      toast.error(translateAuthError(error));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        console.error('Erro ao solicitar reset de senha:', error);
        toast.error(translateAuthError(error));
        return false;
      }
      toast.success('Email de recuperação enviado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro inesperado no reset de senha:', error);
      toast.error(translateAuthError(error));
      return false;
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    technicalError
  };
};
