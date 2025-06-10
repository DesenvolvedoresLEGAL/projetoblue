
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { authService } from '@/services/authService';

export function useSignOut(
  updateState: (state: any) => void,
  isAuthProcessing: boolean,
  setProcessingWithTimeout: (processing: boolean) => void,
  clearProcessingState: () => void
) {
  const navigate = useNavigate();

  const signOut = useCallback(async () => {
    if (isAuthProcessing) {
      console.warn('Forçando logout mesmo com operação em progresso...');
      clearProcessingState();
    }
    
    try {
      setProcessingWithTimeout(true);
      console.log('Iniciando processo de logout...');
      updateState({ isLoading: true });
      
      await authService.signOut();
      
      updateState({
        user: null,
        profile: null,
        error: null,
        isLoading: false
      });
      
      console.log('Logout realizado com sucesso');
      toast.success('Você saiu do sistema com sucesso');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      
      updateState({
        user: null,
        profile: null,
        error: null,
        isLoading: false
      });
      
      toast.error('Ocorreu um erro ao tentar sair, mas você foi desconectado.');
      navigate('/login');
    } finally {
      clearProcessingState();
    }
  }, [navigate, updateState, setProcessingWithTimeout, clearProcessingState, isAuthProcessing]);

  return { signOut };
}
