
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  last_login: string | null;
}

export interface ProfileUpdateData {
  [key: string]: any;
  email?: string;
  is_active?: boolean;
  is_approved?: boolean;
}

export const adminService = {
  // Listar todos os usuários
  async listUsers(): Promise<AdminUser[]> {
    console.log('Buscando lista de usuários...');
    
    const { data, error } = await supabase.rpc('admin_list_users');
    
    if (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error(`Erro ao carregar usuários: ${error.message}`);
    }
    
    console.log('Usuários carregados:', data?.length || 0);
    return data || [];
  },

  // Deletar usuário
  async deleteUser(userId: string): Promise<boolean> {
    console.log('Deletando usuário:', userId);
    
    const { data, error } = await supabase.rpc('admin_delete_user', {
      user_id: userId
    });
    
    if (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
    
    console.log('Usuário deletado com sucesso');
    return data || false;
  },

  // Atualizar role do usuário
  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    console.log('Atualizando role do usuário:', { userId, role });
    
    const { data, error } = await supabase.rpc('admin_update_user_role', {
      user_id: userId,
      new_role: role
    });
    
    if (error) {
      console.error('Erro ao atualizar role:', error);
      throw new Error(`Erro ao atualizar cargo: ${error.message}`);
    }
    
    console.log('Role atualizado com sucesso');
    return data || false;
  },

  // Atualizar dados do perfil
  async updateUserProfile(userId: string, profileData: ProfileUpdateData): Promise<boolean> {
    console.log('Atualizando perfil do usuário:', { userId, profileData });
    
    const { data, error } = await supabase.rpc('admin_update_user_profile', {
      user_id: userId,
      profile_updates: profileData as Record<string, any>
    });
    
    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error(`Erro ao atualizar perfil: ${error.message}`);
    }
    
    console.log('Perfil atualizado com sucesso');
    return data || false;
  }
};
