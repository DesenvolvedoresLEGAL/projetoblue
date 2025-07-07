
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface para logs de asset com dados relacionados
 * Mapeamento baseado na tabela asset_logs com JOINs para dados legíveis
 * ATUALIZADO: assoc_id agora pode ser NULL devido às melhorias no trigger
 */
export interface AssetLogWithRelations {
  id: number;
  date: string;
  event: string;
  details: JSON; // jsonb field
  status_before_id?: number;
  status_after_id?: number;
  assoc_id?: number | null; // CORRIGIDO: Pode ser NULL agora
  // Dados relacionados via JOINs
  status_before?: { status: string };
  status_after?: { status: string };
  association?: {
    equipment?: {
      uuid: string;
      serial_number?: string;
      model?: string;
      iccid?: string;
      radio?: string;
      line_number?: number;
    };
    chip?: {
      uuid: string;
      serial_number?: string;
      model?: string;
      iccid?: string;
      radio?: string;
      line_number?: number;
    };
    client?: {
      uuid: string;
      nome: string;
    };
  } | null; // Pode ser NULL se assoc_id for NULL
}

/**
 * Busca logs de assets com dados relacionados usando JOINs
 * ATUALIZADO: Query otimizada para lidar com assoc_id nullable
 */
interface AssetLogWithRelationsRaw {
  id: number;
  date: string;
  event: string;
  details: JSON;
  status_before_id?: number;
  status_after_id?: number;
  assoc_id?: number | null;
  fk_asset_logs_status_before?: { status: string } | null;
  fk_asset_logs_status_after?: { status: string } | null;
  fk_asset_logs_assoc_id?: {
    equipment?: {
      uuid: string;
      serial_number?: string;
      model?: string;
      iccid?: string;
      radio?: string;
      line_number?: number;
    };
    chip?: {
      uuid: string;
      serial_number?: string;
      model?: string;
      iccid?: string;
      radio?: string;
      line_number?: number;
    };
    client?: {
      uuid: string;
      nome: string;
    };
  } | null;
}

export const getAssetLogsWithRelations = async (): Promise<AssetLogWithRelations[]> => {
  try {
    if (import.meta.env.DEV) console.log('Buscando logs de assets com relações...');
    
    // Query atualizada com LEFT JOINs para lidar com assoc_id NULL
    const { data, error } = await supabase
      .from('asset_logs')
      .select(`
        id,
        date,
        event,
        details,
        status_before_id,
        status_after_id,
        assoc_id,
        fk_asset_logs_status_before:asset_status!fk_asset_logs_status_before(status),
        fk_asset_logs_status_after:asset_status!fk_asset_logs_status_after(status),
        fk_asset_logs_assoc_id:associations!left(
          equipment:assets!equipment_id(
            uuid,
            serial_number,
            model,
            iccid,
            radio,
            line_number
          ),
          chip:assets!chip_id(
            uuid,
            serial_number,
            model,
            iccid,
            radio,
            line_number
          ),
          client:clients!client_id(
            uuid,
            nome
          )
        )
      `)
      .order('date', { ascending: false })
      .limit(100); // Limita a 100 registros mais recentes para performance

    if (error) {
      if (import.meta.env.DEV) console.error('Erro detalhado ao buscar logs de assets:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Falha ao carregar histórico: ${error.message}`);
    }

    if (!data || data.length === 0) {
      if (import.meta.env.DEV) console.warn('Nenhum log encontrado na base de dados');
      return [];
    }

    // Mapear os dados para a interface esperada, lidando com assoc_id NULL
    const mappedData = data.map((log: AssetLogWithRelationsRaw) => ({
      id: log.id,
      date: log.date,
      event: log.event,
      details: log.details,
      status_before_id: log.status_before_id,
      status_after_id: log.status_after_id,
      assoc_id: log.assoc_id, // Pode ser NULL agora
      status_before: log.fk_asset_logs_status_before,
      status_after: log.fk_asset_logs_status_after,
      association: log.fk_asset_logs_assoc_id // Pode ser NULL se assoc_id for NULL
    }));

    if (import.meta.env.DEV) console.log(`Carregados ${mappedData.length} logs de assets com sucesso`);
    return mappedData;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Erro no serviço de logs:', error);
    // Retorna array vazio em caso de erro para evitar quebra da UI
    return [];
  }
};

/**
 * Formata detalhes do log (campo JSONB) para exibição amigável
 * ATUALIZADO: Melhor tratamento para eventos sem associação
 */
interface LogDetails {
  event_description?: string;
  line_number?: number;
  radio?: string;
  solution_name?: string;
  solution?: string;
  client_name?: string;
  [key: string]: unknown;
}

export const formatLogDetails = (details: LogDetails | string | null): string => {
  if (!details) return 'Nenhum detalhe disponível';
  
  try {
    // Se for string, tenta fazer parse
    const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
    
    // Extrai informações relevantes para o usuário
    const formattedParts: string[] = [];
    
    if (parsedDetails.event_description) {
      formattedParts.push(parsedDetails.event_description);
    }
    
    if (parsedDetails.line_number) {
      formattedParts.push(`Linha: ${parsedDetails.line_number}`);
    }
    
    if (parsedDetails.radio) {
      formattedParts.push(`Rádio: ${parsedDetails.radio}`);
    }
    
    if (parsedDetails.solution_name || parsedDetails.solution) {
      formattedParts.push(`Solução: ${parsedDetails.solution_name || parsedDetails.solution}`);
    }
    
    // Adicionar informação sobre cliente se disponível
    if (parsedDetails.client_name) {
      formattedParts.push(`Cliente: ${parsedDetails.client_name}`);
    }
    
    return formattedParts.length > 0 ? formattedParts.join(' | ') : 'Evento do sistema';
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Erro ao formatar detalhes do log:', error);
    return 'Detalhes não formatáveis';
  }
};

export const formatEventName = (event: string): string => {
  const eventTranslations: Record<string, string> = {
    'INSERT': 'Criação',
    'UPDATE': 'Atualização',
    'DELETE': 'Remoção',
    'STATUS_UPDATED': 'Status Atualizado',
    'ASSET_CRIADO': 'Ativo Criado',
    'SOFT_DELETE': 'Ativo Removido',
    'ASSOCIATION_CREATED': 'Associação Criada',
    'ASSOCIATION_REMOVED': 'Associação Removida',
    'ASSOCIATION_STATUS_UPDATED': 'Status da Associação Atualizado',
    'ASSOCIATION_MODIFIED': 'Associação Modificada'
  };
  
  return eventTranslations[event] || event;
};

export const historyService = {
  getAssetLogsWithRelations,
  formatLogDetails,
  formatEventName
};
