
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE } from '@/constants/auth';
import { categorizeError, delay } from './errorHandling';
import { validateRole } from './validation';

export const signUpUser = async (email: string, password: string, role: UserRole = DEFAULT_USER_ROLE) => {
  console.log('Iniciando processo de cadastro:', { email, role });
  
  // Ensure role is one of the valid enum values
  const validatedRole = validateRole(role);
  
  try {
    // Register in Supabase Auth - Using signUp instead of signUpWithPassword for compatibility
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: validatedRole // This will be used by the handle_new_user trigger
        },
        // NOVO: Adicionar emailRedirectTo para melhorar fluxo de confirmação
        emailRedirectTo: `${window.location.origin}/login`
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
        category: categorizeError({ message: 'user creation failed' })
      };
    }
    
    // MELHORADO: Verificação explícita de criação de perfil com timeout mais curto
    const maxRetries = 2;
    let profileCreated = false;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        console.log(`Verificando criação de perfil: tentativa ${attempt + 1} de ${maxRetries}`);
        await delay(800); // Delay mais curto para não bloquear o usuário
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
          email: data.user.email,
          role: profileData.role
        });
        profileCreated = true;
        break;
      }
    }
    
    console.log('Usuário criado com sucesso:', {
      id: data.user.id,
      email: data.user.email,
      role: validatedRole,
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
};

export const signInUser = async (email: string, password: string) => {
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
};

export const signOutUser = async () => {
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
};

export const checkAuthentication = (): boolean => {
  try {
    return !!localStorage.getItem('supabase.auth.token');
  } catch (e) {
    return false;
  }
};
