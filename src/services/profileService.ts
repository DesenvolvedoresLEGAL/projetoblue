
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/auth';
import { toUserRole } from '@/utils/roleUtils';

export const profileService = {
  async fetchUserProfile(userId: string, includeDeleted = false): Promise<UserProfile | null> {
    try {
      if (import.meta.env.DEV) console.log(`Fetching profile for user: ${userId}`);
      
      // First attempt with 'profiles' table query
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      // Apply soft-delete filter unless explicitly included
      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        if (import.meta.env.DEV) console.log('Profile found:', data.email);
        
        // Normalizar role para garantir valor reconhecido
        data.role = toUserRole(data.role as string);
        
        // Map the profiles table fields to the UserProfile type
        return {
          id: data.id,
          email: data.email,
          username: data.username || `user_${data.id.substring(0, 8)}`, // Fallback para username
          role: data.role as UserRole,
          created_at: data.created_at,
          last_login: data.last_login || new Date().toISOString(),
          is_active: data.is_active !== false, // Default to true if undefined
          is_approved: data.is_approved !== false, // Default to true if undefined
          bits_referral_code: data.bits_referral_code,
          updated_at: data.updated_at,
          deleted_at: data.deleted_at // Incluir deleted_at no retorno
        };
      }
      
      if (import.meta.env.DEV) console.warn(`No profile found for user ${userId}, attempting to create profile`);
      
      // MELHORADO: Tentar criar perfil sem depender de auth.getUser()
      try {
        if (import.meta.env.DEV) console.log(`Tentando criar perfil diretamente na tabela profiles para usuário ${userId}`);
        
        // FALLBACK: Não tentar obter userData se temos problemas de auth
        // Em vez disso, usar o email da sessão atual se disponível
        const session = await supabase.auth.getSession();
        const userEmail = session.data.session?.user?.email;
        
        if (!userEmail) {
          if (import.meta.env.DEV) console.error('Não foi possível obter email do usuário da sessão');
          return null;
        }
        
        // Inserir diretamente na tabela profiles
        const { data: newProfileData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            role: 'cliente',
            username: `user_${userId.substring(0, 8)}`,
            is_active: true,
            is_approved: true
          })
          .select()
          .single();
          
        if (insertError) {
          if (import.meta.env.DEV) console.error('Falha ao criar perfil diretamente:', insertError);
        } else {
          if (import.meta.env.DEV) console.log('Perfil criado diretamente na tabela');
          return {
            id: newProfileData.id,
            email: newProfileData.email,
            username: newProfileData.username,
            role: newProfileData.role as UserRole,
            created_at: newProfileData.created_at,
            last_login: newProfileData.last_login || new Date().toISOString(),
            is_active: newProfileData.is_active !== false,
            is_approved: newProfileData.is_approved !== false,
            bits_referral_code: newProfileData.bits_referral_code,
            updated_at: newProfileData.updated_at,
            deleted_at: newProfileData.deleted_at
          };
        }
        
        // Fallback final: criar um perfil mínimo se não conseguiu via inserção direta
        if (userEmail) {
          return {
            id: userId,
            email: userEmail,
            username: `user_${userId.substring(0, 8)}`,
            role: 'cliente', 
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            is_active: true,
            is_approved: true
          };
        }
        
        return null;
      } catch (createError) {
        if (import.meta.env.DEV) console.error('Error creating missing profile:', createError);
        return null;
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error in fetchUserProfile:', error);
      return null;
    }
  },
  
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await supabase
        .from('profiles')
        .update({ 
          last_login: now,
          updated_at: now
        })
        .eq('id', userId);
      
      if (import.meta.env.DEV) console.log(`Updated last_login for user ${userId}`);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to update last_login:', error);
      // Non-critical error, don't throw
    }
  }
};
