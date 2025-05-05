
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

export const authService = {
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
      
      // Create an entry in the users table
      try {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            uuid: data.user.id,
            email: email,
            password: '[AUTH VIA SUPABASE]', // We don't store the actual password
            is_approved: true,
            id_role: 2 // Default role (analyst)
          });
          
        if (userError) {
          console.error('Error creating user in users table:', userError);
          // Don't fail the sign-up if this fails, but log it
        }
      } catch (userInsertError) {
        console.error('Exception when creating user record:', userInsertError);
      }
      
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

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return supabase.auth.signOut();
  }
};
