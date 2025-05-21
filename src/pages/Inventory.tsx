
import { useState } from "react";
import { useAssets } from "@/context/useAssets";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types/asset";
import EditAssetDialog from "@/components/inventory/EditAssetDialog";
import AssetDetailsDialog from "@/components/inventory/AssetDetailsDialog";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import AssetList from "@/components/inventory/AssetList";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/utils/toast";

const Inventory = () => {
  const { assets, updateAsset, deleteAsset, statusRecords, loading } = useAssets();
  const [search, setSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly;
  };

  const filteredAssets = assets.filter((asset) => {
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
          chip.iccid.toLowerCase().includes(searchLower) ||
          chip.phoneNumber.toLowerCase().includes(searchLower) ||
          chip.carrier.toLowerCase().includes(searchLower)
        );
      } else {
        const router = asset as any;
        return (
          router.uniqueId.toLowerCase().includes(searchLower) ||
          router.brand.toLowerCase().includes(searchLower) ||
          router.model.toLowerCase().includes(searchLower) ||
          router.ssid.toLowerCase().includes(searchLower)
        );
      }
    }
    
    return true;
  });

  const exportToCSV = () => {
    setExportLoading(true);
    
    try {
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
      
      toast.success("Export completed successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventário</h1>
          <p className="text-muted-foreground">
            Gerencie os ativos cadastrados no sistema
          </p>
        </div>
        
        <Button 
          onClick={exportToCSV} 
          className="flex items-center gap-2"
          disabled={exportLoading || loading || filteredAssets.length === 0}
        >
          <Download className="h-4 w-4" />
          <span>{exportLoading ? "Exportando..." : "Exportar CSV"}</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      ) : (
        <>
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
            assets={filteredAssets}
            statusRecords={statusRecords}
            onEdit={handleEditAsset}
            onViewDetails={handleViewAssetDetails}
            updateAsset={updateAsset}
            deleteAsset={deleteAsset}
            clearFilters={clearFilters}
          />

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
        </>
      )}
    </div>
  );
};

export default Inventory;
