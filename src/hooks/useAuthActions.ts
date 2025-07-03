
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { useState, useCallback } from 'react';
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE, AUTH_ERROR_MESSAGES, AuthErrorCategory } from '@/constants/auth';
import { toUserRole } from '@/utils/roleUtils';
import { supabase } from '@/integrations/supabase/client';
import { showFriendlyError } from '@/utils/errorTranslator';
import { AuthResponse, AuthError } from '@supabase/supabase-js';

// Tipo para armazenar informações técnicas de erro para diagnóstico
interface TechnicalErrorInfo {
  message: string;
  category?: AuthErrorCategory;
  timestamp: string;
  context?: Record<string, unknown>;
}

import type { AuthState } from '@/types/auth';

export function useAuthActions(updateState: (state: Partial<AuthState>) => void) {
  const navigate = useNavigate();
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const [technicalError, setTechnicalError] = useState<TechnicalErrorInfo | null>(null);

  const signUp = useCallback(async (email: string, password: string, role?: UserRole): Promise<{ data: AuthResponse['data']; error: AuthError | null; profileCreated: boolean }> => {
    // Prevent duplicate operations
    if (isAuthProcessing) {
      if (import.meta.env.DEV) console.log('Auth operation already in progress. Ignoring duplicate request.');
      return { data: { user: null, session: null }, error: { message: 'Operation in progress' } as AuthError, profileCreated: false };
    }
    
    try {
      setIsAuthProcessing(true);
      if (import.meta.env.DEV) console.log('AuthContext: Iniciando processo de cadastro');
      updateState({ isLoading: true, error: null });
      
      setTechnicalError(null);
      
      const validation = authService.validateSignUpData({ email, password, role });
      if (!validation.isValid) {
        if (import.meta.env.DEV) console.error('Erro de validação:', validation.error);
        
        const friendlyMessage = showFriendlyError(validation.error, 'validation');
        
        const techError = {
          message: validation.error || 'Erro de validação desconhecido',
          category: validation.category || AuthErrorCategory.UNKNOWN,
          timestamp: new Date().toISOString(),
          context: { email, role, validationResult: validation }
        };
        
        setTechnicalError(techError);
        
        updateState({ error: friendlyMessage, isLoading: false });
        toast.error(friendlyMessage);
        return { data: { user: null, session: null }, error: { message: friendlyMessage } as AuthError, profileCreated: false };
      }

      if (import.meta.env.DEV) console.log('AuthContext: Dados validados, enviando para o serviço de autenticação', { 
        email, 
        role
      });
      
      const { data, error, profileCreated } = await authService.signUp(email, password, role || DEFAULT_USER_ROLE);

        if (error) {
          throw error;
        }

        if (data?.user) {
          if (!profileCreated) {
            if (import.meta.env.DEV) console.log('Tentando criar perfil manualmente já que o trigger parece ter falhado');
            
            const profileResult = await createProfileManually(data.user.id, email, role || DEFAULT_USER_ROLE);
            if (profileResult.success) {
              if (import.meta.env.DEV) console.log('Perfil criado manualmente com sucesso após falha do trigger');
              toast.success("Conta criada com sucesso! Você já pode fazer login.");
            } else {
              if (import.meta.env.DEV) console.warn('Falha ao criar perfil manualmente:', profileResult.error);
              toast.warning("Conta criada, mas pode haver inconsistências no perfil. Entre em contato com o suporte se encontrar problemas.");
            }
          } else {
            if (import.meta.env.DEV) console.log('Usuário e perfil criados com sucesso:', data.user.id);
            toast.success("Conta criada com sucesso! Você já pode fazer login.");
          }
          
          setTimeout(() => {
            navigate('/login');
          }, 1500);
          
          return { data, error: null, profileCreated: true };
        } else {
          if (import.meta.env.DEV) console.error('Usuário não foi criado, dados incompletos:', data);
          const friendlyMessage = showFriendlyError('Falha ao criar usuário: dados incompletos retornados', 'create');
          const techError = {
            message: 'Falha ao criar usuário: dados incompletos retornados',
            category: AuthErrorCategory.UNKNOWN,
            timestamp: new Date().toISOString(),
            context: { data }
          };
          setTechnicalError(techError);
          throw new Error(friendlyMessage);
        }
      } catch (error: unknown) {
        if (import.meta.env.DEV) console.error('Erro não tratado no processo de cadastro:', error);
      
      const errorObj = error as { message?: string; category?: AuthErrorCategory; stack?: string };
      const friendlyMessage = showFriendlyError(error, 'create');
      const errorCategory = errorObj.category || AuthErrorCategory.UNKNOWN;
      
      const techError = {
        message: errorObj.message || 'Erro desconhecido durante o cadastro',
        category: errorCategory,
        timestamp: new Date().toISOString(),
        context: { email, role, stack: errorObj.stack }
      };
      
      setTechnicalError(techError);
      
      updateState({ error: friendlyMessage, isLoading: false });
      toast.error(friendlyMessage);
      return { data: { user: null, session: null }, error: { message: friendlyMessage } as AuthError, profileCreated: false };
    } finally {
      updateState({ isLoading: false });
      setIsAuthProcessing(false);
    }
  }, [isAuthProcessing, navigate, updateState]);

  // NOVA FUNÇÃO: Cria perfil manualmente com retry logic
  const createProfileManually = async (userId: string, userEmail: string, userRole: UserRole): Promise<{success: boolean, error?: string}> => {
    if (import.meta.env.DEV) console.log('Tentando criar perfil manualmente para:', {userId, userEmail, userRole});
    
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        if (attempt > 0) {
          const delayMs = Math.pow(2, attempt) * 1000;
          if (import.meta.env.DEV) console.log(`Tentativa ${attempt+1}/${maxRetries} após delay de ${delayMs}ms`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        // Inserir diretamente na tabela profiles
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            role: userRole,
            username: `user_${userId.substring(0, 8)}`,
            is_active: true,
            is_approved: true
          })
          .select()
          .single();
        
        if (error) {
          if (import.meta.env.DEV) console.error(`Tentativa ${attempt+1} falhou:`, error);
          attempt++;
          continue;
        }
        
        if (data) {
          if (import.meta.env.DEV) console.log('Perfil criado manualmente:', data);
          return { success: true };
        } else {
          if (import.meta.env.DEV) console.warn(`Perfil não encontrado após criação manual na tentativa ${attempt+1}`);
          attempt++;
          continue;
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error(`Erro na tentativa ${attempt+1} de criar perfil:`, err);
        attempt++;
      }
    }
    
    return { 
      success: false, 
      error: `Falha ao criar perfil após ${maxRetries} tentativas` 
    };
  };

  const signIn = useCallback(async (email: string, password: string) => {
    if (isAuthProcessing) {
      if (import.meta.env.DEV) console.log('Auth operation already in progress. Ignoring duplicate request.');
      return;
    }
    
    try {
      setIsAuthProcessing(true);
      updateState({ isLoading: true, error: null });
      setTechnicalError(null);
      
      if (!email || !password) {
        const friendlyMessage = "Por favor, preencha seu email e senha para continuar.";
        throw { message: friendlyMessage, category: AuthErrorCategory.INVALID_EMAIL };
      }
      
      if (import.meta.env.DEV) console.log('AuthContext: Iniciando login para:', email);
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        const friendlyMessage = showFriendlyError(error, 'authentication');
        const errorCategory = error.category || AuthErrorCategory.UNKNOWN;
        
        setTechnicalError({
          message: error.message || 'Erro desconhecido durante login',
          category: errorCategory,
          timestamp: new Date().toISOString()
        });
        
        throw { ...error, message: friendlyMessage, category: errorCategory };
      }

      if (data.user) {
        if (import.meta.env.DEV) console.log('Login bem-sucedido para:', email);
        try {
          // Incluir perfis soft-deletados para validação
          let userProfile = await profileService.fetchUserProfile(data.user.id, true);
          if (import.meta.env.DEV) console.log('Perfil obtido após login:', userProfile);
          
          if (!userProfile) {
            if (import.meta.env.DEV) console.warn('Perfil não encontrado, tentando criar perfil básico');
            
            // Criar perfil básico diretamente
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email || email,
                role: DEFAULT_USER_ROLE,
                username: `user_${data.user.id.substring(0, 8)}`,
                is_active: true,
                is_approved: true
              })
              .select()
              .single();
            
            if (profileError) {
              if (import.meta.env.DEV) console.error('Falha ao criar perfil básico:', profileError);
              userProfile = {
                id: data.user.id,
                email: data.user.email || email,
                username: `user_${data.user.id.substring(0, 8)}`,
                role: DEFAULT_USER_ROLE as UserRole,
                created_at: data.user.created_at || new Date().toISOString(),
                last_login: new Date().toISOString(),
                is_active: true,
                is_approved: true
              };
              if (import.meta.env.DEV) console.log('Usando perfil mínimo para continuar o login');
            } else {
              userProfile = {
                id: profileData.id,
                email: profileData.email,
                username: profileData.username,
                role: profileData.role as UserRole,
                created_at: profileData.created_at,
                last_login: new Date().toISOString(),
                is_active: profileData.is_active,
                is_approved: profileData.is_approved,
                bits_referral_code: profileData.bits_referral_code,
                updated_at: profileData.updated_at,
                deleted_at: profileData.deleted_at
              };
            }
          }
          
          // NOVA VALIDAÇÃO: Verificar se usuário foi excluído (soft delete)
          if (userProfile.deleted_at) {
            if (import.meta.env.DEV) console.log('Tentativa de login com perfil excluído:', userProfile);
            await authService.signOut(); // Forçar logout
            throw { 
              message: 'Esta conta foi desativada. Entre em contato com o administrador para mais informações.',
              category: AuthErrorCategory.AUTHENTICATION
            };
          }
          
          if (userProfile.is_active === false) {
            if (import.meta.env.DEV) console.log('Perfil inativo, fazendo logout:', userProfile);
            await authService.signOut();
            throw { 
              message: 'Sua conta está desativada. Entre em contato com o administrador para reativá-la.',
              category: AuthErrorCategory.AUTHENTICATION
            };
          }
          
          // NOVA VALIDAÇÃO: Verificar se usuário foi aprovado
          if (userProfile.is_approved === false) {
            if (import.meta.env.DEV) console.log('Perfil não aprovado, fazendo logout:', userProfile);
            await authService.signOut();
            throw { 
              message: 'Sua conta ainda não foi aprovada. Entre em contato com o administrador.',
              category: AuthErrorCategory.AUTHENTICATION
            };
          }
          
          updateState({ 
            profile: userProfile,
            user: data.user,
            error: null,
            isLoading: false
          });
          
          profileService
            .updateLastLogin(data.user.id)
            .catch(err => {
              if (import.meta.env.DEV) console.error(err);
            });
          
          toast.success(`Bem-vindo(a), ${userProfile.username}!`);
          
          const from = window.history.state?.usr?.from?.pathname || '/';
          navigate(from, { replace: true });
          
        } catch (profileError: unknown) {
          if (import.meta.env.DEV) console.error('Erro ao verificar perfil após login:', profileError);
          
          const errorObj = profileError as { message?: string; category?: AuthErrorCategory };
          
          // Se o erro é relacionado a conta excluída/inativa, não permitir login
          if (errorObj.message?.includes('desativada') || 
              errorObj.message?.includes('excluída') || 
              errorObj.message?.includes('aprovada')) {
            updateState({ error: errorObj.message, isLoading: false });
            toast.error(errorObj.message);
            return;
          }
          
          if (errorObj.message?.includes('403') || errorObj.message?.includes('profile')) {
            if (import.meta.env.DEV) console.warn('Problema com perfil, mas login foi bem-sucedido. Continuando com dados básicos.');
            
            const basicProfile = {
              id: data.user.id,
              email: data.user.email || email,
              username: `user_${data.user.id.substring(0, 8)}`,
              role: DEFAULT_USER_ROLE as UserRole,
              created_at: data.user.created_at || new Date().toISOString(),
              last_login: new Date().toISOString(),
              is_active: true,
              is_approved: true
            };
            
            updateState({ 
              profile: basicProfile,
              user: data.user,
              error: null,
              isLoading: false
            });
            
            toast.success(`Bem-vindo(a)! Algumas funcionalidades podem estar limitadas.`);
            
            const from = window.history.state?.usr?.from?.pathname || '/';
            navigate(from, { replace: true });
            return;
          }
          
          const friendlyMessage = showFriendlyError(profileError, 'authentication');
          
          setTechnicalError({
            message: errorObj.message || 'Erro ao verificar perfil',
            category: errorObj.category || AuthErrorCategory.PROFILE_CREATION,
            timestamp: new Date().toISOString(),
            context: { userId: data.user.id, email: data.user.email }
          });
          
          if (import.meta.env.DEV) console.warn('Erro no perfil, mas mantendo usuário logado');
          updateState({ 
            user: data.user,
            profile: null,
            error: friendlyMessage,
            isLoading: false
          });
        }
      } else {
        if (import.meta.env.DEV) console.error('Login falhou, dados incompletos:', data);
        const friendlyMessage = showFriendlyError('Falha no login: dados incompletos retornados', 'authentication');
        throw {
          message: friendlyMessage,
          category: AuthErrorCategory.UNKNOWN
        };
      }
      
      } catch (error: unknown) {
      if (import.meta.env.DEV) console.error('Erro durante o login:', error);
      
      const errorObj = error as { message?: string; category?: AuthErrorCategory };
      const friendlyMessage = showFriendlyError(error, 'authentication');
      
      updateState({ error: friendlyMessage, isLoading: false });
      toast.error(friendlyMessage);
    } finally {
      setIsAuthProcessing(false);
    }
  }, [isAuthProcessing, navigate, updateState]);

  const signOut = useCallback(async () => {
    if (isAuthProcessing) {
      if (import.meta.env.DEV) console.log('Auth operation already in progress. Ignoring duplicate request.');
      return;
    }
    
    try {
      setIsAuthProcessing(true);
      updateState({ isLoading: true });
      await authService.signOut();
      
      updateState({
        user: null,
        profile: null,
        error: null,
        isLoading: false
      });
      
      toast.success('Você saiu do sistema com sucesso');
      navigate('/login');
      } catch (error: unknown) {
      if (import.meta.env.DEV) console.error('Erro ao fazer logout:', error);
      const friendlyMessage = showFriendlyError(error, 'authentication');
      toast.error(friendlyMessage);
      updateState({ isLoading: false });
    } finally {
      setIsAuthProcessing(false);
    }
  }, [isAuthProcessing, navigate, updateState]);

  return { signIn, signUp, signOut, technicalError };
}
