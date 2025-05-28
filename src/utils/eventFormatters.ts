
/**
 * Utilitários para formatação e padronização de eventos do sistema
 * Usado principalmente no card de "Atividades Recentes"
 */

export interface StandardizedEvent {
  id: string;
  type: 'creation' | 'deletion' | 'association' | 'status_change' | 'update' | 'other';
  assetType: string;
  assetName: string;
  description: string;
  date: string;
  status?: {
    from?: string;
    to?: string;
  };
  client?: string;
}

/**
 * Mapeia tipos de eventos do banco para tipos padronizados
 */
export const mapEventType = (eventDescription: string): StandardizedEvent['type'] => {
  const desc = eventDescription.toLowerCase();
  
  if (desc.includes('criado') || desc.includes('create') || desc.includes('insert')) {
    return 'creation';
  }
  
  if (desc.includes('delete') || desc.includes('soft_delete') || desc.includes('removido')) {
    return 'deletion';
  }
  
  if (desc.includes('association') || desc.includes('associa')) {
    return 'association';
  }
  
  if (desc.includes('status_updated') || desc.includes('status')) {
    return 'status_change';
  }
  
  if (desc.includes('update') || desc.includes('atualiz')) {
    return 'update';
  }
  
  return 'other';
};

/**
 * Gera mensagem padronizada baseada no tipo de evento
 */
export const generateStandardMessage = (event: StandardizedEvent): string => {
  const { type, assetType, assetName, status, client } = event;
  
  switch (type) {
    case 'creation':
      return `Cadastro: ${assetType} ${assetName} foi cadastrado no sistema`;
      
    case 'deletion':
      return `Remoção: ${assetType} ${assetName} foi removido do sistema`;
      
    case 'association':
      const clientInfo = client ? ` ao cliente ${client}` : '';
      return `Associação: ${assetType} ${assetName} foi associado${clientInfo}`;
      
    case 'status_change':
      if (status?.from && status?.to) {
        return `Status atualizado: ${assetType} ${assetName} mudou de "${status.from}" para "${status.to}"`;
      }
      return `Status: ${assetType} ${assetName} teve seu status atualizado`;
      
    case 'update':
      return `Atualização: ${assetType} ${assetName} foi atualizado`;
      
    default:
      return `Evento: ${assetType} ${assetName} - atividade registrada`;
  }
};

/**
 * Formata data para o padrão brasileiro
 */
export const formatBrazilianDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Data inválida';
  }
};

/**
 * Remove eventos duplicados baseado em critérios específicos
 */
export const removeDuplicateEvents = <T extends { id: string; date: string; assetType: string; name: string; description: string }>(
  events: T[]
): T[] => {
  const uniqueEvents = new Map<string, T>();
  
  events.forEach(event => {
    // Chave única mais específica para evitar falsos positivos
    const uniqueKey = `${event.assetType}-${event.name}-${event.description}-${new Date(event.date).getTime()}`;
    
    // Mantém apenas se não existe ou se é mais recente
    if (!uniqueEvents.has(uniqueKey) || 
        new Date(event.date) > new Date(uniqueEvents.get(uniqueKey)!.date)) {
      uniqueEvents.set(uniqueKey, event);
    }
  });
  
  return Array.from(uniqueEvents.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Mais recentes primeiro
};

/**
 * Valida se um evento contém informações mínimas necessárias
 */
export const isValidEvent = (event: any): boolean => {
  return !!(event?.id && event?.date && (event?.assetType || event?.description));
};

/**
 * Trunca texto longo mantendo legibilidade
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

/**
 * Gera cor de badge baseada no tipo de ativo
 */
export const getAssetTypeBadgeColor = (assetType: string): string => {
  switch (assetType?.toUpperCase()) {
    case 'CHIP':
      return 'bg-blue-100 text-blue-800';
    case 'SPEEDY 5G':
    case 'SPEEDY':
      return 'bg-purple-100 text-purple-800';
    case 'EQUIPAMENTO':
    case 'EQUIPMENT':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Gera cor de badge baseada no tipo de evento
 */
export const getEventTypeBadgeColor = (eventType: StandardizedEvent['type']): string => {
  switch (eventType) {
    case 'creation':
      return 'bg-emerald-100 text-emerald-800';
    case 'deletion':
      return 'bg-red-100 text-red-800';
    case 'association':
      return 'bg-indigo-100 text-indigo-800';
    case 'status_change':
      return 'bg-amber-100 text-amber-800';
    case 'update':
      return 'bg-cyan-100 text-cyan-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
