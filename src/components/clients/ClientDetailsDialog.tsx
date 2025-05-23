
import { useAssets } from "@/context/useAssets";
import { Client, Asset, ChipAsset, RouterAsset } from "@/types/asset";
import { formatDate } from "@/utils/formatDate";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Calendar, 
  Clock, 
  FileText, 
  Mail, 
  MapPin, 
  Package, 
  Phone, 
  Smartphone, 
  User, 
  Wifi 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AssetDetailsDialog from "@/components/inventory/AssetDetailsDialog";
import { useState } from "react";

interface ClientDetailsDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientDetailsDialog({
  client,
  isOpen,
  onClose
}: ClientDetailsDialogProps) {
  const { assets, getClientHistory } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  
  if (!client) return null;
  
  const clientAssets = assets.filter(asset => asset.clientId === client.id);
  const clientHistory = getClientHistory(client.id).slice(0, 5); // Get last 5 entries
  
  const getAssetStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "ALUGADO":
        return "bg-blue-500";
      case "ASSINATURA":
        return "bg-telecom-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const openAssetDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsAssetDialogOpen(true);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Detalhes do Cliente
            </DialogTitle>
            <DialogDescription>
              {client.nome}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="mt-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="details">Dados Cadastrais</TabsTrigger>
              <TabsTrigger value="assets">Ativos ({clientAssets.length})</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Informações Gerais</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-500">Nome:</div>
                    <div>{client.nome}</div>
                    
                    <div className="text-gray-500">CNPJ:</div>
                    <div>{client.cnpj}</div>
                    
                    <div className="text-gray-500">Contato:</div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-500" />
                      {client.contato}
                    </div>
                    
                    <div className="text-gray-500">Email:</div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-gray-500" />
                      {client.email || "-"}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Endereço</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-gray-500">Logradouro:</div>
                    <div>-</div>
                    
                    <div className="text-gray-500">Cidade:</div>
                    <div>-</div>
                    
                    <div className="text-gray-500">Estado:</div>
                    <div>-</div>
                    
                    <div className="text-gray-500">CEP:</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      -
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="assets" className="mt-4">
              {clientAssets.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Ativos Vinculados
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientAssets.map((asset) => {
                      const isChip = asset.type === "CHIP";
                      const chip = isChip ? asset as ChipAsset : null;
                      const router = !isChip ? asset as RouterAsset : null;
                      
                      return (
                        <div 
                          key={asset.id} 
                          className="border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => openAssetDetails(asset)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {isChip ? (
                                <Smartphone className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Wifi className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="font-medium">
                                {isChip ? "Chip" : "Roteador"}
                              </span>
                            </div>
                            <Badge className={getAssetStatusBadgeStyle(asset.status)}>
                              {asset.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm grid grid-cols-2 gap-y-1">
                            <div className="text-gray-500">
                              {isChip ? "ICCID:" : "ID:"}
                            </div>
                            <div>
                              {isChip ? chip?.iccid : router?.uniqueId}
                            </div>
                            
                            <div className="text-gray-500">
                              {isChip ? "Número:" : "Modelo:"}
                            </div>
                            <div>
                              {isChip ? chip?.phoneNumber : `${router?.brand} ${router?.model}`}
                            </div>
                            
                            {asset.subscription && (
                              <>
                                <div className="text-gray-500">Vencimento:</div>
                                <div className={asset.subscription.isExpired ? "text-red-500" : ""}>
                                  {new Date(asset.subscription.endDate).toLocaleDateString("pt-BR")}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Package className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-center text-gray-500">
                    Este cliente não possui ativos vinculados.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              {clientHistory.length > 0 ? (
                <div className="space-y-4">
                  {clientHistory.map((entry) => (
                    <div key={entry.id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{formatDate(entry.timestamp)}</span>
                        </div>
                        <Badge className={getAssetStatusBadgeStyle(entry.operationType)}>
                          {entry.operationType}
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <h4 className="text-sm font-medium mb-1">Ativos:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                          {entry.assets.map((asset) => (
                            <div key={asset.id} className="flex items-center gap-1 text-sm">
                              {asset.type === "CHIP" ? (
                                <Smartphone className="h-3 w-3 text-gray-500" />
                              ) : (
                                <Wifi className="h-3 w-3 text-gray-500" />
                              )}
                              <span>{asset.identifier}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {entry.event && (
                        <div className="text-sm mb-2">
                          <span className="text-gray-500">Evento: </span>
                          {entry.event}
                        </div>
                      )}
                      
                      {entry.comments && (
                        <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                          {entry.comments}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-center text-gray-500">
                    Nenhum histórico encontrado para este cliente.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AssetDetailsDialog 
        asset={selectedAsset}
        isOpen={isAssetDialogOpen} 
        onClose={() => setIsAssetDialogOpen(false)}
      />
    </>
  );
}
