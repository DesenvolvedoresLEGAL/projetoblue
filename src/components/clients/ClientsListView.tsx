
import React, { useState } from 'react';
import { ClientsFilters } from '@/components/clients/ClientsFilters';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientsEmptyState } from '@/components/clients/ClientsEmptyState';
import { ClientEditDialog } from '@/components/clients/ClientEditDialog';

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

interface ClientsListViewProps {
  filteredClients: Client[];
  clientLogs: ClientLog[];
  expandedClients: Set<string>;
  onToggleExpansion: (clientId: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onClearFilters: () => void;
}

export const ClientsListView: React.FC<ClientsListViewProps> = ({
  filteredClients,
  clientLogs,
  expandedClients,
  onToggleExpansion,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onClearFilters
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  return (
    <>
      {/* Filtros e Busca */}
      <ClientsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={onClearFilters}
      />

      {/* Resultados */}
      {filteredClients.length === 0 ? (
        <ClientsEmptyState searchTerm={searchTerm} statusFilter={statusFilter} />
      ) : (
        <ClientsTable
          clients={filteredClients}
          clientLogs={clientLogs}
          expandedClients={expandedClients}
          onToggleExpansion={onToggleExpansion}
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
    </>
  );
};
