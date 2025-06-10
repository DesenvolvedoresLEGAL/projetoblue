
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { authService } from '@/services/authService';
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE, AUTH_ERROR_MESSAGES, AuthErrorCategory } from '@/constants/auth';
import { useManualProfileCreation } from './useManualProfileCreation';
import { TechnicalErrorInfo } from './types';

export function useSignUp(
  updateState: (state: any) => void,
  isAuthProcessing: boolean,
  setProcessingWithTimeout: (processing: boolean) => void,
  clearProcessingState: () => void
) {
  const navigate = useNavigate();
  const [technicalError, setTechnicalError] = useState<TechnicalErrorInfo | null>(null);
  const { createProfileManually } = useManualProfileCreation();

  const signUp = useCallback(async (email: string, password: string, role: UserRole = DEFAULT_USER_ROLE) => {
    if (isAuthProcessing) {
      console.log('Auth operation already in progress. Ignoring duplicate signup request.');
      return { success: false, message: 'Operation in progress' };
    }
    
    try {
      setProcessingWithTimeout(true);
      console.log('AuthContext: Iniciando processo de cadastro');
      updateState({ isLoading: true, error: null });
      
      setTechnicalError(null);
      
      const validation = authService.validateSignUpData({ email, password });
      if (!validation.isValid) {
        console.error('Erro de validação:', validation.error);
        
        const techError = {
          message: validation.error || 'Erro de validação desconhecido',
          category: validation.category || AuthErrorCategory.UNKNOWN,
          timestamp: new Date().toISOString(),
          context: { email, validationResult: validation }
        };
        
        setTechnicalError(techError);
        
        updateState({ error: validation.error, isLoading: false });
        toast.error(validation.error);
        return { success: false, message: validation.error, technicalError: techError };
      }

      console.log('AuthContext: Dados validados, enviando para o serviço de autenticação', { 
        email, 
        roleType: typeof role, 
        role 
      });
      
      if (!['admin', 'gestor', 'consultor', 'suporte', 'cliente', 'user'].includes(role)) {
        console.warn(`Role inválido '${role}' fornecido, usando '${DEFAULT_USER_ROLE}' como padrão`);
        role = DEFAULT_USER_ROLE as UserRole;
      }
      
      try {
        const { data, error, profileCreated } = await authService.signUp(email, password, role);

        if (error) {
          throw error;
        }

        if (data?.user) {
          if (!profileCreated) {
            console.log('Tentando criar perfil manualmente já que o trigger parece ter falhado');
            
            const profileResult = await createProfileManually(data.user.id, email, role);
            if (profileResult.success) {
              console.log('Perfil criado manualmente com sucesso após falha do trigger');
              toast.success("Cadastro realizado com sucesso! Você já pode fazer login.");
            } else {
              console.warn('Falha ao criar perfil manualmente:', profileResult.error);
              toast.warning("Cadastro realizado, mas pode haver inconsistências no perfil. Entre em contato com o suporte se encontrar problemas.");
            }
          } else {
            console.log('Usuário e perfil criados com sucesso:', data.user.id);
            toast.success("Cadastro realizado com sucesso! Você já pode fazer login.");
          }
          
          setTimeout(() => {
            navigate('/login');
          }, 1500);
          
          return { success: true, message: 'Cadastro realizado com sucesso' };
        } else {
          console.error('Usuário não foi criado, dados incompletos:', data);
          const techError = {
            message: 'Falha ao criar usuário: dados incompletos retornados',
            category: AuthErrorCategory.UNKNOWN,
            timestamp: new Date().toISOString(),
            context: { data }
          };
          setTechnicalError(techError);
          throw new Error('Falha ao criar usuário: dados incompletos retornados');
        }
      } catch (serviceError: any) {
        throw serviceError;
      }
    } catch (error: any) {
      console.error('Erro não tratado no processo de cadastro:', error);
      
      const errorCategory = error.category || AuthErrorCategory.UNKNOWN;
      const errorMessage = AUTH_ERROR_MESSAGES[errorCategory] || 'Ocorreu um erro inesperado durante o cadastro.';
      
      const techError = {
        message: error.message || 'Erro desconhecido durante o cadastro',
        category: errorCategory,
        timestamp: new Date().toISOString(),
        context: { email, roleProvided: role, stack: error.stack }
      };
      
      setTechnicalError(techError);
      
      updateState({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { success: false, message: errorMessage, technicalError: techError };
    } finally {
      updateState({ isLoading: false });
      clearProcessingState();
    }
  }, [isAuthProcessing, navigate, updateState, setProcessingWithTimeout, clearProcessingState, createProfileManually]);

  return { signUp, technicalError };
}
