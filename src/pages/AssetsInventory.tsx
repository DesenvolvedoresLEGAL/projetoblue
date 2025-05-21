
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Download, 
  Upload, 
  Search, 
  Filter 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssetsData } from '@/hooks/useAssetsData';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { toast } from '@/utils/toast';

const ASSETS_PER_PAGE = 10;

const AssetsInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Utilizando o hook personalizado para buscar dados dos ativos
  const { 
    data: assetsData,
    isLoading, 
    error, 
    refetch 
  } = useAssetsData({
    searchTerm,
    filterType,
    filterStatus,
    currentPage,
    pageSize: ASSETS_PER_PAGE
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Resetar para primeira página ao pesquisar
    refetch();
  };
  
  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(1); // Resetar para primeira página ao filtrar
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
  };
  
  const getStatusBadge = (status: string | undefined) => {
    // Handle undefined or null status
    if (!status) {
      return <Badge variant="outline">Desconhecido</Badge>;
    }
    
    // Now we can safely use toLowerCase()
    switch (status.toLowerCase()) {
      case "disponível":
      case "disponivel":
        return <Badge className="bg-green-500">Disponível</Badge>;
      case "alugado":
        return <Badge variant="outline">Alugado</Badge>;
      case "assinatura":
        return <Badge variant="secondary">Assinatura</Badge>;
      case "sem dados":
        return <Badge variant="outline">Sem Dados</Badge>;
      case "bloqueado":
        return <Badge variant="destructive">Bloqueado</Badge>;
      case "manutenção":
      case "manutencao":
        return <Badge variant="warning">Manutenção</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Inventário de Ativos</h1>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  
  // Renderizar estado de erro
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Inventário de Ativos</h1>
        </div>
        <div className="p-6 border rounded-md bg-red-50">
          <div className="text-red-600">
            Erro ao carregar ativos: {error instanceof Error ? error.message : 'Erro desconhecido'}
          </div>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventário de Ativos</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Ativo
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ativos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(value) => handleFilterChange('type', value)}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              <SelectItem value="chip">Chip</SelectItem>
              <SelectItem value="router">Roteador</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="DISPONÍVEL">Disponível</SelectItem>
              <SelectItem value="ALUGADO">Alugado</SelectItem>
              <SelectItem value="ASSINATURA">Assinatura</SelectItem>
              <SelectItem value="SEM DADOS">Sem Dados</SelectItem>
              <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
              <SelectItem value="MANUTENÇÃO">Manutenção</SelectItem>
            </SelectContent>
          </Select>
          
          <Button type="submit">Buscar</Button>
        </div>
      </form>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identificador</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetsData?.assets && assetsData.assets.length > 0 ? (
              assetsData.assets.map((asset) => (
                <TableRow key={asset.uuid}>
                  <TableCell className="font-medium">
                    {/* Identificador: ICCID para chips e radio para outros */}
                    {asset.solucao.id === 11 ? 
                      asset.iccid || 'N/A' : 
                      asset.radio || 'N/A'
                    }
                  </TableCell>
                  <TableCell>{asset.solucao.name}</TableCell>
                  <TableCell>
                    {/* Mostrar número da linha para chips e número de série para outros */}
                    {asset.solucao.id === 11 ? 
                      `Número: ${asset.line_number || 'N/A'}` : 
                      `Serial: ${asset.serial_number || 'N/A'}`
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(asset.status.name)}</TableCell>
                  <TableCell>{asset.manufacturer.name}</TableCell>
                  <TableCell>{asset.model || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Nenhum ativo encontrado com os filtros atuais.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {assetsData?.totalPages && assetsData.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: assetsData.totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === assetsData.totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1))
              .map((page, index, array) => {
                // Adicionar elipse se houver lacunas
                if (index > 0 && array[index - 1] !== page - 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    </React.Fragment>
                  );
                }
                
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
            <PaginationItem>
              <PaginationNext 
                onClick={() => {
                  if (assetsData.totalPages && currentPage < assetsData.totalPages) {
                    setCurrentPage((prev) => prev + 1);
                  }
                }}
                className={currentPage >= assetsData.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default AssetsInventory;
