
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

  if (import.meta.env.DEV) console.log(`Total de associações -> ${totalAssociations}`);
  if (import.meta.env.DEV) console.log(`Total de grupos por cliente e data de entrada -> ${totalClientStartDateGroups}`);
  if (import.meta.env.DEV) console.log(`Total de grupos por empresa -> ${totalCompanyGroups}`);

  return (
    <div className="space-y-6">
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
      <div className="space-y-6">
        {clientStartDateGroups.map((clientGroup, groupIndex) => (
          <div key={clientGroup.groupKey}>
            {/* Separador visual entre grupos (exceto antes do primeiro) */}
            {groupIndex > 0 && (
              <div className="client-group-separator h-4 bg-gradient-to-r from-legal-primary/20 via-legal-primary/40 to-legal-primary/20 shadow-legal-sm rounded-full mx-6 my-6" 
                   aria-hidden="true" />
            )}
            
            {/* Card para o grupo de cliente + data de entrada */}
            <Card className="shadow-legal border-l-4 border-l-legal-primary bg-card dark:bg-bg-secondary-dark transition-all duration-200 hover:shadow-legal-md dark:hover:shadow-legal-dark">
              <CardContent className="p-6">
                {/* Header do grupo */}
                <div className="mb-6">
                  <h3 className="text-legal-h3 lg:text-legal-h3-lg font-semibold text-legal-dark dark:text-text-primary-dark">
                    {clientGroup.client_name}
                  </h3>
                  <p className="text-legal-label lg:text-legal-label-lg text-muted-foreground mt-2">
                    Data de entrada: <span className="font-medium text-legal-primary">{clientGroup.entry_date}</span> • <span className="font-medium text-legal-secondary">{clientGroup.totalAssociations} associações</span>
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
        <div className="flex items-center justify-between p-4 bg-muted/20 dark:bg-bg-tertiary-dark rounded-lg border border-legal-primary/20">
          <div className="text-legal-label lg:text-legal-label-lg text-muted-foreground">
            Página <span className="font-medium text-legal-primary">{currentPage}</span> de <span className="font-medium text-legal-primary">{totalPages}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-legal-primary/30 text-legal-primary hover:bg-legal-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-legal-primary/30 text-legal-primary hover:bg-legal-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
