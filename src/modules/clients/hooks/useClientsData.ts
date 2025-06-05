import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Client {
  uuid: string;
  empresa: string;
  responsavel: string;
  telefones: string[];
  cnpj?: string;
  email?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface ClientLog {
  id: string;
  client_id: string;
  event_type: string;
  details: any;
  old_data?: any;
  new_data?: any;
  date: string;
  performed_by_email?: string;
}

export const useClientsData = () => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Buscar todos os clientes (apenas não deletados por padrão)
  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('uuid, empresa, responsavel, telefones, cnpj, email, created_at, updated_at, deleted_at')
        .is('deleted_at', null) // Excluir clientes deletados por padrão
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    }
  });

  // Buscar logs de todos os clientes
  const { data: clientLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['client-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_logs')
        .select('id, client_id, event_type, details, old_data, new_data, date, performed_by_email')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as ClientLog[];
    }
  });

  const isLoading = clientsLoading || logsLoading;

  // Filter clients based on search term and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefones?.some(tel => tel.includes(searchTerm));
    
    // Como agora já filtramos na query principal, o status filter pode ser mais simples
    // Mantemos para compatibilidade caso seja necessário ver clientes inativos futuramente
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !client.deleted_at);
    
    return matchesSearch && matchesStatus;
  });

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Função para alternar expansão do cliente
  const toggleClientExpansion = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  return {
    clients,
    clientLogs,
    filteredClients,
    isLoading,
    clientsError,
    expandedClients,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clearFilters,
    toggleClientExpansion
  };
};
