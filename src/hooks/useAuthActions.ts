
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { useState, useCallback } from 'react';
import { UserRole } from '@/types/auth';

export function useAuthActions(updateState: (state: any) => void) {
  const navigate = useNavigate();
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  const signUp = useCallback(async (email: string, password: string, role: UserRole = 'cliente') => {
    // Prevent duplicate operations
    if (isAuthProcessing) {
      console.log('Auth operation already in progress. Ignoring duplicate request.');
      return;
    }
    
    try {
      setIsAuthProcessing(true);
      console.log('AuthContext: Iniciando processo de cadastro');
      updateState({ isLoading: true, error: null });
      
      const validation = authService.validateSignUpData({ email, password });
      if (!validation.isValid) {
        console.error('Erro de validação:', validation.error);
        updateState({ error: validation.error, isLoading: false });
        toast.error(validation.error);
        return;
      }

      console.log('AuthContext: Dados validados, enviando para o serviço de autenticação', { 
        email, 
        roleType: typeof role, 
        role 
      });
      
      // Ensure we have a valid role
      if (!['admin', 'gestor', 'consultor', 'cliente', 'user'].includes(role)) {
        console.warn(`Role inválido '${role}' fornecido, usando 'cliente' como padrão`);
        role = 'cliente';
      }
      
      const { data, error } = await authService.signUp(email, password, role);

      if (error) {
        console.error('Erro no cadastro de usuário:', error);
        
        let errorMessage = 'Falha ao criar usuário';
        
        if (error.message?.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado.';
        } else if (error.message?.includes('password')) {
          errorMessage = 'Senha inválida: ' + error.message;
        } else if (error.message?.includes('email')) {
          errorMessage = 'Email inválido: ' + error.message;
        } else if (error.message?.includes('database')) {
          errorMessage = 'Erro de banco de dados: Falha ao criar perfil do usuário.';
        } else if (error.message?.includes('captcha')) {
          console.error('Erro de CAPTCHA:', error);
          errorMessage = 'Erro de configuração do sistema. Entre em contato com o administrador.';
        }
        
        console.error('Erro traduzido:', errorMessage);
        updateState({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return;
      }

      if (data?.user) {
        console.log('Usuário criado com sucesso:', data.user.id);
        toast.success("Usuário criado com sucesso! Você já pode fazer login.");
        navigate('/login');
      } else {
        console.error('Usuário não foi criado, dados incompletos:', data);
        throw new Error('Falha ao criar usuário: dados incompletos retornados');
      }
    } catch (error: any) {
      console.error('Erro não tratado no processo de cadastro:', error);
      const errorMessage = error.message || 'Ocorreu um erro inesperado durante o cadastro.';
      updateState({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
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
      
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      console.log('AuthContext: Iniciando login para:', email);
      const { data, error } = await authService.signIn(email, password);
      
      if (error) {
        let errorMessage = 'Erro ao fazer login';
        
        if (error.message?.includes('credentials')) {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.message?.includes('disabled')) {
          errorMessage = 'Esta conta está desativada. Entre em contato com o administrador.';
        } else if (error.message?.includes('fetch') || error.message?.includes('conectar')) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet e tente novamente.';
        }
        
        throw new Error(errorMessage);
      }

      if (data.user) {
        console.log('Login bem-sucedido para:', email);
        try {
          const profile = await profileService.fetchUserProfile(data.user.id);
          console.log('Perfil obtido após login:', profile);
          
          // Verificando apenas se o perfil está ativo
          if (!profile || !profile.is_active) {
            console.log('Perfil inativo, fazendo logout:', profile);
            await authService.signOut();
            throw new Error('Sua conta está desativada. Entre em contato com o administrador.');
          }
          
          // Atualiza o estado com os dados do perfil
          updateState({ 
            profile,
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
          await authService.signOut();
          throw profileError;
        }
      } else {
        console.error('Login falhou, dados incompletos:', data);
        throw new Error('Falha no login: dados incompletos retornados');
      }
      
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      updateState({ error: error.message || 'Erro ao fazer login', isLoading: false });
      toast.error(error.message || 'Falha no login. Verifique suas credenciais.');
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

  return { signIn, signUp, signOut };
}
