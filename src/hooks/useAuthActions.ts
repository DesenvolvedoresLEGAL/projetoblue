
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';

export function useAuthActions(updateState: (state: any) => void) {
  const navigate = useNavigate();

  // Helper to map Supabase auth errors to user-friendly messages
  const mapAuthError = (error: AuthError | Error | null): string => {
    if (!error) return 'Ocorreu um erro inesperado';
    
    // Use generic messages for security (prevent enumeration attacks)
    const message = error.message || '';
    
    // Only do specific messaging for very common cases
    if (message.includes('Email not confirmed')) {
      return 'Por favor, confirme seu email antes de fazer login';
    }
    
    // For most errors, use a generic message
    return 'Credenciais inválidas. Verifique seu email e senha.';
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Iniciando processo de cadastro');
      updateState({ isLoading: true, error: null });
      
      const validation = authService.validateSignUpData({ email, password });
      if (!validation.isValid) {
        console.error('Erro de validação:', validation.error);
        updateState({ error: validation.error, isLoading: false });
        toast.error(validation.error);
        return;
      }

      console.log('AuthContext: Dados validados, enviando para o serviço de autenticação');
      
      const { data, error } = await authService.signUp(email, password);

      if (error) {
        console.error('Erro no Supabase auth.signUp:', error);
        
        let errorMessage = 'Falha ao criar usuário';
        
        if (error.message?.includes('already registered')) {
          errorMessage = 'Este email já está cadastrado.';
        } else if (error.message?.includes('password')) {
          errorMessage = 'Senha inválida: deve ter pelo menos 6 caracteres';
        } else if (error.message?.includes('email')) {
          errorMessage = 'Email inválido';
        }
        
        console.error('Erro traduzido:', errorMessage);
        updateState({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return;
      }

      if (data.user) {
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
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      updateState({ isLoading: true, error: null });
      
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      console.log('AuthContext: Iniciando login para:', email);
      
      // Use Supabase directly rather than through service for cleaner error handling
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        const errorMessage = mapAuthError(error);
        updateState({ error: errorMessage, isLoading: false });
        toast.error(errorMessage);
        return error;
      }

      if (data.user) {
        console.log('Login bem-sucedido para:', email);
        // Toast and redirect now handled in the Login component's useEffect
        return null;
      } else {
        console.error('Login falhou, dados incompletos:', data);
        const error = new Error('Falha no login: dados incompletos retornados');
        updateState({ error: error.message, isLoading: false });
        toast.error('Erro ao fazer login');
        return error;
      }
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      updateState({ error: error.message || 'Erro ao fazer login', isLoading: false });
      toast.error('Erro ao fazer login');
      return error;
    } finally {
      updateState({ isLoading: false });
    }
  };

  const signOut = async () => {
    try {
      updateState({ isLoading: true });
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Você saiu do sistema');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast.error(error.message || 'Ocorreu um erro ao tentar sair.');
    } finally {
      updateState({ isLoading: false });
    }
  };

  return { signIn, signUp, signOut };
}
