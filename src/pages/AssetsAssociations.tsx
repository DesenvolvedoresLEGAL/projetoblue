
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Download, MoreHorizontal, Eye, XCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from '@/utils/formatDate';
import { formatPhoneNumber, parsePhoneFromScientific } from '@/utils/phoneFormatter';
import { toast } from 'sonner';
import { AssociationDetailsDialog } from '@/components/associations/AssociationDetailsDialog';
import { EndAssociationDialog } from '@/components/associations/EndAssociationDialog';

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  plan_id: number;
  notes: string | null;
  gb: number;
  ssid: string | null;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  asset: {
    uuid: string;
    iccid: string | null;
    radio: string | null;
    serial_number: string | null;
    model: string | null;
    line_number: number | null;
    solution: string;
    manufacturer: string;
    status: string;
  };
  client: {
    uuid: string;
    nome: string;
    cnpj: string;
    email: string | null;
    contato: number;
  };
  plan: {
    nome: string;
  };
  association_type: {
    type: string;
  };
}

const ASSOCIATIONS_PER_PAGE = 15;

const AssetsAssociations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, ended
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssociation, setSelectedAssociation] = useState<Association | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Buscar associações com dados relacionados
  const { 
    data: associationsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['associations', searchTerm, statusFilter, currentPage],
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
          plan_id,
          notes,
          gb,
          ssid,
          created_at,
          updated_at,
          assets!inner(
            uuid,
            iccid,
            radio,
            serial_number,
            model,
            line_number,
            asset_solutions!inner(solution),
            manufacturers!inner(name),
            asset_status!inner(status)
          ),
          clients!inner(
            uuid,
            nome,
            cnpj,
            email,
            contato
          ),
          plans!inner(nome),
          association_types!inner(type)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Filtro por status
      if (statusFilter === 'active') {
        query = query.is('exit_date', null);
      } else if (statusFilter === 'ended') {
        query = query.not('exit_date', 'is', null);
      }

      // Busca por termo
      if (searchTerm.trim()) {
        const term = searchTerm.trim();
        query = query.or(`
          assets.iccid.ilike.%${term}%,
          assets.radio.ilike.%${term}%,
          assets.serial_number.ilike.%${term}%,
          assets.model.ilike.%${term}%,
          clients.nome.ilike.%${term}%,
          clients.cnpj.ilike.%${term}%,
          clients.email.ilike.%${term}%,
          id.eq.${isNaN(Number(term)) ? 0 : Number(term)}
        `);
      }

      // Paginação
      const startIndex = (currentPage - 1) * ASSOCIATIONS_PER_PAGE;
      const endIndex = currentPage * ASSOCIATIONS_PER_PAGE - 1;
      query = query.range(startIndex, endIndex);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching associations:', error);
        throw error;
      }

      // Mapear dados para interface mais limpa
      const mappedAssociations: Association[] = (data || []).map((item: any) => ({
        id: item.id,
        asset_id: item.asset_id,
        client_id: item.client_id,
        entry_date: item.entry_date,
        exit_date: item.exit_date,
        association_id: item.association_id,
        plan_id: item.plan_id,
        notes: item.notes,
        gb: item.gb,
        ssid: item.ssid,
        created_at: item.created_at,
        updated_at: item.updated_at,
        asset: {
          uuid: item.assets.uuid,
          iccid: item.assets.iccid,
          radio: item.assets.radio,
          serial_number: item.assets.serial_number,
          model: item.assets.model,
          line_number: item.assets.line_number,
          solution: item.assets.asset_solutions.solution,
          manufacturer: item.assets.manufacturers.name,
          status: item.assets.asset_status.status,
        },
        client: {
          uuid: item.clients.uuid,
          nome: item.clients.nome,
          cnpj: item.clients.cnpj,
          email: item.clients.email,
          contato: item.clients.contato,
        },
        plan: {
          nome: item.plans.nome,
        },
        association_type: {
          type: item.association_types.type,
        },
      }));

      return {
        associations: mappedAssociations,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ASSOCIATIONS_PER_PAGE),
      };
    },
  });

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  }, [refetch]);

  const handleNewAssociation = () => {
    navigate('/assets/association');
  };

  const handleViewDetails = (association: Association) => {
    setSelectedAssociation(association);
    setShowDetailsDialog(true);
  };

  const handleEndAssociation = (association: Association) => {
    setSelectedAssociation(association);
    setShowEndDialog(true);
  };

  const handleAssociationEnded = () => {
    refetch();
    setShowEndDialog(false);
    setSelectedAssociation(null);
    toast.success('Associação encerrada com sucesso!');
  };

  const getAssetIdentifier = (asset: Association['asset']) => {
    if (asset.solution === 'CHIP' && asset.iccid) {
      return `ICCID: ${asset.iccid.substring(asset.iccid.length - 8)}`;
    }
    if (asset.radio) {
      return `Rádio: ${asset.radio}`;
    }
    if (asset.serial_number) {
      return `SN: ${asset.serial_number}`;
    }
    return asset.uuid.substring(0, 8);
  };

  const getStatusBadge = (association: Association) => {
    if (association.exit_date) {
      return <Badge variant="secondary">Encerrada</Badge>;
    }
    return <Badge variant="default">Ativa</Badge>;
  };

  const handleExport = async () => {
    // TODO: Implementar exportação CSV/Excel
    toast.info('Funcionalidade de exportação será implementada em breve');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Associações</h1>
            <p className="text-muted-foreground">Gerencie todas as associações de ativos com clientes</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando associações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestão de Associações</h1>
            <p className="text-muted-foreground">Gerencie todas as associações de ativos com clientes</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">Erro ao carregar associações</p>
              <Button onClick={() => refetch()}>Tentar Novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Associações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as associações de ativos com clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleNewAssociation}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Associação
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Use os filtros abaixo para refinar sua busca
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <form onSubmit={handleSearch} className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ICCID, Rádio, Nome do cliente, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>

            {/* Filtro de Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="ended">Encerradas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Espaço para futuros filtros */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resultados</label>
              <p className="text-sm text-muted-foreground pt-2">
                {associationsData?.totalCount || 0} associação(ões) encontrada(s)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Associações */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Data Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {associationsData?.associations && associationsData.associations.length > 0 ? (
                associationsData.associations.map((association) => (
                  <TableRow key={association.id}>
                    <TableCell className="font-medium">#{association.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{association.asset.solution}</div>
                        <div className="text-sm text-muted-foreground">
                          {getAssetIdentifier(association.asset)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {association.asset.manufacturer}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{association.client.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {association.client.cnpj}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPhoneNumber(parsePhoneFromScientific(association.client.contato))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{association.association_type.type}</div>
                        <div className="text-xs text-muted-foreground">{association.plan.nome}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(association.entry_date)}</TableCell>
                    <TableCell>
                      {association.exit_date ? formatDate(association.exit_date) : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(association)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(association)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          {!association.exit_date && (
                            <DropdownMenuItem 
                              onClick={() => handleEndAssociation(association)}
                              className="text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Encerrar Associação
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm ? 
                        `Nenhuma associação encontrada para "${searchTerm}"` : 
                        'Nenhuma associação cadastrada'
                      }
                    </div>
                    {!searchTerm && (
                      <Button 
                        onClick={handleNewAssociation} 
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Associação
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginação */}
      {associationsData && associationsData.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {associationsData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, associationsData.totalPages))}
            disabled={currentPage === associationsData.totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {selectedAssociation && (
        <>
          <AssociationDetailsDialog
            association={selectedAssociation}
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />
          <EndAssociationDialog
            association={selectedAssociation}
            open={showEndDialog}
            onOpenChange={setShowEndDialog}
            onAssociationEnded={handleAssociationEnded}
          />
        </>
      )}
    </div>
  );
};

export default AssetsAssociations;
