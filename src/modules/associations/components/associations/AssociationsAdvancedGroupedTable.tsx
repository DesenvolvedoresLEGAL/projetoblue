
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Association } from '@/types/associations';
import { ClientStartDateGroup, getClientStartDateGroupStats } from '@/utils/timestampGroupingUtils';
import { CompanyGroupAccordion } from './CompanyGroupAccordion';

interface AssociationsAdvancedGroupedTableProps {
  clientStartDateGroups: ClientStartDateGroup[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEditAssociation: (association: Association) => void;
  onEndAssociation: (associationId: number, assetId: string) => void;
  onEndGroup: (groupKey: string) => void;
  debouncedSearchTerm: string;
  isEndingAssociation: boolean;
  isEndingGroup: boolean;
  operationProgress?: { current: number; total: number; };
}

export const AssociationsAdvancedGroupedTable: React.FC<AssociationsAdvancedGroupedTableProps> = ({
  clientStartDateGroups,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEditAssociation,
  onEndAssociation,
  onEndGroup,
  debouncedSearchTerm,
  isEndingAssociation,
  isEndingGroup,
  operationProgress
}) => {
  const { totalAssociations, totalClientStartDateGroups, totalCompanyGroups } = getClientStartDateGroupStats(clientStartDateGroups);

  console.log(`Total de associações -> ${totalAssociations}`);
  console.log(`Total de grupos por cliente e data de entrada -> ${totalClientStartDateGroups}`);
  console.log(`Total de grupos por empresa -> ${totalCompanyGroups}`);

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {/* Estatísticas comentadas temporariamente
        <span>{totalAssociations} associações</span>
        <span>•</span>
        <span>{totalClientStartDateGroups} grupos por cliente/data</span>
        <span>•</span>
        <span>{totalCompanyGroups} grupos por empresa</span> */}
        {/* {operationProgress && (
          <>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {operationProgress.current}/{operationProgress.total}
            </span>
          </>
        )} */}
      </div>

      {/* Grupos por Cliente e Data de Entrada */}
      <div className="space-y-4">
        {clientStartDateGroups.map((clientGroup, groupIndex) => (
          <div key={clientGroup.groupKey}>
            {/* Separador visual entre grupos (exceto antes do primeiro) */}
            {groupIndex > 0 && (
              <div className="client-group-separator h-3 bg-gradient-to-r from-green-200 via-green-300 to-green-200 shadow-sm rounded-full mx-4 my-4" 
                   aria-hidden="true" />
            )}
            
            {/* Card para o grupo de cliente + data de entrada */}
            <Card className="shadow-sm border-l-4 border-l-green-500">
              <CardContent className="p-4">
                {/* Header do grupo */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {clientGroup.client_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Data de entrada: {clientGroup.entry_date} • {clientGroup.totalAssociations} associações
                  </p>
                </div>

                {/* Accordion de empresas */}
                <CompanyGroupAccordion
                  companyGroups={clientGroup.companyGroups}
                  onEditAssociation={onEditAssociation}
                  onEndAssociation={onEndAssociation}
                  onEndGroup={onEndGroup}
                  debouncedSearchTerm={debouncedSearchTerm}
                  isEndingAssociation={isEndingAssociation}
                  isEndingGroup={isEndingGroup}
                />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
