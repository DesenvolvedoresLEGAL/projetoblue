
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { toastLoginSuccess, toastLogoutSuccess } from '@/utils/roleToastMessages';
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
      
      return { data: { user: null, session: null }, error: { message: 'Operation in progress' } as AuthError, profileCreated: false };
    }
    
    try {
      setIsAuthProcessing(true);
      
      updateState({ isLoading: true, error: null });
      
      setTechnicalError(null);
      
      const validation = authService.validateSignUpData({ email, password, role });
      if (!validation.isValid) {
        
        
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
            
            
            const profileResult = await createProfileManually(data.user.id, email, role || DEFAULT_USER_ROLE);
            if (profileResult.success) {
              
              toast.success("Conta criada com sucesso! Você já pode fazer login.");
            } else {
              
              toast.warning("Conta criada, mas pode haver inconsistências no perfil. Entre em contato com o suporte se encontrar problemas.");
            }
          } else {
            
            toast.success("Conta criada com sucesso! Você já pode fazer login.");
          }
          
          setTimeout(() => {
            navigate('/login');
          }, 1500);
          
          return { data, error: null, profileCreated: true };
        } else {
          
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
    
    
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        if (attempt > 0) {
          const delayMs = Math.pow(2, attempt) * 1000;
          
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
          
          attempt++;
          continue;
        }
        
        if (data) {
          
          return { success: true };
        } else {
          
          attempt++;
          continue;
        }
      } catch (err) {
        
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
        
        try {
          // Incluir perfis soft-deletados para validação
          let userProfile = await profileService.fetchUserProfile(data.user.id, true);
          
          
          if (!userProfile) {
            
            
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
                // bits_referral_code: profileData.bits_referral_code, // Removed - property doesn't exist
                updated_at: profileData.updated_at,
                deleted_at: profileData.deleted_at
              };
            }
          }
          
          // NOVA VALIDAÇÃO: Verificar se usuário foi excluído (soft delete)
          if (userProfile.deleted_at) {
            
            await authService.signOut(); // Forçar logout
            throw { 
              message: 'Esta conta foi desativada. Entre em contato com o administrador para mais informações.',
              category: AuthErrorCategory.AUTHENTICATION
            };
          }
          
          if (userProfile.is_active === false) {
            
            await authService.signOut();
            throw { 
              message: 'Sua conta está desativada. Entre em contato com o administrador para reativá-la.',
              category: AuthErrorCategory.AUTHENTICATION
            };
          }
          
          // NOVA VALIDAÇÃO: Verificar se usuário foi aprovado
          if (userProfile.is_approved === false) {
            
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
              
            });
          
          toastLoginSuccess(userProfile);
          
          const from = window.history.state?.usr?.from?.pathname || '/';
          navigate(from, { replace: true });
          
        } catch (profileError: unknown) {
          
          
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
          
          
          updateState({ 
            user: data.user,
            profile: null,
            error: friendlyMessage,
            isLoading: false
          });
        }
      } else {
        
        const friendlyMessage = showFriendlyError('Falha no login: dados incompletos retornados', 'authentication');
        throw {
          message: friendlyMessage,
          category: AuthErrorCategory.UNKNOWN
        };
      }
      
      } catch (error: unknown) {
      
      
      const errorObj = error as { message?: string; category?: AuthErrorCategory };
      const friendlyMessage = showFriendlyError(error, 'authentication');
      
      updateState({ error: friendlyMessage, isLoading: false });
      toast.error(friendlyMessage);
    } finally {
      setIsAuthProcessing(false);
    }
  }, [isAuthProcessing, navigate, updateState]);

  const signOut = useCallback(async (role?: UserRole) => {
    if (isAuthProcessing) {
      
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
      if (role) {
        toastLogoutSuccess(role);
      } else {
        toast.success('Você saiu do sistema com sucesso');
      }
      navigate('/login');
      } catch (error: unknown) {
      
      const friendlyMessage = showFriendlyError(error, 'authentication');
      toast.error(friendlyMessage);
      updateState({ isLoading: false });
    } finally {
      setIsAuthProcessing(false);
    }
  }, [isAuthProcessing, navigate, updateState]);

  return { signIn, signUp, signOut, technicalError };
}
