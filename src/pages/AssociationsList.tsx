
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  // Dados dos JOINs
  client_name: string;
  asset_iccid: string | null;
  asset_radio: string | null;
  asset_solution_id: number;
  asset_solution_name: string;
}

export default function AssociationsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Buscar associações com JOINs
  const { data: associationsData, isLoading, error } = useQuery({
    queryKey: ['associations-list', searchTerm, statusFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from('asset_client_assoc')
        .select(`
          id,
          asset_id,
          client_id,
          entry_date,
          exit_date,
          association_id,
          created_at,
          clients!inner(nome),
          assets!inner(
            iccid,
            radio,
            solution_id,
            asset_solutions(solution)
          )
        `)
        .is('deleted_at', null)
        .order('entry_date', { ascending: false });

      // Filtro por status
      if (statusFilter === 'active') {
        query = query.is('exit_date', null);
      } else if (statusFilter === 'ended') {
        query = query.not('exit_date', 'is', null);
      }

      // Busca por termo
      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        // Busca por ID da associação, nome do cliente, ICCID ou rádio
        query = query.or(
          `id.eq.${term},` +
          `clients.nome.ilike.%${term}%,` +
          `assets.iccid.ilike.%${term}%,` +
          `assets.radio.ilike.%${term}%`
        );
      }

      // Paginação
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = currentPage * itemsPerPage - 1;
      query = query.range(startIndex, endIndex);

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar associações:', error);
        throw error;
      }

      // Mapear dados para o formato esperado
      const mappedData = data.map((item: any) => ({
        id: item.id,
        asset_id: item.asset_id,
        client_id: item.client_id,
        entry_date: item.entry_date,
        exit_date: item.exit_date,
        association_id: item.association_id,
        created_at: item.created_at,
        client_name: item.clients?.nome || 'Cliente não encontrado',
        asset_iccid: item.assets?.iccid,
        asset_radio: item.assets?.radio,
        asset_solution_id: item.assets?.solution_id,
        asset_solution_name: item.assets?.asset_solutions?.solution || 'Solução não encontrada'
      }));

      return {
        data: mappedData,
        count: count || 0
      };
    },
    enabled: true
  });

  const associations = associationsData?.data || [];
  const totalCount = associationsData?.count || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getAssetIdentifier = (association: Association) => {
    // Para CHIPs (solution_id = 11), mostra ICCID
    if (association.asset_solution_id === 11 && association.asset_iccid) {
      return association.asset_iccid;
    }
    // Para outros ativos, mostra rádio
    if (association.asset_radio) {
      return association.asset_radio;
    }
    return 'N/A';
  };

  const getStatusBadge = (exitDate: string | null) => {
    if (exitDate) {
      return <Badge variant="destructive">Encerrada</Badge>;
    }
    return <Badge variant="success">Ativa</Badge>;
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Associações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Erro ao carregar associações. Tente novamente.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Associações
          </CardTitle>
          <CardDescription>
            Consulte todas as associações entre ativos e clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="ID, nome do cliente, ICCID ou rádio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'ended') => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="ended">Encerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando associações...
            </div>
          ) : associations.length > 0 ? (
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {associations.map((association) => (
                      <TableRow key={association.id}>
                        <TableCell className="font-medium">
                          #{association.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {getAssetIdentifier(association)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {association.asset_solution_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {association.client_name}
                        </TableCell>
                        <TableCell>
                          {formatDate(association.entry_date)}
                        </TableCell>
                        <TableCell>
                          {formatDate(association.exit_date)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(association.exit_date)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
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
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className="text-sm text-muted-foreground text-center">
                Mostrando {associations.length} de {totalCount} associações
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">Nenhuma associação encontrada</div>
              <div className="text-sm">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há associações cadastradas no sistema'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
