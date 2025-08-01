import { supabase } from '@/integrations/supabase/client';
import { checkPasswordStrength } from '@/utils/passwordStrength';
import { AuthResponse, AuthError } from '@supabase/supabase-js';
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE, AuthErrorCategory } from '@/constants/auth';
import { toUserRole } from '@/utils/roleUtils';

interface SignUpData {
  email: string;
  password: string;
  role?: UserRole;
  username?: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
  category?: AuthErrorCategory;
}

// Helper function to add delay for retrying operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to categorize errors
const categorizeError = (error: unknown) => {
  const err = error as { message?: string } | null;
  const message = err?.message?.toLowerCase() || '';
  
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
  validateSignUpData({ email, password, username }: SignUpData): ValidationResult {
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
    
    // Validação do username
    if (username) {
      if (username.length < 3) {
        return {
          isValid: false,
          error: 'Nome de usuário deve ter pelo menos 3 caracteres.',
          category: AuthErrorCategory.INVALID_EMAIL
        };
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return {
          isValid: false,
          error: 'Nome de usuário deve conter apenas letras, números e underscore.',
          category: AuthErrorCategory.INVALID_EMAIL
        };
      }
    }
    
    return { isValid: true };
  },

  // Sign up with retry and profile verification
  async signUp(
    email: string,
    password: string,
    role: UserRole = DEFAULT_USER_ROLE,
    username?: string
  ): Promise<{ data: AuthResponse['data']; error: AuthError | null; profileCreated: boolean }> {
    
    
    // Converter role para valor reconhecido
    role = toUserRole(role);
    
    try {
      // Register in Supabase Auth - Using signUp instead of signUpWithPassword for compatibility
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role, // This will be used by the handle_new_user trigger
            username: username || `user_${Date.now()}` // Incluir username nos metadados
          },
          // NOVO: Adicionar emailRedirectTo para melhorar fluxo de confirmação
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      
      if (error) {
        if (import.meta.env.DEV) console.error('Erro detalhado do Supabase Auth:', {
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
        
        throw {
          message: 'Falha ao criar usuário: dados incompletos retornados',
          category: AuthErrorCategory.UNKNOWN
        };
      }
      
      // MELHORADO: Verificação explícita de criação de perfil com timeout mais curto
      const maxRetries = 2;
      let profileCreated = false;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (attempt > 0) {
          
          await delay(800); // Delay mais curto para não bloquear o usuário
        }
        
        // Verificar se o perfil foi criado
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (!profileError && profileData) {
          if (import.meta.env.DEV) console.log('Perfil confirmado para usuário:', { 
            id: data.user.id,
            email: data.user.email,
            username: profileData.username,
            role: profileData.role
          });
          profileCreated = true;
          break;
        }
      }
      
      // Não tentamos criar manualmente aqui, isso será feito no useAuthActions
      // para dar mais chances ao trigger funcionar assincronamente
      
      if (import.meta.env.DEV) console.log('Usuário criado com sucesso:', {
        id: data.user.id,
        email: data.user.email,
        username: username,
        role: role,
        created_at: data.user.created_at,
        profile_verified: profileCreated
      });
      
      return { data, error: null, profileCreated };
    } catch (error: unknown) {
      const err = error as { message?: string; name?: string; stack?: string; category?: AuthErrorCategory };
      if (import.meta.env.DEV) console.error('Erro detalhado durante o cadastro:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        category: err.category || categorizeError(error)
      });
      throw error;
    }
  },

  // Sign in with improved retry logic
  async signIn(email: string, password: string) {
    
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
            
            lastError = error;
            // Wait a bit longer between each retry with exponential backoff
            await delay(Math.pow(2, attempts) * 1000);
            attempts++;
            continue;
          }
          
          
          
          // Success! Return the data
          return { data, error: null };
        } catch (fetchError: unknown) {
          
          lastError = fetchError as Error;
          // Wait with exponential backoff
          await delay(Math.pow(2, attempts) * 1000);
          attempts++;
        }
      }

      // If we got here, all attempts failed
      
      return { 
        data: { session: null, user: null }, 
        error: lastError || new Error('Falha ao conectar com o servidor de autenticação após múltiplas tentativas') 
      };
    } catch (error: unknown) {
      
      return {
        data: { session: null, user: null },
        error
      };
    }
  },

  // Sign out with improved handling
  async signOut() {
    try {
      return await supabase.auth.signOut();
    } catch (error) { 
      return error;
    }
  },

  // Check if user is authenticated using Supabase session
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (e) {
      
      return false;
    }
  }
};
