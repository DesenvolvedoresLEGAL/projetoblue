
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE, AUTH_ERROR_MESSAGES, AuthErrorCategory } from '@/constants/auth';
import { supabase } from '@/integrations/supabase/client';
import { TechnicalErrorInfo } from './types';

export function useSignIn(
  updateState: (state: any) => void,
  isAuthProcessing: boolean,
  setProcessingWithTimeout: (processing: boolean) => void,
  clearProcessingState: () => void
) {
  const navigate = useNavigate();
  const [technicalError, setTechnicalError] = useState<TechnicalErrorInfo | null>(null);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isAuthProcessing) {
      console.log('Auth operation already in progress. Ignoring duplicate signin request.');
      return;
    }
    
    try {
      setProcessingWithTimeout(true);
      updateState({ isLoading: true, error: null });
      setTechnicalError(null);
      
      if (!email || !password) {
        throw { message: 'Email e senha são obrigatórios', category: AuthErrorCategory.INVALID_EMAIL };
      }
      
      console.log('AuthContext: Iniciando login para:', email);
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
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
          
          if (!userProfile) {
            console.warn('Perfil não encontrado, tentando criar via RPC');
            
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('ensure_user_profile', {
                user_id: data.user.id,
                user_email: data.user.email || email,
                user_role: DEFAULT_USER_ROLE
              });
            
            if (rpcError) {
              console.error('Falha ao criar perfil via RPC:', rpcError);
              userProfile = {
                id: data.user.id,
                email: data.user.email || email,
                role: DEFAULT_USER_ROLE as UserRole,
                created_at: data.user.created_at || new Date().toISOString(),
                last_login: new Date().toISOString(),
                is_active: true,
                is_approved: true
              };
              console.log('Usando perfil mínimo para continuar o login');
            } else {
              const profileRetry = await profileService.fetchUserProfile(data.user.id);
              if (profileRetry) {
                userProfile = profileRetry;
              } else {
                userProfile = {
                  id: data.user.id,
                  email: data.user.email || email,
                  role: DEFAULT_USER_ROLE as UserRole,
                  created_at: data.user.created_at || new Date().toISOString(),
                  last_login: new Date().toISOString(),
                  is_active: true,
                  is_approved: true
                };
              }
            }
          }
          
          if (userProfile.is_active === false) {
            console.log('Perfil inativo, fazendo logout:', userProfile);
            await authService.signOut();
            throw { 
              message: 'Sua conta está desativada. Entre em contato com o administrador.',
              category: AuthErrorCategory.AUTHENTICATION
            };
          }
          
          updateState({ 
            profile: userProfile,
            user: data.user,
            error: null,
            isLoading: false
          });
          
          profileService.updateLastLogin(data.user.id).catch(console.error);
          
          toast.success(`Bem-vindo(a)!`);
          
          const from = window.history.state?.usr?.from?.pathname || '/';
          navigate(from, { replace: true });
          
        } catch (profileError: any) {
          console.error('Erro ao verificar perfil após login:', profileError);
          
          if (profileError?.message?.includes('403') || profileError?.message?.includes('profile')) {
            console.warn('Problema com perfil, mas login foi bem-sucedido. Continuando com dados básicos.');
            
            const basicProfile = {
              id: data.user.id,
              email: data.user.email || email,
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
            
            toast.success(`Bem-vindo(a)! (Perfil carregado parcialmente)`);
            
            const from = window.history.state?.usr?.from?.pathname || '/';
            navigate(from, { replace: true });
            return;
          }
          
          setTechnicalError({
            message: profileError.message || 'Erro ao verificar perfil',
            category: profileError.category || AuthErrorCategory.PROFILE_CREATION,
            timestamp: new Date().toISOString(),
            context: { userId: data.user.id, email: data.user.email }
          });
          
          console.warn('Erro no perfil, mas mantendo usuário logado');
          updateState({ 
            user: data.user,
            profile: null,
            error: 'Problema ao carregar perfil. Algumas funcionalidades podem estar limitadas.',
            isLoading: false
          });
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
      
      const errorCategory = error.category || AuthErrorCategory.UNKNOWN;
      const errorMessage = error.message || AUTH_ERROR_MESSAGES[errorCategory] || 'Erro ao fazer login';
      
      updateState({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    } finally {
      clearProcessingState();
    }
  }, [isAuthProcessing, navigate, updateState, setProcessingWithTimeout, clearProcessingState]);

  return { signIn, technicalError };
}
