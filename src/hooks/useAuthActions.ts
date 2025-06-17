
import { supabase } from '@/integrations/supabase/client';
import { translateAuthError } from '@/utils/errorTranslator';
import { toast } from '@/utils/toast';

export const useAuthActions = () => {
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
    signOut,
    resetPassword
  };
};
