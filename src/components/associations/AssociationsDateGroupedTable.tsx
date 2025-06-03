
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AssociationGroupRow } from "./AssociationGroupRow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar } from "lucide-react";
import { Association, AssociationGroup } from '@/types/associations';
import { DateGroup } from '@/utils/dateGroupingUtils';

interface AssociationsDateGroupedTableProps {
  dateGroups: DateGroup[];
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

export const AssociationsDateGroupedTable: React.FC<AssociationsDateGroupedTableProps> = ({
  dateGroups,
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
  const totalAssociations = dateGroups.reduce((sum, group) => sum + group.associations.length, 0);

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
            {dateGroups.map((dateGroup) => (
              <React.Fragment key={dateGroup.date}>
                {/* Cabeçalho do grupo de data */}
                <TableRow className="bg-muted/20 hover:bg-muted/30">
                  <TableCell colSpan={6} className="font-medium text-center py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-primary font-semibold">
                        {dateGroup.label}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        ({dateGroup.associations.length} associaç{dateGroup.associations.length === 1 ? 'ão' : 'ões'})
                      </span>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Associações agrupadas por cliente dentro desta data */}
                {Object.entries(groupedAssociations)
                  .filter(([_, group]) => 
                    group.associations.some(assoc => 
                      dateGroup.associations.some(dateAssoc => dateAssoc.id === assoc.id)
                    )
                  )
                  .map(([groupKey, group]) => (
                    <AssociationGroupRow
                      key={groupKey}
                      group={{
                        ...group,
                        associations: group.associations.filter(assoc =>
                          dateGroup.associations.some(dateAssoc => dateAssoc.id === assoc.id)
                        )
                      }}
                      onEditAssociation={onEditAssociation}
                      onEndAssociation={onEndAssociation}
                      onEndGroup={onEndGroup}
                      isEndingAssociation={isEndingAssociation}
                      isEndingGroup={isEndingGroup}
                    />
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Estatísticas */}
      <div className="text-sm text-muted-foreground text-center">
        Mostrando {totalAssociations} associações de {totalCount} associações totais
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
