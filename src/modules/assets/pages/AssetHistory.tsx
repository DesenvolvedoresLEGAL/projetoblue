/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { History, Search, Filter, Calendar, User, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { AssetLog } from '@/types/asset';

const AssetHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Query to fetch asset history
  const { data: historyData = [], isLoading, error } = useQuery({
    queryKey: ['asset-history'],
    queryFn: async (): Promise<AssetHistoryEntry[]> => {
      const { data, error } = await supabase
        .from('asset_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching asset history:', error);
        throw error;
      }

      // Transform the data to match AssetHistoryEntry interface
      return (data || []).map((row: any): AssetHistoryEntry => ({
        id: row.uuid ? parseInt(row.uuid.replace(/-/g, '').substring(0, 10), 16) : Date.now(), // Convert UUID to number
        date: row.created_at || new Date().toISOString(),
        event: row.event || 'Unknown Event',
        description: row.event || 'No description',
        details: (row.details as Record<string, unknown>) || {},
        status_before_id: row.status_before_id,
        status_after_id: row.status_after_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
      }));
    },
  });

  // Filter and paginate data
  const filteredData = historyData.filter((entry) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.event?.toLowerCase().includes(searchLower) ||
      entry.details?.description?.toString().toLowerCase().includes(searchLower) ||
      entry.id.toString().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventBadgeVariant = (event: string | undefined) => {
    switch (event?.toLowerCase()) {
      case 'created':
      case 'criado':
        return 'default';
      case 'updated':
      case 'atualizado':
        return 'secondary';
      case 'deleted':
      case 'excluído':
        return 'destructive';
      case 'associated':
      case 'associado':
        return 'default';
      case 'disassociated':
      case 'desassociado':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-legal-primary mx-auto mb-4"></div>
          <p>Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p>Erro ao carregar histórico de ativos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-legal-primary" />
          <h1 className="text-2xl font-bold text-legal-dark">Histórico de Ativos</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registro de Atividades ({filteredData.length})
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por evento, ID ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status Anterior</TableHead>
                  <TableHead>Status Posterior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">
                        #{entry.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(entry.date || entry.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEventBadgeVariant(entry.event)}>
                          {entry.event || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {entry.details?.description?.toString() || 'Sem descrição'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.status_before_id || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {entry.status_after_id || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length} registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetHistory;
