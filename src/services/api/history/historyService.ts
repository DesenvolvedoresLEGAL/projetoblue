
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface para logs de asset com dados relacionados
 * Mapeamento baseado na tabela asset_logs com JOINs para dados legíveis
 */
export interface AssetLogWithRelations {
  id: number;
  date: string;
  event: string;
  details: any; // jsonb field
  status_before_id?: number;
  status_after_id?: number;
  assoc_id?: number;
  // Dados relacionados via JOINs
  status_before?: { status: string };
  status_after?: { status: string };
  association?: {
    asset?: {
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
  };
}

/**
 * Busca logs de assets com dados relacionados usando JOINs
 * Query otimizada para carregar status anterior/posterior, associações, assets e clientes
 */
export const getAssetLogsWithRelations = async (): Promise<AssetLogWithRelations[]> => {
  try {
    console.log('Buscando logs de assets com relações...');
    
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
        status_before:status_before_id(status),
        status_after:status_after_id(status),
        association:assoc_id(
          asset:asset_id(
            uuid,
            serial_number,
            model,
            iccid,
            radio,
            line_number
          ),
          client:client_id(
            uuid,
            nome
          )
        )
      `)
      .order('date', { ascending: false })
      .limit(100); // Limita a 100 registros mais recentes para performance

    if (error) {
      console.error('Erro ao buscar logs de assets:', error);
      throw error;
    }

    console.log(`Carregados ${data?.length || 0} logs de assets`);
    return data || [];
  } catch (error) {
    console.error('Erro no serviço de logs:', error);
    return [];
  }
};

/**
 * Formata detalhes do log (campo JSONB) para exibição amigável
 */
export const formatLogDetails = (details: any): string => {
  if (!details) return 'Nenhum detalhe disponível';
  
  try {
    // Se for string, tenta fazer parse
    const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
    
    // Extrai informações relevantes para o usuário
    const formattedParts: string[] = [];
    
    if (parsedDetails.event_description) {
      formattedParts.push(parsedDetails.event_description);
    }
    
    if (parsedDetails.asset_id) {
      formattedParts.push(`Ativo: ${parsedDetails.asset_id}`);
    }
    
    if (parsedDetails.line_number) {
      formattedParts.push(`Linha: ${parsedDetails.line_number}`);
    }
    
    if (parsedDetails.radio) {
      formattedParts.push(`Rádio: ${parsedDetails.radio}`);
    }
    
    if (parsedDetails.solution) {
      formattedParts.push(`Solução: ${parsedDetails.solution}`);
    }
    
    return formattedParts.length > 0 ? formattedParts.join(' | ') : 'Detalhes do sistema';
  } catch (error) {
    console.warn('Erro ao formatar detalhes do log:', error);
    return 'Detalhes não formatáveis';
  }
};

/**
 * Formata evento para exibição em português
 */
export const formatEventName = (event: string): string => {
  const eventTranslations: Record<string, string> = {
    'INSERT': 'Criação',
    'UPDATE': 'Atualização',
    'DELETE': 'Remoção',
    'STATUS_UPDATED': 'Status Atualizado',
    'ASSET_CRIADO': 'Ativo Criado',
    'SOFT_DELETE': 'Ativo Removido',
    'ASSOCIATION': 'Associação',
    'DISASSOCIATION': 'Desassociação'
  };
  
  return eventTranslations[event] || event;
};

export const historyService = {
  getAssetLogsWithRelations,
  formatLogDetails,
  formatEventName
};
