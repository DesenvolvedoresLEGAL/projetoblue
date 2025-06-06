
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Association } from '@/types/associations';
import { TimestampGroup, getTimestampGroupStats } from '@/utils/timestampGroupingUtils';
import { CompanyGroupAccordion } from './CompanyGroupAccordion';

interface AssociationsAdvancedGroupedTableProps {
  timestampGroups: TimestampGroup[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEditAssociation: (association: Association) => void;
  onEndAssociation: (associationId: number) => void;
  debouncedSearchTerm: string;
  isEndingAssociation: boolean;
  operationProgress?: { current: number; total: number; };
}

export const AssociationsAdvancedGroupedTable: React.FC<AssociationsAdvancedGroupedTableProps> = ({
  timestampGroups,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEditAssociation,
  onEndAssociation,
  debouncedSearchTerm,
  isEndingAssociation,
  operationProgress
}) => {
  const { totalAssociations, totalTimestampGroups, totalCompanyGroups } = getTimestampGroupStats(timestampGroups);

  console.log(`Total de associações -> ${totalAssociations}`);
  console.log(`Total de grupos por data de criação -> ${totalTimestampGroups}`);
  console.log(`Total de grupos por cliente -> ${totalCompanyGroups}`);

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {/* <span>{totalAssociations} associações</span>
        <span>•</span>
        <span>{totalTimestampGroups} grupos por timestamp</span>
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

      {/* Grupos por Timestamp */}
      <div className="space-y-6">
        {timestampGroups.map((timestampGroup, groupIndex) => (
          <div key={timestampGroup.timestamp}>
            {/* Separador visual forte entre grupos de timestamp (exceto antes do primeiro) */}
            {groupIndex > 0 && (
              <div className="timestamp-group-separator h-4 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 shadow-sm rounded-full mx-4 my-6" 
                   aria-hidden="true" />
            )}
            
            {/* Card para o grupo de timestamp */}
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                {/* Accordion de empresas */}
                <CompanyGroupAccordion
                  companyGroups={timestampGroup.companyGroups}
                  onEditAssociation={onEditAssociation}
                  onEndAssociation={onEndAssociation}
                  debouncedSearchTerm={debouncedSearchTerm}
                  isEndingAssociation={isEndingAssociation}
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
