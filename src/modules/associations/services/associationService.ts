
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Tipo específico para criação de associações
type AssociationInsert = TablesInsert<'associations'>;

// Tipo específico para atualização de associações
type AssociationUpdate = TablesUpdate<'associations'>;

export const associationService = {
  async create(associationData: AssociationInsert) {
    const { data, error } = await supabase
      .from('associations')
      .insert(associationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('associations')
      .select(`
        *,
        clients:client_id(nome, empresa),
        equipment:equipment_id(uuid, radio, model, serial_number),
        chip:chip_id(uuid, iccid, line_number),
        association_types:association_type_id(type),
        plans:plan_id(nome, tamanho_gb)
      `)
      .eq('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('associations')
      .select(`
        *,
        clients:client_id(nome, empresa),
        equipment:equipment_id(uuid, radio, model, serial_number),
        chip:chip_id(uuid, iccid, line_number),
        association_types:association_type_id(type),
        plans:plan_id(nome, tamanho_gb)
      `)
      .eq('uuid', id)
      .eq('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: AssociationUpdate) {
    const { data, error } = await supabase
      .from('associations')
      .update(updates)
      .eq('uuid', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { data, error } = await supabase
      .from('associations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('uuid', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async endAssociation(id: string, exitDate: string) {
    const { data, error } = await supabase
      .from('associations')
      .update({ 
        exit_date: exitDate,
        status: false,
        updated_at: new Date().toISOString()
      })
      .eq('uuid', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
