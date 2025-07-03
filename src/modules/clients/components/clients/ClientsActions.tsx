
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { exportClientsToCSV } from '@/utils/clientsExport';
import { toast } from 'sonner';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { usePermissions } from '@/hooks/usePermissions';

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

interface ClientsActionsProps {
  clients: Client[];
  filteredClients: Client[];
}

export const ClientsActions: React.FC<ClientsActionsProps> = ({
  clients,
  filteredClients
}) => {
  const navigate = useNavigate();
  const { canCreateClients, canExportData } = usePermissions();

  const handleExportCSV = () => {
    try {
      const clientsToExport = filteredClients.length > 0 ? filteredClients : clients;
      const filename = exportClientsToCSV(clientsToExport);
      toast.success(`Arquivo ${filename} exportado com sucesso!`);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar arquivo CSV. Tente novamente.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
      <RoleGuard requiredRole="suporte">
        <Button
          className="bg-[#4D2BFB] text-white hover:bg-[#3a1ecc] focus:ring-[#4D2BFB] flex items-center gap-2 w-full sm:w-auto h-10 sm:h-9 text-sm"
          onClick={() => navigate('/clients/register')}
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </RoleGuard>

      <RoleGuard requiredRole="suporte">
        <Button 
          variant="outline" 
          className="border-[#03F9FF] text-[#020CBC] hover:bg-[#03F9FF]/10 focus:ring-[#03F9FF] flex items-center gap-2 w-full sm:w-auto h-10 sm:h-9 text-sm"
          onClick={handleExportCSV}
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </RoleGuard>
    </div>
  );
};
