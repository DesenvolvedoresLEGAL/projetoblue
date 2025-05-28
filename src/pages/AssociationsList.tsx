import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Users, Calendar, X, ChevronDown, ChevronUp, AlertTriangle, Pencil } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EditAssociationDialog } from "@/components/associations/EditAssociationDialog";

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'ended' | 'today'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados para filtros de data
  const [entryDateFrom, setEntryDateFrom] = useState<Date | undefined>();
  const [entryDateTo, setEntryDateTo] = useState<Date | undefined>();
  const [exitDateFrom, setExitDateFrom] = useState<Date | undefined>();
  const [exitDateTo, setExitDateTo] = useState<Date | undefined>();
  
  // Estado para controlar a visibilidade dos filtros de data
  const [showDateFilters, setShowDateFilters] = useState(false);
  
  // Estados para validação de datas
  const [dateValidationError, setDateValidationError] = useState<string | null>(null);
  
  // Estados para o modal de edição
  const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const itemsPerPage = 15;
  const today = new Date().toISOString().split('T')[0];

  // Função para formatar datas corrigindo o problema de timezone
  const formatDateCorrect = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      // Criar data diretamente a partir da string YYYY-MM-DD sem conversão de timezone
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month é 0-indexado
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Validação automática de datas
  useEffect(() => {
    let error = null;

    // Validar período de entrada
    if (entryDateFrom && entryDateTo && entryDateFrom > entryDateTo) {
      error = 'A data inicial de entrada não pode ser maior que a data final';
    }

    // Validar período de saída
    if (exitDateFrom && exitDateTo && exitDateFrom > exitDateTo) {
      error = 'A data inicial de saída não pode ser maior que a data final';
    }

    // Validar se data de saída é anterior à data de entrada
    if (entryDateFrom && exitDateTo && exitDateTo < entryDateFrom) {
      error = 'A data de saída não pode ser anterior à data de entrada';
    }

    setDateValidationError(error);
  }, [entryDateFrom, entryDateTo, exitDateFrom, exitDateTo]);

  // Função para limpar todos os filtros de data
  const clearDateFilters = () => {
    setEntryDateFrom(undefined);
    setEntryDateTo(undefined);
    setExitDateFrom(undefined);
    setExitDateTo(undefined);
    setDateValidationError(null);
  };

  // Função para verificar se há filtros de data ativos
  const hasActiveDateFilters = () => {
    return entryDateFrom || entryDateTo || exitDateFrom || exitDateTo;
  };

  // Buscar associações com JOINs e filtros aprimorados
  const { data: associationsData, isLoading, error } = useQuery({
    queryKey: [
      'associations-list', 
      searchTerm, 
      statusFilter, 
      currentPage,
      entryDateFrom?.toISOString(),
      entryDateTo?.toISOString(),
      exitDateFrom?.toISOString(),
      exitDateTo?.toISOString()
    ],
    queryFn: async () => {
      // Não executar query se há erro de validação de datas
      if (dateValidationError) {
        return { data: [], count: 0 };
      }

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

      // Filtro por status corrigido
      if (statusFilter === 'active') {
        // Ativas: exit_date IS NULL OU exit_date > hoje
        query = query.or(`exit_date.is.null,exit_date.gt.${today}`);
      } else if (statusFilter === 'ended') {
        // Encerradas: exit_date NÃO NULO E exit_date <= hoje (corrigido para incluir hoje)
        query = query
          .not('exit_date', 'is', null)
          .lte('exit_date', today);
      } else if (statusFilter === 'today') {
        // Encerra hoje: exit_date = hoje
        query = query.eq('exit_date', today);
      }

      // Filtros por data de entrada
      if (entryDateFrom) {
        query = query.gte('entry_date', entryDateFrom.toISOString().split('T')[0]);
      }
      if (entryDateTo) {
        query = query.lte('entry_date', entryDateTo.toISOString().split('T')[0]);
      }

      // Filtros por data de saída
      if (exitDateFrom) {
        query = query.gte('exit_date', exitDateFrom.toISOString().split('T')[0]);
      }
      if (exitDateTo) {
        query = query.lte('exit_date', exitDateTo.toISOString().split('T')[0]);
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
      const today = new Date();
      const [year, month, day] = exitDate.split('-').map(Number);
      const exit = new Date(year, month - 1, day);

      today.setHours(0, 0, 0, 0);
      exit.setHours(0, 0, 0, 0);

      if (exit.getTime() === today.getTime()) {
        return <Badge variant='warning'>Encerra hoje</Badge>
      }

      if (exit < today) {
        return <Badge variant="destructive">Encerrada</Badge>;
      }
    }
    return <Badge variant="success">Ativa</Badge>;
  };

  // Função para abrir o modal de edição
  const handleEditAssociation = (association: Association) => {
    setEditingAssociation(association);
    setIsEditDialogOpen(true);
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
          {/* Filtros Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
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
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'ended' | 'today') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="ended">Encerrada</SelectItem>
                  <SelectItem value="today">Encerra hoje</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros por Data - Colapsável */}
          <Card className="border-muted">
            <Collapsible open={showDateFilters} onOpenChange={setShowDateFilters}>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <CardTitle className="text-base">
                        Filtrar por Data
                        {hasActiveDateFilters() && (
                          <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            Ativo
                          </span>
                        )}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasActiveDateFilters() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearDateFilters();
                          }}
                          className="flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Limpar
                        </Button>
                      )}
                      {showDateFilters ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {/* Mensagem de erro de validação */}
                  {dateValidationError && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{dateValidationError}</span>
                    </div>
                  )}

                  {/* Data de Início */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Data de Início</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">De</Label>
                        <DatePicker
                          date={entryDateFrom}
                          setDate={setEntryDateFrom}
                          placeholder="Selecionar data inicial"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Até</Label>
                        <DatePicker
                          date={entryDateTo}
                          setDate={setEntryDateTo}
                          placeholder="Selecionar data final"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data de Fim */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Data de Fim</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">De</Label>
                        <DatePicker
                          date={exitDateFrom}
                          setDate={setExitDateFrom}
                          placeholder="Selecionar data inicial"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Até</Label>
                        <DatePicker
                          date={exitDateTo}
                          setDate={setExitDateTo}
                          placeholder="Selecionar data final"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

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
                      <TableHead className="w-[100px]">Ações</TableHead>
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
                          {formatDateCorrect(association.entry_date)}
                        </TableCell>
                        <TableCell>
                          {formatDateCorrect(association.exit_date)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(association.exit_date)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAssociation(association)}
                            className="h-8 w-8 p-0 hover:bg-muted"
                            title="Editar associação"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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
                {searchTerm || statusFilter !== 'all' || hasActiveDateFilters() || dateValidationError
                  ? 'Tente ajustar os filtros de busca ou corrigir as datas inválidas'
                  : 'Não há associações cadastradas no sistema'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <EditAssociationDialog
        association={editingAssociation}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
