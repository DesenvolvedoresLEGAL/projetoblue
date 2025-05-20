
import { supabase } from '@/integrations/supabase/client';
import { checkPasswordStrength } from '@/utils/passwordStrength';
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE, AuthErrorCategory } from '@/constants/auth';

interface SignUpData {
  email: string;
  password: string;
  role?: UserRole;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  category?: AuthErrorCategory;
}

// Helper function to add delay for retrying operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to categorize errors
const categorizeError = (error: any) => {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('already registered')) {
    return AuthErrorCategory.DUPLICATE_EMAIL;
  } else if (message.includes('password')) {
    return AuthErrorCategory.INVALID_PASSWORD;
  } else if (message.includes('email')) {
    return AuthErrorCategory.INVALID_EMAIL;
  } else if (message.includes('database') || message.includes('profile')) {
    return AuthErrorCategory.PROFILE_CREATION;
  } else if (message.includes('network') || message.includes('fetch') || message.includes('conectar')) {
    return AuthErrorCategory.NETWORK;
  } else if (message.includes('credentials') || message.includes('authentication')) {
    return AuthErrorCategory.AUTHENTICATION;
  }
  
  return AuthErrorCategory.UNKNOWN;
};

export const authService = {
  // Validation logic
  validateSignUpData({ email, password }: SignUpData): ValidationResult {
    if (!email || !email.includes('@') || !email.includes('.')) {
      return {
        isValid: false,
        error: 'Email inválido. Por favor, forneça um email válido.',
        category: AuthErrorCategory.INVALID_EMAIL
      };
    }
    
    if (!password || password.length < 6) {
      return {
        isValid: false,
        error: 'Senha muito curta. Deve ter pelo menos 6 caracteres.',
        category: AuthErrorCategory.INVALID_PASSWORD
      };
    }
    
    const passwordStrength = checkPasswordStrength(password);
    if (passwordStrength === 'weak') {
      return {
        isValid: false,
        error: 'Senha fraca. Use uma combinação de letras, números e caracteres especiais.',
        category: AuthErrorCategory.INVALID_PASSWORD
      };
    }
    
    return { isValid: true };
  },

  // Sign up with retry and profile verification
  async signUp(email: string, password: string, role: UserRole = DEFAULT_USER_ROLE) {
    console.log('Iniciando processo de cadastro:', { email, role });
    
    // Ensure role is one of the valid enum values
    if (!['admin', 'gestor', 'consultor', 'cliente', 'user'].includes(role)) {
      console.warn(`Valor de role inválido: ${role}, usando '${DEFAULT_USER_ROLE}' como padrão`);
      role = DEFAULT_USER_ROLE as UserRole;
    }
    
    try {
      // Register in Supabase Auth - Using signUp instead of signUpWithPassword for compatibility
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role // This will be used by the handle_new_user trigger
          }
        }
      });
      
      if (error) {
        console.error('Erro detalhado do Supabase Auth:', {
          message: error.message,
          name: error.name,
          status: error.status,
          stack: error.stack
        });
        
        const errorCategory = categorizeError(error);
        throw { ...error, category: errorCategory };
      }
      
      // Check if the user was created successfully
      if (!data.user || !data.user.id) {
        console.error('Usuário não foi criado corretamente:', data);
        throw {
          message: 'Falha ao criar usuário: dados incompletos retornados',
          category: AuthErrorCategory.UNKNOWN
        };
      }
      
      // Verificação explícita de criação de perfil e tentativa de recuperação
      const maxRetries = 3;
      let profileCreated = false;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (attempt > 0) {
          console.log(`Verificando criação de perfil: tentativa ${attempt + 1} de ${maxRetries}`);
          await delay(1000 * attempt); // Backoff exponencial
        }
        
        // Verificar se o perfil foi criado
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (!profileError && profileData) {
          console.log('Perfil confirmado para usuário:', { 
            id: data.user.id,
            email: data.user.email
          });
          profileCreated = true;
          break;
        }
        
        // Se estamos na última tentativa e o perfil ainda não existe, tente criar manualmente
        if (attempt === maxRetries - 1 && !profileCreated) {
          console.warn('Perfil não detectado após múltiplas tentativas. Tentando criar manualmente...');
          
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('ensure_user_profile', {
              user_id: data.user.id,
              user_email: data.user.email || email,
              user_role: role
            });
          
          if (rpcError) {
            console.error('Falha ao criar perfil manualmente:', rpcError);
          } else if (rpcData) {
            console.log('Perfil criado manualmente com sucesso');
            profileCreated = true;
          }
        }
      }
      
      if (!profileCreated) {
        console.error('Não foi possível confirmar a criação do perfil do usuário após múltiplas tentativas');
        
        // Lançamos um aviso, mas não bloqueamos o processo - o perfil pode ter sido criado
        // mesmo que nossa verificação não tenha conseguido detectá-lo
        console.warn('Continuando com o processo de registro, mas há risco de perfil ausente');
      }
      
      console.log('Usuário criado com sucesso:', {
        id: data.user.id,
        email: data.user.email,
        role: role,
        created_at: data.user.created_at,
        profile_verified: profileCreated
      });
      
      return { data, error: null, profileCreated };
    } catch (error: any) {
      console.error('Erro detalhado durante o cadastro:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        category: error.category || categorizeError(error)
      });
      throw error;
    }
  },

  // Sign in with improved retry logic
  async signIn(email: string, password: string) {
    console.log('Tentando login para:', email);
    try {
      // Add a retry mechanism for auth sign-in
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
          });
          
          if (error) {
            console.error(`Tentativa ${attempts + 1} falhou:`, error.message);
            lastError = error;
            // Wait a bit longer between each retry with exponential backoff
            await delay(Math.pow(2, attempts) * 1000);
            attempts++;
            continue;
          }
          
          console.log('Login successful:', data.user?.email);
          
          // Store auth info in localStorage for persistence
          if (data.session) {
            try {
              localStorage.setItem('supabase.auth.token', data.session.access_token);
            } catch (e) {
              console.warn('Could not save token to localStorage:', e);
            }
          }
          
          // Success! Return the data
          return { data, error: null };
        } catch (fetchError: any) {
          console.error(`Erro de rede na tentativa ${attempts + 1}:`, fetchError);
          lastError = fetchError;
          // Wait with exponential backoff
          await delay(Math.pow(2, attempts) * 1000);
          attempts++;
        }
      }

      // If we got here, all attempts failed
      console.error('Todas as tentativas de login falharam:', lastError);
      return { 
        data: { session: null, user: null }, 
        error: lastError || new Error('Falha ao conectar com o servidor de autenticação após múltiplas tentativas') 
      };
    } catch (error: any) {
      console.error('Erro não tratado durante login:', error);
      return { 
        data: { session: null, user: null }, 
        error 
      };
    }
  },

  // Sign out with improved handling
  async signOut() {
    try {
      // Clear saved token from localStorage
      try {
        localStorage.removeItem('supabase.auth.token');
      } catch (e) {
        console.warn('Could not clear token from localStorage:', e);
      }
      
      return await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  },
  
  // Check if user is authenticated based on local storage
  isAuthenticated(): boolean {
    try {
      return !!localStorage.getItem('supabase.auth.token');
    } catch (e) {
      return false;
    }
  }
};
