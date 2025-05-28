
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AssociationTableRow } from "./AssociationTableRow";
import { Separator } from "@/components/ui/separator";

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

interface AssociationsGroupedTableProps {
  groupedAssociations: Record<string, Association[]>;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEditAssociation: (association: Association) => void;
  onEndAssociation: (associationId: number) => void;
  debouncedSearchTerm: string;
}

export const AssociationsGroupedTable: React.FC<AssociationsGroupedTableProps> = ({
  groupedAssociations,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEditAssociation,
  onEndAssociation,
  debouncedSearchTerm
}) => {
  const clientNames = Object.keys(groupedAssociations).sort();
  const totalAssociations = Object.values(groupedAssociations).reduce((sum, group) => sum + group.length, 0);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data de Início</TableHead>
              <TableHead>Data de Fim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientNames.map((clientName, clientIndex) => (
              <React.Fragment key={clientName}>
                {/* Cabeçalho do Cliente */}
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <td colSpan={7} className="p-4 font-semibold text-primary">
                    <div className="flex items-center gap-2">
                      <span>{clientName}</span>
                      <span className="text-sm text-muted-foreground">
                        ({groupedAssociations[clientName].length} associaç{groupedAssociations[clientName].length === 1 ? 'ão' : 'ões'})
                      </span>
                    </div>
                  </td>
                </TableRow>
                
                {/* Associações do Cliente */}
                {groupedAssociations[clientName].map((association) => (
                  <AssociationTableRow
                    key={association.id}
                    association={association}
                    onEdit={onEditAssociation}
                    onEndAssociation={onEndAssociation}
                  />
                ))}
                
                {/* Separador entre grupos (exceto o último) */}
                {clientIndex < clientNames.length - 1 && (
                  <TableRow>
                    <td colSpan={7} className="p-0">
                      <Separator />
                    </td>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Estatísticas */}
      <div className="text-sm text-muted-foreground text-center">
        Mostrando {totalAssociations} de {totalCount} associações em {clientNames.length} cliente{clientNames.length === 1 ? '' : 's'}
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
