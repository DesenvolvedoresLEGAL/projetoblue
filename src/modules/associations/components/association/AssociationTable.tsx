
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AssociationGroup, PaginationOptions } from '../../types/associationsList';
import { AssociationTableRow } from './AssociationTableRow';

interface AssociationTableProps {
  associationGroups: AssociationGroup[];
  pagination: PaginationOptions;
  onPaginationChange: (pagination: Partial<PaginationOptions>) => void;
  onFinalizeAssociation: (associationId: string) => Promise<void>;
  onToggleGroupExpansion: (clientId: string) => void;
}

export const AssociationTable: React.FC<AssociationTableProps> = ({
  associationGroups,
  pagination,
  onPaginationChange,
  onFinalizeAssociation,
  onToggleGroupExpansion
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const hasNextPage = pagination.page < totalPages;
  const hasPreviousPage = pagination.page > 1;

  const handlePageChange = (newPage: number) => {
    onPaginationChange({ page: newPage });
  };

  if (associationGroups.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Nenhuma associação encontrada</h3>
          <p className="text-muted-foreground">
            Não foram encontradas associações com os filtros aplicados.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">Associações</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associationGroups.map(group => (
                <AssociationTableRow
                  key={group.client_id}
                  group={group}
                  onFinalizeAssociation={onFinalizeAssociation}
                  onToggleExpansion={onToggleGroupExpansion}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {associationGroups.map(group => (
          <AssociationTableRow
            key={group.client_id}
            group={group}
            onFinalizeAssociation={onFinalizeAssociation}
            onToggleExpansion={onToggleGroupExpansion}
            isMobile
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {pagination.page} de {totalPages} • {pagination.total} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!hasNextPage}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
