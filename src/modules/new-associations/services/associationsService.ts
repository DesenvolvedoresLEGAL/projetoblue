import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type NewAssociationInsert = Database['public']['Tables']['associations']['Insert'];
export type NewAssociationRow = Database['public']['Tables']['associations']['Row'];

export const createAssociation = async (data: NewAssociationInsert) => {
  const { data: result, error } = await supabase
    .from('associations')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result as NewAssociationRow;
};

export const listAssociations = async () => {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .limit(50)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as NewAssociationRow[];
};
