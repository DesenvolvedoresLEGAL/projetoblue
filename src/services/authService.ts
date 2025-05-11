
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';

type SignUpData = {
  email: string;
  password: string;
};

type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export const validateSignUpData = (data: SignUpData): ValidationResult => {
  const { email, password } = data;

  if (!email) {
    return { isValid: false, error: "Email é obrigatório" };
  }

  if (!validateEmail(email)) {
    return { isValid: false, error: "Email inválido" };
  }

  if (!password) {
    return { isValid: false, error: "Senha é obrigatória" };
  }

  if (password.length < 8) {
    return { isValid: false, error: "A senha deve ter pelo menos 8 caracteres" };
  }

  return { isValid: true };
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Erro ao fazer login:", error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    return { error: null };
  } catch (error: any) {
    console.error("Erro ao fazer logout:", error);
    return { error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    
    if (error) throw error;
    
    toast.success("Um email de redefinição de senha foi enviado para você");
    return { error: null };
  } catch (error: any) {
    console.error("Erro ao solicitar redefinição de senha:", error);
    toast.error("Erro ao solicitar redefinição de senha: " + error.message);
    return { error };
  }
};

export const updateUserPassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) throw error;
    
    toast.success("Senha atualizada com sucesso");
    return { error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar senha:", error);
    toast.error("Erro ao atualizar senha: " + error.message);
    return { error };
  }
};

// Fix the profiles table related issue
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    if (!user) return { user: null, error: null };
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Erro ao buscar dados do perfil:", profileError);
    }
    
    return { 
      user: {
        ...user,
        profile: profileData || null
      }, 
      error: null 
    };
  } catch (error: any) {
    console.error("Erro ao obter usuário atual:", error);
    return { user: null, error };
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    // Ensure we're updating the correct fields based on the database schema
    const validProfileData = {
      email: profileData.email,
      role: profileData.role,
    };
    
    const { error } = await supabase
      .from('profiles')
      .update(validProfileData)
      .eq('id', userId);
      
    if (error) throw error;
    
    toast.success("Perfil atualizado com sucesso");
    return { error: null };
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    toast.error("Erro ao atualizar perfil: " + error.message);
    return { error };
  }
};
