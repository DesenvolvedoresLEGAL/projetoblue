import { useState, useEffect } from "react";
import { useAssets } from "@/context/useAssets";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types/asset";
import EditAssetDialog from "@/components/inventory/EditAssetDialog";
import AssetDetailsDialog from "@/components/inventory/AssetDetailsDialog";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import AssetList from "@/components/inventory/AssetList";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10; // Número de itens por página

const Inventory = () => {
  const { assets, updateAsset, deleteAsset, statusRecords } = useAssets();
  const [search, setSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedAssets, setPaginatedAssets] = useState<Asset[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly;
  };

  // Função para filtrar ativos baseada nos critérios
  const getFilteredAssets = () => {
    console.time('filtering-assets');
    const filtered = assets.filter((asset) => {
      if (typeFilter !== "all" && asset.type !== typeFilter) {
        return false;
      }
      
      if (statusFilter !== "all" && asset.status !== statusFilter) {
        return false;
      }
      
      // Phone number search for chips
      if (phoneSearch && asset.type === "CHIP") {
        const chip = asset as any;
        const formattedSearchPhone = formatPhoneNumber(phoneSearch);
        const formattedAssetPhone = formatPhoneNumber(chip.phoneNumber);
        
        // Check if the formatted phone numbers match (ignoring length differences)
        if (!formattedAssetPhone.endsWith(formattedSearchPhone) && 
            !formattedSearchPhone.endsWith(formattedAssetPhone)) {
          return false;
        }
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        
        if (asset.type === "CHIP") {
          const chip = asset as any;
          return (
            chip.iccid?.toLowerCase().includes(searchLower) ||
            chip.phoneNumber?.toLowerCase().includes(searchLower) ||
            chip.carrier?.toLowerCase().includes(searchLower)
          );
        } else {
          const router = asset as any;
          return (
            router.uniqueId?.toLowerCase().includes(searchLower) ||
            router.brand?.toLowerCase().includes(searchLower) ||
            router.model?.toLowerCase().includes(searchLower) ||
            router.ssid?.toLowerCase().includes(searchLower)
          );
        }
      }
      
      return true;
    });
    console.timeEnd('filtering-assets');
    return filtered;
  };

  // Atualizar filtragem e paginação quando mudar os critérios
  useEffect(() => {
    console.time('pagination-update');
    const filteredAssets = getFilteredAssets();
    const total = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
    
    setTotalPages(total || 1);
    
    // Ajustar página atual se necessário
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
    
    // Paginar os resultados
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResults = filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    setPaginatedAssets(paginatedResults);
    console.timeEnd('pagination-update');
  }, [assets, search, phoneSearch, typeFilter, statusFilter, currentPage]);

  const handlePageChange = (page: number) => {
    console.log(`Mudando para página ${page}`);
    setCurrentPage(page);
  };

  const exportToCSV = () => {
    console.time('export-csv');
    // Usar todos os ativos filtrados, não apenas os paginados
    const filteredAssets = getFilteredAssets();
    let csvContent = "ID,Tipo,Data de Registro,Status,ICCID/ID Único,Número/Marca,Operadora/Modelo,SSID,Senha\n";
    
    filteredAssets.forEach((asset) => {
      const row = [];
      row.push(asset.id);
      row.push(asset.type);
      row.push(asset.registrationDate.split("T")[0]);
      row.push(asset.status);
      
      if (asset.type === "CHIP") {
        const chip = asset as any;
        row.push(chip.iccid);
        row.push(chip.phoneNumber);
        row.push(chip.carrier);
        row.push("");
      } else {
        const router = asset as any;
        row.push(router.uniqueId);
        row.push(router.brand);
        row.push(router.model);
        row.push(router.ssid);
        row.push(router.password);
      }
      
      csvContent += row.join(",") + "\n";
    });
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.timeEnd('export-csv');
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleViewAssetDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedAsset(null);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedAsset(null);
  };

  const clearFilters = () => {
    setSearch("");
    setPhoneSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Renderizar componente de paginação
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Lógica para mostrar as páginas ao redor da página atual
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={currentPage === pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventário</h1>
          <p className="text-muted-foreground">
            Gerenciando {getFilteredAssets().length} ativos no sistema
          </p>
        </div>
        
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Exportar CSV</span>
        </Button>
      </div>
      
      <InventoryFilters 
        search={search}
        setSearch={setSearch}
        phoneSearch={phoneSearch}
        setPhoneSearch={setPhoneSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusRecords={statusRecords}
        clearFilters={clearFilters}
      />
      
      <AssetList 
        assets={paginatedAssets}
        statusRecords={statusRecords}
        onEdit={handleEditAsset}
        onViewDetails={handleViewAssetDetails}
        updateAsset={updateAsset}
        deleteAsset={deleteAsset}
        clearFilters={clearFilters}
      />

      {renderPagination()}

      <EditAssetDialog 
        asset={selectedAsset}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
      />
      
      <AssetDetailsDialog
        asset={selectedAsset}
        isOpen={isDetailsDialogOpen}
        onClose={handleCloseDetailsDialog}
      />
    </div>
  );
};

export default Inventory;
