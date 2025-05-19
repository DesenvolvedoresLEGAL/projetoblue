
import { supabase } from '@/integrations/supabase/client';
import { checkPasswordStrength } from '@/utils/passwordStrength';

interface SignUpData {
  email: string;
  password: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Helper function to add delay for retrying operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Validation logic
  validateSignUpData({ email, password }: SignUpData): ValidationResult {
    if (!email || !email.includes('@') || !email.includes('.')) {
      return {
        isValid: false,
        error: 'Email inválido. Por favor, forneça um email válido.'
      };
    }
    
    if (!password || password.length < 6) {
      return {
        isValid: false,
        error: 'Senha muito curta. Deve ter pelo menos 6 caracteres.'
      };
    }
    
    const passwordStrength = checkPasswordStrength(password);
    if (passwordStrength === 'weak') {
      return {
        isValid: false,
        error: 'Senha fraca. Use uma combinação de letras, números e caracteres especiais.'
      };
    }
    
    return { isValid: true };
  },

  // Sign up with retry
  async signUp(email: string, password: string) {
    console.log('Iniciando processo de cadastro:', { email });
    
    try {
      // Register in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'analyst'
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
        
        // Translate the most common Supabase errors
        if (error.message?.includes('already registered')) {
          throw new Error('Este email já está cadastrado.');
        } else if (error.message?.includes('password')) {
          throw new Error('Problema com a senha: ' + error.message);
        } else if (error.message?.includes('email')) {
          throw new Error('Problema com o email: ' + error.message);
        }
        
        throw error;
      }
      
      // Check if the user was created successfully
      if (!data.user || !data.user.id) {
        console.error('Usuário não foi criado corretamente:', data);
        throw new Error('Falha ao criar usuário: dados incompletos retornados');
      }
      
      // The user profile entry is created automatically via Supabase trigger
      // No need to create a separate entry in a users table
      
      console.log('Usuário criado com sucesso:', {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at
      });
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro detalhado durante o cadastro:', {
        message: error.message,
        name: error.name,
        stack: error.stack
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
