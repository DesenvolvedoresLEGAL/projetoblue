/**
 * Utilitários para formatação e padronização de eventos do sistema
 * Usado principalmente no card de "Atividades Recentes"
 * 
 * CORRIGIDO: Melhor remoção de duplicatas e formatação de datas
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
  
  if (desc.includes('criado') || desc.includes('create') || desc.includes('insert') || desc.includes('asset_criado')) {
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
      
    case 'association': {
      const clientInfo = client ? ` ao cliente ${client}` : '';
      return `Associação: ${assetType} ${assetName} foi associado${clientInfo}`;
    }
      
    case 'status_change': {
      if (status?.from && status?.to) {
        return `Status atualizado: ${assetType} ${assetName} mudou de "${status.from}" para "${status.to}"`;
      }
      return `Status: ${assetType} ${assetName} teve seu status atualizado`;
    }
      
    case 'update':
      return `Atualização: ${assetType} ${assetName} foi atualizado`;
      
    default:
      return `Evento: ${assetType} ${assetName} - atividade registrada`;
  }
};

/**
 * Formata data para o padrão brasileiro com validação robusta
 */
export const formatBrazilianDateTime = (dateString: string): string => {
  try {
    // Validate input
    if (!dateString || dateString === 'undefined' || dateString === 'null') {
      return 'Data não disponível';
    }

    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      
      return 'Data inválida';
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    
    return 'Data inválida';
  }
};

/**
 * Remove eventos duplicados com critérios melhorados
 * CORRIGIDO: Melhor detecção de duplicatas considerando asset_id, evento e janela de tempo
 */
export const removeDuplicateEvents = <T extends { 
  id: string; 
  date: string; 
  assetType: string; 
  name: string; 
  description: string;
  event?: string;
  asset_id?: string;
  timestamp?: number;
}>(events: T[]): T[] => {
  if (!events || events.length === 0) return [];

  const uniqueEvents = new Map<string, T>();
  const timeWindow = 60000; // 1 minute window for duplicate detection
  
  // Sort events by timestamp (most recent first)
  const sortedEvents = events.sort((a, b) => {
    const timeA = a.timestamp || new Date(a.date).getTime();
    const timeB = b.timestamp || new Date(b.date).getTime();
    return timeB - timeA;
  });

  sortedEvents.forEach(event => {
    const eventTime = event.timestamp || new Date(event.date).getTime();
    
    // Create a more specific unique key based on asset and event type
    const assetIdentifier = event.asset_id || `${event.assetType}-${event.name}`;
    const eventType = event.event || event.description;
    
    // Check for duplicates within time window
    let isDuplicate = false;
    
    for (const [existingKey, existingEvent] of uniqueEvents.entries()) {
      const existingTime = existingEvent.timestamp || new Date(existingEvent.date).getTime();
      const existingAssetId = existingEvent.asset_id || `${existingEvent.assetType}-${existingEvent.name}`;
      const existingEventType = existingEvent.event || existingEvent.description;
      
      // Same asset and similar event type within time window
      if (existingAssetId === assetIdentifier && 
          existingEventType === eventType &&
          Math.abs(eventTime - existingTime) < timeWindow) {
        
        isDuplicate = true;
        
        // Keep the more informative event (prefer ASSOCIATION_CREATED over STATUS_UPDATED)
        if (shouldReplaceEvent(existingEvent, event)) {
          uniqueEvents.delete(existingKey);
          break;
        }
      }
    }
    
    if (!isDuplicate) {
      const uniqueKey = `${assetIdentifier}-${eventType}-${Math.floor(eventTime / timeWindow)}`;
      uniqueEvents.set(uniqueKey, event);
    }
  });
  
  return Array.from(uniqueEvents.values())
    .sort((a, b) => {
      const timeA = a.timestamp || new Date(a.date).getTime();
      const timeB = b.timestamp || new Date(b.date).getTime();
      return timeB - timeA; // Most recent first
    });
};

/**
 * Determina qual evento deve ser mantido em caso de duplicatas
 */
const shouldReplaceEvent = (existing: StandardizedEvent, incoming: StandardizedEvent): boolean => {
  // Priority order: ASSOCIATION_CREATED > ASSET_CRIADO > STATUS_UPDATED > others
  const eventPriority = {
    'ASSOCIATION_CREATED': 4,
    'ASSOCIATION_REMOVED': 4,
    'ASSET_CRIADO': 3,
    'ASSET_SOFT_DELETE': 3,
    'STATUS_UPDATED': 2,
    'ASSOCIATION_STATUS_UPDATED': 1
  };
  
  const existingPriority = eventPriority[existing.event] || 0;
  const incomingPriority = eventPriority[incoming.event] || 0;
  
  return incomingPriority > existingPriority;
};

/**
 * Valida se um evento contém informações mínimas necessárias
 */
export const isValidEvent = (event: Partial<StandardizedEvent>): boolean => {
  return !!(event?.id && event?.date && (event?.assetType || event?.description));
};

/**
 * Trunca texto longo mantendo legibilidade
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) return text || '';
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

/**
 * Gera cor de badge baseada no tipo de ativo
 */
export const getAssetTypeBadgeColor = (assetType: string): string => {
  if (!assetType) return 'bg-gray-100 text-gray-800';
  
  switch (assetType.toUpperCase()) {
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

/**
 * Melhora a mensagem de evento baseada nos detalhes disponíveis
 */
export const improveEventMessage = (event: StandardizedEvent): string => {
  const details = event.details || {};
  const assetName = event.name || details.radio || details.line_number || 'Ativo';
  const clientName = details.client_name || '';
  
  // Generate message based on event type
  switch (event.event) {
    case 'ASSET_CRIADO':
      return `Cadastro: ${event.assetType} ${assetName} foi cadastrado no sistema`;
      
    case 'ASSOCIATION_CREATED': {
      const clientInfo = clientName ? ` para ${clientName}` : '';
      return `Associação: ${event.assetType} ${assetName} foi associado${clientInfo}`;
    }
      
    case 'ASSOCIATION_REMOVED':
      return `Desassociação: ${event.assetType} ${assetName} foi desassociado`;
      
    case 'STATUS_UPDATED': {
      const oldStatus = event.old_status?.status || '';
      const newStatus = event.new_status?.status || '';
      if (oldStatus && newStatus) {
        return `Status: ${event.assetType} ${assetName} mudou de "${oldStatus}" para "${newStatus}"`;
      }
      return `Status: ${event.assetType} ${assetName} teve status atualizado`;
    }
      
    case 'ASSET_SOFT_DELETE':
      return `Remoção: ${event.assetType} ${assetName} foi removido do sistema`;
      
    default:
      return generateStandardMessage({
        id: event.id,
        type: mapEventType(event.description),
        assetType: event.assetType,
        assetName: assetName,
        description: event.description,
        date: event.date,
        status: {
          from: event.old_status?.status,
          to: event.new_status?.status
        },
        client: clientName
      });
  }
};
