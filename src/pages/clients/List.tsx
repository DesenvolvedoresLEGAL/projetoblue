
import React from 'react';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { FileUser } from 'lucide-react';
import { ClientsLoadingState } from '@/components/clients/ClientsLoadingState';
import { ClientsErrorState } from '@/components/clients/ClientsErrorState';
import { ClientsActions } from '@/components/clients/ClientsActions';
import { ClientsListView } from '@/components/clients/ClientsListView';
import { useClientsData } from '@/hooks/useClientsData';

const Clients = () => {
  const {
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
  } = useClientsData();

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
        <ClientsActions clients={clients} filteredClients={filteredClients} />
      </StandardPageHeader>

      {/* Lista de Clientes */}
      <ClientsListView
        filteredClients={filteredClients}
        clientLogs={clientLogs}
        expandedClients={expandedClients}
        onToggleExpansion={toggleClientExpansion}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onClearFilters={clearFilters}
      />
    </div>
  );
};

export default Clients;
