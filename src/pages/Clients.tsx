import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { Plus, Download, FileUser } from 'lucide-react';
import { ClientsLoadingState } from '@/components/clients/ClientsLoadingState';
import { ClientsErrorState } from '@/components/clients/ClientsErrorState';
import { ClientsEmptyState } from '@/components/clients/ClientsEmptyState';
import { ClientsFilters } from '@/components/clients/ClientsFilters';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientEditDialog } from '@/components/clients/ClientEditDialog';
import { exportClientsToCSV } from '@/utils/clientsExport';
import { toast } from 'sonner';

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

const Clients = () => {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Buscar todos os clientes (apenas não deletados)
  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('uuid, empresa, responsavel, telefones, cnpj, email, created_at, updated_at, deleted_at')
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
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !client.deleted_at) ||
      (statusFilter === 'inactive' && !!client.deleted_at);
    
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

  // Função para abrir modal de edição
  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  // Função para fechar modal de edição
  const closeEditModal = () => {
    setSelectedClient(null);
    setIsEditModalOpen(false);
  };

  // Função para exportar CSV
  const handleExportCSV = () => {
    try {
      const clientsToExport = filteredClients.length > 0 ? filteredClients : clients;
      const filename = exportClientsToCSV(clientsToExport);
      toast.success(`Arquivo ${filename} exportado com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar arquivo CSV. Tente novamente.');
    }
  };

  // Renderizar estado de loading
  if (isLoading) {
    return <ClientsLoadingState />;
  }

  // Renderizar estado de erro
  if (clientsError) {
    return <ClientsErrorState error={clientsError} />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 py-4 sm:py-6">
      {/* Header com StandardPageHeader */}
      <StandardPageHeader
        icon={FileUser}
        title="Clientes"
        description="Gerencie os clientes cadastrados no sistema"
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Button className="bg-[#4D2BFB] text-white hover:bg-[#3a1ecc] focus:ring-[#4D2BFB] flex items-center gap-2 w-full sm:w-auto h-10 sm:h-9 text-sm">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
          <Button 
            variant="outline" 
            className="border-[#03F9FF] text-[#020CBC] hover:bg-[#03F9FF]/10 focus:ring-[#03F9FF] flex items-center gap-2 w-full sm:w-auto h-10 sm:h-9 text-sm"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </StandardPageHeader>

      {/* Filtros e Busca */}
      <ClientsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={clearFilters}
      />

      {/* Resultados */}
      {filteredClients.length === 0 ? (
        <ClientsEmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
      ) : (
        <ClientsTable
          clients={filteredClients}
          clientLogs={clientLogs}
          expandedClients={expandedClients}
          onToggleExpansion={toggleClientExpansion}
          onEditClient={openEditModal}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
        />
      )}

      {/* Modal de Edição */}
      <ClientEditDialog
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        client={selectedClient}
      />
    </div>
  );
};

export default Clients;
