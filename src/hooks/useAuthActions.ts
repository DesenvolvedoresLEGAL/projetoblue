
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';

export function useAuthActions(updateState: (state: any) => void) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const signUp = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Iniciando processo de cadastro');
      updateState({ isLoading: true, error: null });
      
      const validation = authService.validateSignUpData({ email, password });
      if (!validation.isValid) {
        console.error('Erro de validação:', validation.error);
        updateState({ error: validation.error, isLoading: false });
        toast({
          title: "Erro de validação",
          description: validation.error,
          variant: "destructive"
        });
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
        toast({
          title: "Erro de cadastro",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        console.log('Usuário criado com sucesso:', data.user.id);
        toast({
          title: "Cadastro realizado",
          description: "Usuário criado com sucesso! Você já pode fazer login.",
          variant: "default"
        });
        navigate('/login');
      } else {
        console.error('Usuário não foi criado, dados incompletos:', data);
        throw new Error('Falha ao criar usuário: dados incompletos retornados');
      }
    } catch (error: any) {
      console.error('Erro não tratado no processo de cadastro:', error);
      const errorMessage = error.message || 'Ocorreu um erro inesperado durante o cadastro.';
      updateState({ error: errorMessage, isLoading: false });
      toast({
        title: "Erro no processo de cadastro",
        description: errorMessage,
        variant: "destructive"
      });
      // Não relançamos o erro aqui para evitar quebras na interface
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
        } catch (profileError) {
          console.error('Erro ao verificar perfil após login:', profileError);
          await authService.signOut();
          throw profileError;
        }
      } else {
        console.error('Login falhou, dados incompletos:', data);
        throw new Error('Falha no login: dados incompletos retornados');
      }
      
      navigate('/');
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      updateState({ error: error.message || 'Erro ao fazer login' });
      toast({
        title: "Erro de autenticação",
        description: error.message || 'Falha no login. Verifique suas credenciais.',
        variant: "destructive"
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  const signOut = async () => {
    try {
      updateState({ isLoading: true });
      await authService.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao sair",
        description: error.message || 'Ocorreu um erro ao tentar sair.',
        variant: "destructive"
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  return { signIn, signUp, signOut };
}
