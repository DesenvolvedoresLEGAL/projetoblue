
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { LoadingState } from "@/components/dashboard/LoadingState";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { assetQueries } from '@/services/api/asset/queries';
import { Asset } from '@/types/asset';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/utils/toast';

const ASSETS_PER_PAGE = 10;

const AssetsInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Query assets with filters
  const { 
    data: assets, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['assets', 'inventory', filterType, filterStatus, searchTerm, currentPage],
    queryFn: async () => {
      // Prepare filters for the API call
      const params: any = {};
      
      if (filterType !== "all") {
        params.type = filterType;
      }
      
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      
      // Handle search term
      if (searchTerm) {
        // Check if search term might be a phone number
        if (/^\d[-\d\s]*$/.test(searchTerm)) {
          params.phoneSearch = searchTerm;
        } else {
          params.search = searchTerm;
        }
      }
      
      try {
        // Use the existing assetQueries service to fetch data
        const fetchedAssets = await assetQueries.getAssets(params);
        
        // Add pagination in memory for now
        // In a real implementation, this would be handled server-side
        const startIndex = (currentPage - 1) * ASSETS_PER_PAGE;
        const paginatedAssets = fetchedAssets.slice(startIndex, startIndex + ASSETS_PER_PAGE);
        
        return {
          assets: paginatedAssets,
          totalCount: fetchedAssets.length,
          totalPages: Math.ceil(fetchedAssets.length / ASSETS_PER_PAGE)
        };
      } catch (err) {
        console.error('Error fetching assets:', err);
        throw new Error('Failed to fetch assets. Please try again.');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    refetch();
  };
  
  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(1); // Reset to first page when filtering
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
  };
  
  const getStatusBadge = (status: string) => {
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
  
  // Render loading state
  if (isLoading) {
    return <LoadingState message="Carregando inventário de ativos..." />;
  }
  
  // Render error state
  if (error) {
    return (
      <ErrorState 
        error={error} 
        message="Não foi possível carregar os ativos." 
        onRetry={() => refetch()}
      />
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
              <SelectItem value="CHIP">Chip</SelectItem>
              <SelectItem value="ROTEADOR">Roteador</SelectItem>
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
              <TableHead>ID</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fabricante</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets?.assets && assets.assets.length > 0 ? (
              assets.assets.map((asset: Asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.id.substring(0, 8)}...</TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>
                    {asset.type === 'CHIP' ? 
                      `ICCID: ${asset.iccid || 'N/A'}` : 
                      `SN: ${asset.serial_number || 'N/A'}`
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(asset.status)}</TableCell>
                  <TableCell>{asset.marca || 'N/A'}</TableCell>
                  <TableCell>{asset.modelo || 'N/A'}</TableCell>
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
      
      {assets?.totalPages && assets.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: assets.totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === assets.totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1))
              .map((page, index, array) => {
                // Add ellipsis if there are gaps
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
                  if (assets.totalPages && currentPage < assets.totalPages) {
                    setCurrentPage((prev) => prev + 1);
                  }
                }}
                className={currentPage >= assets.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default AssetsInventory;
