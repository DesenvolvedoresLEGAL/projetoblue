
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { FileUser } from 'lucide-react';

interface ClientsErrorStateProps {
  error: Error;
}

export const ClientsErrorState: React.FC<ClientsErrorStateProps> = ({ error }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
      <StandardPageHeader
        icon={FileUser}
        title="Clientes"
        description="Gerencie os clientes cadastrados no sistema"
      />
      
      <Card className="border border-red-200 rounded-lg">
        <CardContent className="p-6">
          <div className="text-center py-10">
            <p className="text-red-600 mb-4 font-medium">Erro ao carregar clientes. Tente novamente.</p>
            <p className="text-sm text-gray-600">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
