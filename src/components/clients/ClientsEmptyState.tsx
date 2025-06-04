
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ClientsEmptyStateProps {
  searchTerm: string;
  statusFilter: string;
}

export const ClientsEmptyState: React.FC<ClientsEmptyStateProps> = ({ searchTerm, statusFilter }) => {
  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-6">
        <div className="text-center py-10">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2 text-gray-700">Nenhum cliente encontrado</p>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros ou criar um novo cliente.'
              : 'Comece cadastrando o primeiro cliente no sistema.'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
