
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AssetHistory {
  id: string;
  assetId: string;
  action: string;
  timestamp: string;
  details: any;
  event?: string;
  date?: string;
  client_name?: string;
  asset_name?: string;
  old_status?: string;
  new_status?: string;
  user_email?: string;
  description?: string;
}

export const useAssetHistory = (assetId?: string) => {
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!assetId) return;
    
    setIsLoading(true);
    // Simulação - em produção seria uma chamada à API
    setTimeout(() => {
      setHistory([]);
      setIsLoading(false);
    }, 1000);
  }, [assetId]);

  // Add the missing properties that History.tsx expects
  const historyLogs = history;

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const formatEventName = (event: string): string => {
    const eventTranslations: Record<string, string> = {
      'INSERT': 'Ativo criado',
      'UPDATE': 'Dados atualizados',
      'DELETE': 'Ativo excluído',
      'STATUS_UPDATED': 'Status alterado',
      'ASSET_CRIADO': 'Ativo criado',
      'SOFT_DELETE': 'Ativo removido',
      'ASSOCIATION_CREATED': 'Nova associação',
      'ASSOCIATION_REMOVED': 'Associação removida',
      'DISASSOCIATION': 'Associação encerrada',
      'ASSOCIATION_ENDED': 'Associação encerrada'
    };
    
    return eventTranslations[event] || event;
  };

  return {
    history,
    historyLogs,
    isLoading,
    error,
    formatDate,
    formatEventName,
    refetch: () => {
      // Implementar refetch se necessário
    }
  };
};
