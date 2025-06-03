
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, StopCircle, Loader2 } from "lucide-react";
import { Association } from '@/types/associations';
import { TimestampGroup, getTimestampGroupStats } from '@/utils/timestampGroupingUtils';
import { AssociationStatusBadge } from './AssociationStatusBadge';
import { formatDate } from '@/utils/formatDate';

interface AssociationsTimestampTableProps {
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

export const AssociationsTimestampTable: React.FC<AssociationsTimestampTableProps> = ({
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
  const { totalAssociations, totalGroups } = getTimestampGroupStats(timestampGroups);

  const highlightSearchTerm = (text: string | null, searchTerm: string) => {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-black rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{totalAssociations} associações</span>
        <span>•</span>
        <span>{totalGroups} grupos por timestamp</span>
        {operationProgress && (
          <>
            <span>•</span>
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              {operationProgress.current}/{operationProgress.total}
            </span>
          </>
        )}
      </div>

      {/* Tabela */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Linha</TableHead>
                <TableHead>Rádio</TableHead>
                <TableHead>Solução</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timestampGroups.map((group, groupIndex) => (
                <React.Fragment key={group.timestamp}>
                  {/* Separador visual discreto entre grupos (exceto antes do primeiro) */}
                  {groupIndex > 0 && (
                    <TableRow className="timestamp-separator">
                      <TableCell 
                        colSpan={11} 
                        className="h-3 p-0 border-t border-gray-200/50"
                        aria-hidden="true"
                      />
                    </TableRow>
                  )}
                  
                  {/* Associações do grupo */}
                  {group.associations.map((association) => (
                    <TableRow key={association.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        {highlightSearchTerm(association.id.toString(), debouncedSearchTerm)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {highlightSearchTerm(association.client_name, debouncedSearchTerm)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {highlightSearchTerm(association.asset_iccid || association.asset_radio || association.asset_id, debouncedSearchTerm)}
                      </TableCell>
                      <TableCell>
                        {association.asset_line_number ? 
                          highlightSearchTerm(association.asset_line_number.toString(), debouncedSearchTerm) : 
                          '-'
                        }
                      </TableCell>
                      <TableCell>
                        {highlightSearchTerm(association.asset_radio, debouncedSearchTerm) || '-'}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {association.asset_solution_name}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(association.entry_date)}</TableCell>
                      <TableCell>{association.exit_date ? formatDate(association.exit_date) : '-'}</TableCell>
                      <TableCell>
                        <AssociationStatusBadge 
                          exitDate={association.exit_date}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          {association.association_id === 1 ? 'Locação' : 
                           association.association_id === 2 ? 'Assinatura' : 
                           'Outros'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditAssociation(association)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!association.exit_date && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEndAssociation(association.id)}
                              disabled={isEndingAssociation}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              {isEndingAssociation ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <StopCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
