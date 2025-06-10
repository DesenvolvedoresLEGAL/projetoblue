
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { useState, useCallback, useRef } from 'react';
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
  
  // Refs para controlar operações em andamento e permitir cancelamento
  const authOperationRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função utilitária para timeout de operações
  const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error(`Timeout: ${operation} demorou mais que ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  };

  // Função para limpar recursos e resetar estado
  const cleanupAuthOperation = useCallback(() => {
    console.log('🧹 Limpando recursos de autenticação');
    
    if (authOperationRef.current) {
      authOperationRef.current.abort();
      authOperationRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsAuthProcessing(false);
    console.log('✅ Estado isAuthProcessing resetado para false');
  }, []);

  const signUp = useCallback(async (email: string, password: string, role: UserRole = DEFAULT_USER_ROLE) => {
    // Verificação preventiva contra operações paralelas
    if (isAuthProcessing) {
      console.warn('⚠️ Tentativa de signup bloqueada - operação já em andamento');
      return { success: false, message: 'Operação já em andamento. Aguarde...' };
    }
    
    console.log('🚀 Iniciando processo de cadastro');
    setIsAuthProcessing(true);
    authOperationRef.current = new AbortController();
    
    try {
      updateState({ isLoading: true, error: null });
      setTechnicalError(null);
      
      const validation = authService.validateSignUpData({ email, password });
      if (!validation.isValid) {
        console.error('❌ Erro de validação:', validation.error);
        
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

      console.log('✅ Dados validados, enviando para o serviço de autenticação');
      
      // Ensure we have a valid role - fix the role type issue
      if (!['admin', 'suporte', 'cliente', 'usuario'].includes(role)) {
        console.warn(`⚠️ Role inválido '${role}' fornecido, usando '${DEFAULT_USER_ROLE}' como padrão`);
        role = DEFAULT_USER_ROLE as UserRole;
      }
      
      // Aplicar timeout na operação de signup
      const signupPromise = authService.signUp(email, password, role);
      const result = await withTimeout(
        signupPromise, 
        15000, 
        'cadastro de usuário'
      );

      if (result.error) {
        throw result.error;
      }

      if (result.data?.user) {
        if (!result.profileCreated) {
          console.log('🔄 Tentando criar perfil manualmente após falha do trigger');
          
          const profileResult = await createProfileManually(result.data.user.id, email, role);
          if (profileResult.success) {
            console.log('✅ Perfil criado manualmente com sucesso');
            toast.success("Cadastro realizado com sucesso! Você já pode fazer login.");
          } else {
            console.warn('⚠️ Falha ao criar perfil manualmente:', profileResult.error);
            toast.warning("Cadastro realizado, mas pode haver inconsistências no perfil. Entre em contato com o suporte se encontrar problemas.");
          }
        } else {
          console.log('✅ Usuário e perfil criados com sucesso');
          toast.success("Cadastro realizado com sucesso! Você já pode fazer login.");
        }
        
        // Delay before redirect to ensure the user sees the success message
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        
        return { success: true, message: 'Cadastro realizado com sucesso' };
      } else {
        console.error('❌ Usuário não foi criado, dados incompletos:', result.data);
        const techError = {
          message: 'Falha ao criar usuário: dados incompletos retornados',
          category: AuthErrorCategory.UNKNOWN,
          timestamp: new Date().toISOString(),
          context: { data: result.data }
        };
        setTechnicalError(techError);
        throw new Error('Falha ao criar usuário: dados incompletos retornados');
      }
    } catch (error: any) {
      console.error('❌ Erro durante o cadastro:', error);
      
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
      console.log('🧹 Finalizando operação de cadastro');
      updateState({ isLoading: false });
      cleanupAuthOperation();
    }
  }, [isAuthProcessing, navigate, updateState, cleanupAuthOperation]);

  // NOVA FUNÇÃO: Cria perfil manualmente com retry logic e timeout
  const createProfileManually = async (userId: string, userEmail: string, userRole: UserRole): Promise<{success: boolean, error?: string}> => {
    console.log('🔧 Tentando criar perfil manualmente para:', {userId, userEmail, userRole});
    
    const maxRetries = 2; // Reduzido para evitar loops longos
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        // Delay exponencial entre tentativas
        if (attempt > 0) {
          const delayMs = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Tentativa ${attempt+1}/${maxRetries} após delay de ${delayMs}ms`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        // Usar RPC com timeout
        const rpcPromise = supabase.rpc('ensure_user_profile', {
          user_id: userId,
          user_email: userEmail,
          user_role: userRole
        });
        
        const { data, error } = await withTimeout(rpcPromise, 5000, 'criação de perfil');
        
        if (error) {
          console.error(`❌ Tentativa ${attempt+1} falhou:`, error);
          attempt++;
          continue;
        }
        
        // Verificar se o perfil foi realmente criado
        const profileCheckPromise = profileService.fetchUserProfile(userId);
        const profileCheck = await withTimeout(profileCheckPromise, 3000, 'verificação de perfil');
        
        if (profileCheck) {
          console.log('✅ Perfil verificado após criação manual:', profileCheck);
          return { success: true };
        } else {
          console.warn(`⚠️ Perfil não encontrado após criação manual na tentativa ${attempt+1}`);
          attempt++;
          continue;
        }
      } catch (err: any) {
        console.error(`❌ Erro na tentativa ${attempt+1} de criar perfil:`, err);
        if (err.message?.includes('Timeout')) {
          console.error('⏰ Timeout na criação de perfil');
        }
        attempt++;
      }
    }
    
    return { 
      success: false, 
      error: `Falha ao criar perfil após ${maxRetries} tentativas` 
    };
  };

  const signIn = useCallback(async (email: string, password: string) => {
    // Verificação preventiva contra operações paralelas
    if (isAuthProcessing) {
      console.warn('⚠️ Tentativa de login bloqueada - operação já em andamento');
      return;
    }
    
    console.log('🚀 Iniciando processo de login');
    setIsAuthProcessing(true);
    authOperationRef.current = new AbortController();
    
    try {
      updateState({ isLoading: true, error: null });
      setTechnicalError(null);
      
      if (!email || !password) {
        throw { message: 'Email e senha são obrigatórios', category: AuthErrorCategory.INVALID_EMAIL };
      }
      
      console.log('🔑 Tentando autenticar usuário:', email);
      
      // Aplicar timeout na operação de login
      const loginPromise = authService.signIn(email, password);
      const result = await withTimeout(loginPromise, 10000, 'login de usuário');
      
      if (result.error) {
        // Categorizar o erro
        const errorCategory = result.error.category || AuthErrorCategory.UNKNOWN;
        const errorMessage = AUTH_ERROR_MESSAGES[errorCategory] || 'Erro ao fazer login';
        
        setTechnicalError({
          message: result.error.message || 'Erro desconhecido durante login',
          category: errorCategory,
          timestamp: new Date().toISOString()
        });
        
        throw { ...result.error, message: errorMessage, category: errorCategory };
      }

      if (result.data.user) {
        console.log('✅ Login autenticado para:', email);
        
        try {
          // Buscar perfil com timeout
          const profilePromise = profileService.fetchUserProfile(result.data.user.id);
          let userProfile = await withTimeout(profilePromise, 8000, 'busca de perfil');
          
          console.log('📋 Perfil obtido após login:', userProfile);
          
          // MELHORADO: Se não conseguir obter o perfil, não bloquear o login
          if (!userProfile) {
            console.warn('⚠️ Perfil não encontrado, tentando criar via RPC');
            
            try {
              const rpcPromise = supabase.rpc('ensure_user_profile', {
                user_id: result.data.user.id,
                user_email: result.data.user.email || email,
                user_role: DEFAULT_USER_ROLE
              });
              
              const { data: rpcData, error: rpcError } = await withTimeout(rpcPromise, 5000, 'criação de perfil via RPC');
              
              if (rpcError) {
                console.error('❌ Falha ao criar perfil via RPC:', rpcError);
              } else {
                // Tentar obter o perfil novamente
                const retryProfilePromise = profileService.fetchUserProfile(result.data.user.id);
                const profileRetry = await withTimeout(retryProfilePromise, 3000, 'retry busca de perfil');
                
                if (profileRetry) {
                  userProfile = profileRetry;
                }
              }
            } catch (rpcError) {
              console.error('❌ Erro ao tentar criar perfil via RPC:', rpcError);
            }
            
            // Usar perfil mínimo se ainda não conseguiu
            if (!userProfile) {
              userProfile = {
                id: result.data.user.id,
                email: result.data.user.email || email,
                role: DEFAULT_USER_ROLE as UserRole,
                created_at: result.data.user.created_at || new Date().toISOString(),
                last_login: new Date().toISOString(),
                is_active: true,
                is_approved: true
              };
              console.log('📝 Usando perfil mínimo para continuar o login');
            }
          }
          
          // Verificar se o perfil está ativo
          if (userProfile.is_active === false) {
            console.log('🚫 Perfil inativo, fazendo logout:', userProfile);
            await authService.signOut();
            throw { 
              message: 'Sua conta está desativada. Entre em contato com o administrador.',
              category: AuthErrorCategory.AUTHENTICATION
            };
          }
          
          // Atualiza o estado com os dados do perfil
          updateState({ 
            profile: userProfile,
            user: result.data.user,
            error: null,
            isLoading: false
          });
          
          // Atualizar o last_login do usuário (operação não crítica)
          profileService.updateLastLogin(result.data.user.id).catch(console.error);
          
          toast.success(`Bem-vindo(a)!`);
          
          // Use state from location if available
          const from = window.history.state?.usr?.from?.pathname || '/';
          navigate(from, { replace: true });
          
        } catch (profileError: any) {
          console.error('❌ Erro ao verificar perfil após login:', profileError);
          
          // Se o erro é relacionado a perfil mas o login funcionou, 
          // vamos continuar com dados mínimos
          if (profileError?.message?.includes('403') || profileError?.message?.includes('Timeout') || profileError?.message?.includes('profile')) {
            console.warn('⚠️ Problema com perfil, mas login foi bem-sucedido. Continuando com dados básicos.');
            
            const basicProfile = {
              id: result.data.user.id,
              email: result.data.user.email || email,
              role: DEFAULT_USER_ROLE as UserRole,
              created_at: result.data.user.created_at || new Date().toISOString(),
              last_login: new Date().toISOString(),
              is_active: true,
              is_approved: true
            };
            
            updateState({ 
              profile: basicProfile,
              user: result.data.user,
              error: null,
              isLoading: false
            });
            
            toast.success(`Bem-vindo(a)! (Perfil carregado parcialmente)`);
            
            const from = window.history.state?.usr?.from?.pathname || '/';
            navigate(from, { replace: true });
            return;
          }
          
          // Para outros erros, mostrar erro mas não fazer logout automático
          setTechnicalError({
            message: profileError.message || 'Erro ao verificar perfil',
            category: profileError.category || AuthErrorCategory.PROFILE_CREATION,
            timestamp: new Date().toISOString(),
            context: { userId: result.data.user.id, email: result.data.user.email }
          });
          
          console.warn('⚠️ Erro no perfil, mas mantendo usuário logado');
          updateState({ 
            user: result.data.user,
            profile: null,
            error: 'Problema ao carregar perfil. Algumas funcionalidades podem estar limitadas.',
            isLoading: false
          });
        }
      } else {
        console.error('❌ Login falhou, dados incompletos:', result.data);
        throw {
          message: 'Falha no login: dados incompletos retornados',
          category: AuthErrorCategory.UNKNOWN
        };
      }
      
    } catch (error: any) {
      console.error('❌ Erro durante o login:', error);
      
      // Formatar mensagem de erro amigável
      const errorCategory = error.category || AuthErrorCategory.UNKNOWN;
      const errorMessage = error.message || AUTH_ERROR_MESSAGES[errorCategory] || 'Erro ao fazer login';
      
      updateState({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    } finally {
      console.log('🧹 Finalizando operação de login');
      cleanupAuthOperation();
    }
  }, [isAuthProcessing, navigate, updateState, cleanupAuthOperation]);

  const signOut = useCallback(async () => {
    // Verificação preventiva contra operações paralelas
    if (isAuthProcessing) {
      console.warn('⚠️ Tentativa de logout bloqueada - operação já em andamento');
      return;
    }
    
    console.log('🚪 Iniciando processo de logout');
    setIsAuthProcessing(true);
    authOperationRef.current = new AbortController();
    
    try {
      updateState({ isLoading: true });
      
      // Aplicar timeout na operação de logout
      const logoutPromise = authService.signOut();
      await withTimeout(logoutPromise, 5000, 'logout de usuário');
      
      // Limpa o estado de autenticação
      updateState({
        user: null,
        profile: null,
        error: null,
        isLoading: false
      });
      
      console.log('✅ Logout realizado com sucesso');
      toast.success('Você saiu do sistema com sucesso');
      navigate('/login');
    } catch (error: any) {
      console.error('❌ Erro ao fazer logout:', error);
      toast.error(error.message || 'Ocorreu um erro ao tentar sair.');
      updateState({ isLoading: false });
    } finally {
      console.log('🧹 Finalizando operação de logout');
      cleanupAuthOperation();
    }
  }, [isAuthProcessing, navigate, updateState, cleanupAuthOperation]);

  return { 
    signIn, 
    signUp, 
    signOut, 
    technicalError, 
    isAuthProcessing // Exposição do estado para debug
  };
}
