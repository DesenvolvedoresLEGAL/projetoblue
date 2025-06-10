
import { useCallback } from 'react';
import { UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';

export function useManualProfileCreation() {
  const createProfileManually = useCallback(async (
    userId: string, 
    userEmail: string, 
    userRole: UserRole
  ): Promise<{success: boolean, error?: string}> => {
    console.log('Tentando criar perfil manualmente para:', {userId, userEmail, userRole});
    
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        if (attempt > 0) {
          const delayMs = Math.pow(2, attempt) * 1000;
          console.log(`Tentativa ${attempt+1}/${maxRetries} após delay de ${delayMs}ms`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
        const { data, error } = await supabase.rpc('ensure_user_profile', {
          user_id: userId,
          user_email: userEmail,
          user_role: userRole
        });
        
        if (error) {
          console.error(`Tentativa ${attempt+1} falhou:`, error);
          attempt++;
          continue;
        }
        
        const profileCheck = await profileService.fetchUserProfile(userId);
        if (profileCheck) {
          console.log('Perfil verificado após criação manual:', profileCheck);
          return { success: true };
        } else {
          console.warn(`Perfil não encontrado após criação manual na tentativa ${attempt+1}`);
          attempt++;
          continue;
        }
      } catch (err) {
        console.error(`Erro na tentativa ${attempt+1} de criar perfil:`, err);
        attempt++;
      }
    }
    
    return { 
      success: false, 
      error: `Falha ao criar perfil após ${maxRetries} tentativas` 
    };
  }, []);

  return { createProfileManually };
}
