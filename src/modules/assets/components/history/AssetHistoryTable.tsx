
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AssetHistoryTableProps {
  data: AssetHistoryEntry[];
  isLoading?: boolean;
}

export const AssetHistoryTable: React.FC<AssetHistoryTableProps> = ({ 
  data, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Nenhum histórico encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const getEventBadgeVariant = (event: string) => {
    switch (event.toLowerCase()) {
      case 'association_created':
      case 'criação':
        return 'default';
      case 'association_removed':
      case 'remoção':
        return 'destructive';
      case 'association_status_updated':
      case 'atualização':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Asset</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {format(new Date(entry.timestamp || entry.created_at), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={getEventBadgeVariant(entry.event || '')}>
                    {entry.event || 'Evento desconhecido'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {entry.description || entry.details ? 
                    JSON.stringify(entry.details).substring(0, 100) + '...' :
                    'Sem detalhes'
                  }
                </TableCell>
                <TableCell>
                  {entry.clientName || 'N/A'}
                </TableCell>
                <TableCell>
                  {entry.assetIds || 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
