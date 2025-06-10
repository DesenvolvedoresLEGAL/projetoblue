
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { useState, useCallback } from 'react';
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE, AUTH_ERROR_MESSAGES, AuthErrorCategory } from '@/constants/auth';
import { supabase } from '@/integrations/supabase/client';

// Tipo para armazenar informações técnicas de erro para diagnóstico
interface TechnicalErrorInfo {
  message: string;
  category?: AuthErrorCategory;
  timestamp: string;
  context?: Record<string, any>;
}

export function useAuthActions(updateState: (state: any) => void) {
  const navigate = useNavigate();
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [technicalError, setTechnicalError] = useState<TechnicalErrorInfo | null>(null);

  const signUp = useCallback(async (email: string, password: string, role: UserRole = DEFAULT_USER_ROLE) => {
    // Prevent duplicate operations
    if (isAuthProcessing) {
      console.log('Auth operation already in progress. Ignoring duplicate request.');
      return { success: false, message: 'Operation in progress' };
    }
    
    try {
      setIsAuthProcessing(true);
      console.log('AuthContext: Iniciando processo de cadastro');
      updateState({ isLoading: true, error: null });
      
      // Limpar erro técnico anterior
      setTechnicalError(null);
      
      const validation = authService.validateSignUpData({ email, password });
      if (!validation.isValid) {
        console.error('Erro de validação:', validation.error);
        
        // Armazenar informações de erro técnico para diagnóstico
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
      
      // Ensure we have a valid role
      if (!['admin', 'gestor', 'consultor', 'cliente', 'user'].includes(role)) {
        console.warn(`Role inválido '${role}' fornecido, usando '${DEFAULT_USER_ROLE}' como padrão`);
        role = DEFAULT_USER_ROLE as UserRole;
      }
      
      const { data, error, profileCreated } = await authService.signUp(email, password, role);

      if (error) {
        console.error('Erro no cadastro de usuário:', error);
        
        // Categorizar e formatar a mensagem de erro
        const errorCategory = error.category || AuthErrorCategory.UNKNOWN;
        const errorMessage = AUTH_ERROR_MESSAGES[errorCategory] || 'Falha ao criar usuário';
        
        // Armazenar informações de erro técnico para diagnóstico
        const techError = {
          message: error.message || 'Erro desconhecido durante o cadastro',
          category: errorCategory,
          timestamp: new Date().toISOString(),
          context: { email, role, originalError: error }
        };
        
        setTechnicalError(techError);
        
        console.error('Erro traduzido:', errorMessage);
        updateState({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return { success: false, message: errorMessage, technicalError: techError };
      }

      if (data?.user) {
        if (!profileCreated) {
          // Exibir aviso não-bloqueante sobre possível problema com o perfil
          toast.warning("Cadastro realizado, mas pode haver inconsistências no perfil. Entre em contato com o suporte se encontrar problemas.");
          console.warn('Cadastro concluído, mas não foi possível confirmar a criação do perfil');
        } else {
          console.log('Usuário e perfil criados com sucesso:', data.user.id);
          toast.success("Cadastro realizado com sucesso! Você já pode fazer login.");
        }
        
        // Short delay before redirect to ensure the user sees the success message
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
    } catch (error: any) {
      console.error('Erro não tratado no processo de cadastro:', error);
      
      // Categorizar e formatar a mensagem de erro
      const errorCategory = error.category || AuthErrorCategory.UNKNOWN;
      const errorMessage = AUTH_ERROR_MESSAGES[errorCategory] || 'Ocorreu um erro inesperado durante o cadastro.';
      
      // Armazenar informações de erro técnico para diagnóstico
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
      setIsAuthProcessing(false);
    }
  }, [isAuthProcessing, navigate, updateState]);

  const signIn = useCallback(async (email: string, password: string) => {
    // Prevent duplicate operations
    if (isAuthProcessing) {
      console.log('Auth operation already in progress. Ignoring duplicate request.');
      return;
    }
    
    try {
      setIsAuthProcessing(true);
      updateState({ isLoading: true, error: null });
      setTechnicalError(null);
      
      if (!email || !password) {
        throw { message: 'Email e senha são obrigatórios', category: AuthErrorCategory.INVALID_EMAIL };
      }
      
      console.log('AuthContext: Iniciando login para:', email);
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        // Categorizar o erro
        const errorCategory = error.category || AuthErrorCategory.UNKNOWN;
        const errorMessage = AUTH_ERROR_MESSAGES[errorCategory] || 'Erro ao fazer login';
        
        setTechnicalError({
          message: error.message || 'Erro desconhecido durante login',
          category: errorCategory,
          timestamp: new Date().toISOString()
        });
        
        throw { ...error, message: errorMessage, category: errorCategory };
      }

      if (data.user) {
        console.log('Login bem-sucedido para:', email);
        try {
          let userProfile = await profileService.fetchUserProfile(data.user.id);
          console.log('Perfil obtido após login:', userProfile);
          
          // Verificando apenas se o perfil está ativo
          if (!userProfile) {
            console.error('Perfil não encontrado para usuário:', data.user.id);
            
            // Tentar criar o perfil manualmente
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('ensure_user_profile', {
                user_id: data.user.id,
                user_email: data.user.email || email,
                user_role: DEFAULT_USER_ROLE
              });
            
            if (rpcError) {
              console.error('Falha ao criar perfil manualmente:', rpcError);
              await authService.signOut();
              throw { 
                message: 'Não foi possível criar seu perfil. Entre em contato com o suporte.', 
                category: AuthErrorCategory.PROFILE_CREATION 
              };
            } else {
              // Tentar obter o perfil novamente
              const profileRetry = await profileService.fetchUserProfile(data.user.id);
              if (!profileRetry) {
                console.error('Perfil ainda não encontrado após criação manual');
                await authService.signOut();
                throw { 
                  message: 'Erro na configuração do perfil. Entre em contato com o suporte.', 
                  category: AuthErrorCategory.PROFILE_CREATION 
                };
              }
              
              userProfile = profileRetry;
            }
          }
          
          if (!userProfile.is_active) {
            console.log('Perfil inativo, fazendo logout:', userProfile);
            await authService.signOut();
            throw { 
              message: 'Sua conta está desativada. Entre em contato com o administrador.',
              category: AuthErrorCategory.AUTHENTICATION
            };
          }
          
          // Atualiza o estado com os dados do perfil
          updateState({ 
            profile: userProfile,
            user: data.user,
            error: null,
            isLoading: false
          });
          
          // Atualizar o last_login do usuário (operação não crítica)
          profileService.updateLastLogin(data.user.id).catch(console.error);
          
          toast.success(`Bem-vindo(a)!`);
          
          // Use state from location if available
          const from = window.history.state?.usr?.from?.pathname || '/';
          navigate(from, { replace: true });
          
        } catch (profileError) {
          console.error('Erro ao verificar perfil após login:', profileError);
          
          setTechnicalError({
            message: profileError.message || 'Erro ao verificar perfil',
            category: profileError.category || AuthErrorCategory.PROFILE_CREATION,
            timestamp: new Date().toISOString(),
            context: { userId: data.user.id, email: data.user.email }
          });
          
          await authService.signOut();
          throw profileError;
        }
      } else {
        console.error('Login falhou, dados incompletos:', data);
        throw {
          message: 'Falha no login: dados incompletos retornados',
          category: AuthErrorCategory.UNKNOWN
        };
      }
      
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      
      // Formatar mensagem de erro amigável
      const errorCategory = error.category || AuthErrorCategory.UNKNOWN;
      const errorMessage = error.message || AUTH_ERROR_MESSAGES[errorCategory] || 'Erro ao fazer login';
      
      updateState({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    } finally {
      if (isAuthProcessing) {
        setIsAuthProcessing(false);
      }
    }
  }, [isAuthProcessing, navigate, updateState]);

  const signOut = useCallback(async () => {
    // Prevent duplicate operations
    if (isAuthProcessing) {
      console.log('Auth operation already in progress. Ignoring duplicate request.');
      return;
    }
    
    try {
      setIsAuthProcessing(true);
      updateState({ isLoading: true });
      await authService.signOut();
      
      // Limpa o estado de autenticação
      updateState({
        user: null,
        profile: null,
        error: null,
        isLoading: false
      });
      
      toast.success('Você saiu do sistema com sucesso');
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast.error(error.message || 'Ocorreu um erro ao tentar sair.');
      updateState({ isLoading: false });
    } finally {
      setIsAuthProcessing(false);
    }
  }, [isAuthProcessing, navigate, updateState]);

  return { signIn, signUp, signOut, technicalError };
}
