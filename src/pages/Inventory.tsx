
import { useAssets } from "@/context/AssetContext";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Asset, AssetStatus, AssetType, ChipAsset, RouterAsset } from "@/types/asset";
import { Download, Filter, MoreHorizontal, Pencil, Search, Smartphone, Wifi, AlertTriangle } from "lucide-react";
import EditAssetDialog from "@/components/inventory/EditAssetDialog";
import AssetDetailsDialog from "@/components/inventory/AssetDetailsDialog";

const Inventory = () => {
  const { assets, updateAsset, deleteAsset } = useAssets();
  const [search, setSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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
      const chip = asset as ChipAsset;
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
        const chip = asset as ChipAsset;
        return (
          chip.iccid.toLowerCase().includes(searchLower) ||
          chip.phoneNumber.toLowerCase().includes(searchLower) ||
          chip.carrier.toLowerCase().includes(searchLower)
        );
      } else {
        const router = asset as RouterAsset;
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

  const getStatusBadgeStyle = (status: AssetStatus) => {
    switch (status) {
      case "DISPONÍVEL":
        return "bg-green-500";
      case "ALUGADO":
      case "ASSINATURA":
        return "bg-telecom-500";
      case "SEM DADOS":
        return "bg-amber-500";
      case "BLOQUEADO":
        return "bg-red-500";
      case "MANUTENÇÃO":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const exportToCSV = () => {
    let csvContent = "ID,Tipo,Data de Registro,Status,ICCID/ID Único,Número/Marca,Operadora/Modelo,SSID,Senha\n";
    
    filteredAssets.forEach((asset) => {
      const row = [];
      row.push(asset.id);
      row.push(asset.type);
      row.push(asset.registrationDate.split("T")[0]);
      row.push(asset.status);
      
      if (asset.type === "CHIP") {
        const chip = asset as ChipAsset;
        row.push(chip.iccid);
        row.push(chip.phoneNumber);
        row.push(chip.carrier);
        row.push("");
      } else {
        const router = asset as RouterAsset;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventário</h1>
          <p className="text-muted-foreground">
            Gerencie os ativos cadastrados no sistema
          </p>
        </div>
        
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Exportar CSV</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar ativo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Tipo de Ativo" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="CHIP">Chip</SelectItem>
                <SelectItem value="ROTEADOR">Roteador</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="DISPONÍVEL">Disponível</SelectItem>
                <SelectItem value="ALUGADO">Alugado</SelectItem>
                <SelectItem value="ASSINATURA">Assinatura</SelectItem>
                <SelectItem value="SEM DADOS">Sem Dados</SelectItem>
                <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                <SelectItem value="MANUTENÇÃO">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Phone number search for chips */}
          {(typeFilter === "all" || typeFilter === "CHIP") && (
            <div className="relative max-w-md">
              <Smartphone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por número do chip (com ou sem DDD)..."
                value={phoneSearch}
                onChange={(e) => setPhoneSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          {filteredAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Tipo</TableHead>
                    <TableHead>ID / ICCID</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow 
                      key={asset.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleViewAssetDetails(asset)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {asset.type === "CHIP" ? (
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            <span>Chip</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4" />
                            <span>Roteador</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {asset.type === "CHIP"
                          ? (asset as ChipAsset).iccid
                          : (asset as RouterAsset).uniqueId
                        }
                      </TableCell>
                      <TableCell>
                        {asset.type === "CHIP" ? (
                          <div>
                            <div>{(asset as ChipAsset).phoneNumber}</div>
                            <div className="text-xs text-gray-500">
                              {(asset as ChipAsset).carrier}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              {(asset as RouterAsset).brand} {(asset as RouterAsset).model}
                              {(asset as RouterAsset).hasWeakPassword && (
                                <div className="flex items-center text-orange-500 text-xs">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span className="ml-1">Senha fraca</span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              SSID: {(asset as RouterAsset).ssid}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(asset.registrationDate).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeStyle(asset.status)}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => handleEditAsset(asset)}
                            >
                              <Pencil className="h-4 w-4" />
                              Editar ativo
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => 
                                updateAsset(asset.id, { status: "DISPONÍVEL" })
                              }
                            >
                              Marcar como Disponível
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => 
                                updateAsset(asset.id, { status: "SEM DADOS" })
                              }
                            >
                              Marcar como Sem Dados
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => 
                                updateAsset(asset.id, { status: "BLOQUEADO" })
                              }
                            >
                              Marcar como Bloqueado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => 
                                updateAsset(asset.id, { status: "MANUTENÇÃO" })
                              }
                            >
                              Marcar como Em Manutenção
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => deleteAsset(asset.id)}
                              className="text-red-500 focus:text-red-500"
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-gray-500 mb-4">
                Nenhum ativo encontrado com os filtros atuais.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setPhoneSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
