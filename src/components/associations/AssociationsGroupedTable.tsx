import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AssociationGroupRow } from "./AssociationGroupRow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  client_name: string;
  asset_iccid: string | null;
  asset_radio: string | null;
  asset_line_number: number | null;
  asset_solution_id: number;
  asset_solution_name: string;
}

interface AssociationGroup {
  groupKey: string;
  client_name: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  associations: Association[];
  totalAssets: number;
  assetTypes: { [key: string]: number };
  canEndGroup: boolean;
}

interface AssociationsGroupedTableProps {
  groupedAssociations: Record<string, AssociationGroup>;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEditAssociation: (association: Association) => void;
  onEndAssociation: (associationId: number) => void;
  onEndGroup: (groupKey: string) => void;
  debouncedSearchTerm: string;
  isEndingAssociation?: boolean;
  isEndingGroup?: boolean;
  operationProgress?: { current: number; total: number };
}

export const AssociationsGroupedTable: React.FC<AssociationsGroupedTableProps> = ({
  groupedAssociations,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEditAssociation,
  onEndAssociation,
  onEndGroup,
  debouncedSearchTerm,
  isEndingAssociation = false,
  isEndingGroup = false,
  operationProgress = { current: 0, total: 0 }
}) => {
  const groupKeys = Object.keys(groupedAssociations).sort((a, b) => {
    const groupA = groupedAssociations[a];
    const groupB = groupedAssociations[b];
    
    // Ordenar por cliente, depois por data de entrada
    if (groupA.client_name !== groupB.client_name) {
      return groupA.client_name.localeCompare(groupB.client_name);
    }
    return new Date(groupB.entry_date).getTime() - new Date(groupA.entry_date).getTime();
  });
  
  const totalAssociations = Object.values(groupedAssociations)
    .reduce((sum, group) => sum + group.associations.length, 0);
  const totalGroups = groupKeys.length;

  return (
    <>
      {/* Indicador de operação em progresso */}
      {isEndingGroup && (
        <Alert className="mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Encerrando associações em lote... Esta operação pode levar alguns segundos.
            {operationProgress.total > 0 && (
              <span className="ml-2">
                ({operationProgress.current}/{operationProgress.total})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Cliente / Ativos</TableHead>
              <TableHead>Data de Início</TableHead>
              <TableHead>Data de Fim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[200px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupKeys.map((groupKey) => (
              <AssociationGroupRow
                key={groupKey}
                group={groupedAssociations[groupKey]}
                onEditAssociation={onEditAssociation}
                onEndAssociation={onEndAssociation}
                onEndGroup={onEndGroup}
                isEndingAssociation={isEndingAssociation}
                isEndingGroup={isEndingGroup}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Estatísticas */}
      <div className="text-sm text-muted-foreground text-center">
        Mostrando {totalAssociations} associações em {totalGroups} grupo{totalGroups === 1 ? '' : 's'} de {totalCount} associações totais
        {debouncedSearchTerm && ` (filtradas por "${debouncedSearchTerm}")`}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};
