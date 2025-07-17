
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { AssociationWithRelations } from '../types/associationsTypes';

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

  async getAll(): Promise<AssociationWithRelations[]> {
    const { data, error } = await supabase
      .from('associations')
      .select(`
        *,
        client:clients!client_id_fkey(
          uuid,
          nome,
          empresa,
          responsavel,
          contato,
          email,
          cnpj,
          created_at,
          updated_at
        ),
        equipment:assets!equipment_id_fkey(
          uuid,
          model,
          serial_number,
          line_number,
          iccid,
          radio,
          solution_id,
          manufacturer_id,
          status_id,
          rented_days,
          admin_user,
          admin_pass,
          created_at,
          updated_at,
          manufacturer:manufacturers(
            id,
            name,
            country,
            description,
            website,
            created_at,
            updated_at
          ),
          solution:asset_solutions(
            id,
            solution,
            created_at,
            updated_at
          ),
          status:asset_status(
            id,
            status,
            created_at,
            updated_at
          )
        ),
        chip:assets!chip_id_fkey(
          uuid,
          model,
          serial_number,
          line_number,
          iccid,
          radio,
          solution_id,
          manufacturer_id,
          status_id,
          rented_days,
          admin_user,
          admin_pass,
          created_at,
          updated_at,
          manufacturer:manufacturers(
            id,
            name,
            country,
            description,
            website,
            created_at,
            updated_at
          ),
          solution:asset_solutions(
            id,
            solution,
            created_at,
            updated_at
          ),
          status:asset_status(
            id,
            status,
            created_at,
            updated_at
          )
        ),
        association_type:association_types(
          id,
          type,
          created_at,
          updated_at
        ),
        plan:plans!plan_id_fkey(
          id,
          nome,
          tamanho_gb,
          created_at,
          updated_at
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transformar dados para o formato esperado
    return (data || []).map(association => ({
      uuid: association.uuid,
      client_id: association.client_id,
      equipment_id: association.equipment_id,
      chip_id: association.chip_id,
      entry_date: association.entry_date,
      exit_date: association.exit_date,
      association_type_id: association.association_type_id,
      plan_id: association.plan_id,
      plan_gb: association.plan_gb,
      equipment_ssid: association.equipment_ssid,
      equipment_pass: association.equipment_pass,
      status: association.status,
      notes: association.notes,
      created_at: association.created_at,
      updated_at: association.updated_at,
      client: association.client,
      equipment: association.equipment,
      chip: association.chip
    }));
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('associations')
      .select(`
        *,
        client:clients!associations_client_id_fkey(*),
        equipment:assets!associations_equipment_id_fkey(*),
        chip:assets!associations_chip_id_fkey(*),
        association_type:association_types(*),
        plan:plans(*)
      `)
      .eq('uuid', id)
      .is('deleted_at', null)
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

  async endAssociation(id: string, exitDate: string, notes?: string) {
    const updateData: AssociationUpdate = {
      exit_date: exitDate,
      status: false,
      updated_at: new Date().toISOString()
    };

    if (notes) {
      updateData.notes = notes;
    }

    const { data, error } = await supabase
      .from('associations')
      .update(updateData)
      .eq('uuid', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
