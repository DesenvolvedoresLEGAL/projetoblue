
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { useIdempotentAssociation } from './useIdempotentAssociation';
import { useAssetBusinessRules } from './useAssetBusinessRules';

interface CreateAssociationData {
  clientId: string;
  associationTypeId: number;
  startDate: string;
  endDate?: string;
  selectedAssets: Array<{
    id: string;
    type: string;
    identifier: string;
    solution_id?: number;
    associatedChipId?: string; // 🆕 NOVO: CHIP associado pelo usuário
    isMainChip?: boolean;      // 🆕 NOVO: Se é CHIP principal
    equipmentConfig?: {        // 🆕 NOVO: Configurações específicas
      ssid?: string;
      password?: string;
      dataLimit?: number;
      rentedDays?: number;
    };
  }>;
  generalConfig: {
    notes?: string;
    // Remover configs de equipamento que agora são específicas
  };
}

interface CreateAssociationResult {
  success: boolean;
  message: string;
  details?: {
    inserted_count: number;
    failed_count: number;
    total_processed: number;
    inserted_ids: string[];
    failed_assets: Array<{
      asset_id: string;
      error_code: string;
      message: string;
    }>;
  };
}

const buildInsertResult = (ids: string[], total: number): CreateAssociationResult => {
  return {
    success: true,
    message: 'Associação criada com sucesso',
    details: {
      inserted_count: ids.length,
      failed_count: total - ids.length,
      total_processed: total,
      inserted_ids: ids,
      failed_assets: []
    }
  };
};

// Substituir toda a seção "NOVA LÓGICA" por:
export const useCreateAssociation = () => {
  const queryClient = useQueryClient();
  const { executeWithIdempotency } = useIdempotentAssociation();
  const { isChip } = useAssetBusinessRules();

  return useMutation({
    mutationFn: async (data: CreateAssociationData): Promise<CreateAssociationResult> => {
      if (import.meta.env.DEV) console.log('[useCreateAssociation] Iniciando criação de associação com dados:', data);

      // Validação existente...
      const validationErrors: string[] = [];
      
      if (!data.clientId) {
        validationErrors.push('clientId não fornecido');
      }
      
      if (!data.associationTypeId || typeof data.associationTypeId !== 'number') {
        validationErrors.push(`associationTypeId inválido: ${data.associationTypeId}`);
      }
      
      if (!data.startDate) {
        validationErrors.push('startDate não fornecida');
      }
      
      if (!data.selectedAssets?.length) {
        validationErrors.push('selectedAssets vazio ou não fornecido');
      }

      // 🆕 NOVA VALIDAÇÃO: Equipamentos que precisam de CHIP
      const equipmentsThatNeedChip = data.selectedAssets.filter(
        asset => [1, 2, 4].includes(asset.solution_id || 0)
      );

      const equipmentsWithoutChip = equipmentsThatNeedChip.filter(
        equipment => !equipment.associatedChipId
      );

      if (equipmentsWithoutChip.length > 0) {
        validationErrors.push(
          `Equipamentos que precisam de CHIP não foram configurados: ${
            equipmentsWithoutChip.map(e => e.identifier).join(', ')
          }`
        );
      }

      if (validationErrors.length > 0) {
        const errorMsg = `Dados obrigatórios não fornecidos: ${validationErrors.join(', ')}`;
        if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro de validação:', errorMsg);
        throw new Error(errorMsg);
      }

      // Formatação de data existente...
      let formattedStartDate: string;
      try {
        const dateObj = new Date(data.startDate);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Data de início inválida');
        }
        formattedStartDate = dateObj.toISOString().split('T')[0];
        if (import.meta.env.DEV) console.log('[useCreateAssociation] Data formatada:', formattedStartDate);
      } catch (error) {
        if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro ao formatar data:', error);
        throw new Error('Formato de data inválido');
      }

      // 🆕 NOVA LÓGICA DE ASSOCIAÇÃO
 const associations: Array<{
        client_id: string;
        association_type_id: number;
        entry_date: string;
        exit_date?: string;
        notes?: string;
        equipment_ssid?: string;
        equipment_pass?: string;
        plan_gb?: number;
        equipment_id?: string;
        chip_id?: string;
      }> = [];

      if (import.meta.env.DEV) console.log('[useCreateAssociation] Processando assets:', data.selectedAssets);

      data.selectedAssets.forEach(asset => {
        if (asset.solution_id === 11) {
          // É um CHIP - só processar se não estiver associado a equipamento
          const isAssociatedToEquipment = data.selectedAssets.some(
            equipment => equipment.associatedChipId === asset.id
          );
          
          if (!isAssociatedToEquipment) {
            // CHIP independente (backup)
            associations.push({
              client_id: data.clientId,
              association_type_id: data.associationTypeId,
              entry_date: formattedStartDate,
              exit_date: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : undefined,
              notes: data.generalConfig?.notes,
              equipment_id: undefined,
              chip_id: asset.id,
            });
          }
        } else {
          // É um equipamento
          const needsChip = [1, 2, 4].includes(asset.solution_id || 0);
          
          associations.push({
            client_id: data.clientId,
            association_type_id: data.associationTypeId,
            entry_date: formattedStartDate,
            exit_date: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : undefined,
            notes: data.generalConfig?.notes,
            equipment_id: asset.id,
            chip_id: needsChip ? asset.associatedChipId : undefined,
            // Usar configurações específicas do equipamento
            equipment_ssid: asset.equipmentConfig?.ssid,
            equipment_pass: asset.equipmentConfig?.password,
            plan_gb: asset.equipmentConfig?.dataLimit,
          });
        }
      });

      if (import.meta.env.DEV) console.log('[useCreateAssociation] Associações preparadas:', associations);

      // Executar com idempotência
return executeWithIdempotency(
        `create_association_${data.clientId}_${data.associationTypeId}_${formattedStartDate}`,
        async () => {
          if (import.meta.env.DEV) console.log('[useCreateAssociation] Inserindo associações...');

          const { data: inserted, error } = await supabase
            .from('associations')
            .insert(associations)
            .select('uuid');

          if (error) {
            if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro do Supabase:', error);
            throw new Error(error.message || 'Erro desconhecido ao criar associação');
          }

          const insertedIds = inserted ? inserted.map(rec => rec.uuid as string) : [];
          const result = buildInsertResult(insertedIds, associations.length);

          if (import.meta.env.DEV) console.log('[useCreateAssociation] Resultado da inserção:', result);
          return result;
        }
      );
    },
    onSuccess: (result) => {
      if (import.meta.env.DEV) console.log('[useCreateAssociation] Sucesso:', result);
      
      const successMessage = result.details 
        ? `${result.message} (${result.details.inserted_count} associações criadas)`
        : result.message;
      
      toast.success(successMessage);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['associations'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: unknown) => {
      if (import.meta.env.DEV) console.error('[useCreateAssociation] Erro capturado:', error);

      let errorMessage = 'Erro ao criar associação';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
};
