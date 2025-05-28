
import React from 'react';
import { Users } from "lucide-react";

interface AssociationsEmptyProps {
  debouncedSearchTerm: string;
  statusFilter: string;
  hasActiveDateFilters: boolean;
  dateValidationError: string | null;
}

export const AssociationsEmpty: React.FC<AssociationsEmptyProps> = ({
  debouncedSearchTerm,
  statusFilter,
  hasActiveDateFilters,
  dateValidationError
}) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <div className="text-lg font-medium mb-2">Nenhuma associação encontrada</div>
      <div className="text-sm">
        {debouncedSearchTerm || statusFilter !== 'all' || hasActiveDateFilters || dateValidationError
          ? 'Tente ajustar os filtros de busca ou corrigir as datas inválidas'
          : 'Não há associações cadastradas no sistema'
        }
      </div>
    </div>
  );
};
