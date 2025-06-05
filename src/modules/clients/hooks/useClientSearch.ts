
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { mapDatabaseClientToFrontend } from '@/utils/clientMappers';

export const useClientSearch = (searchTerm: string) => {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .is('deleted_at', null)
        .order('empresa');
      
      if (error) throw error;
      return (data || []).map(mapDatabaseClientToFrontend);
    }
  });

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const searchLower = searchTerm.toLowerCase();
    const numericSearch = searchTerm.replace(/\D/g, '');
    
    return clients.filter(client => {
      // Busca por empresa
      if (client.empresa.toLowerCase().includes(searchLower)) return true;
      
      // Busca por responsável
      if (client.responsavel.toLowerCase().includes(searchLower)) return true;
      
      // Busca por email
      if (client.email && client.email.toLowerCase().includes(searchLower)) return true;
      
      // Busca por telefones (tanto formatado quanto apenas números)
      if (client.telefones && client.telefones.length > 0) {
        return client.telefones.some(tel => {
          // Busca no telefone formatado
          if (tel.includes(searchTerm)) return true;
          
          // Busca apenas nos números (remove formatação)
          const telNumeric = tel.replace(/\D/g, '');
          if (numericSearch.length >= 4 && telNumeric.includes(numericSearch)) return true;
          
          return false;
        });
      }
      
      return false;
    });
  }, [clients, searchTerm]);

  return {
    clients: filteredClients,
    isLoading,
    allClients: clients
  };
};
