
import { supabase } from '@/integrations/supabase/client';
import { AssociationType } from '../types/filterTypes';

export const associationTypesService = {
  async getAll(): Promise<AssociationType[]> {
    try {
      const { data, error } = await supabase
        .from('association_types')
        .select('id, type')
        .is('deleted_at', null)
        .order('id');

      if (error) {
        console.error('Erro ao buscar tipos de associação:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no serviço de tipos de associação:', error);
      throw error;
    }
  }
};
