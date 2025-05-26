
import { useAssets } from "@/context/useAssets";
import { Asset, ChipAsset, EquipamentAsset } from "@/types/asset";
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
  AlertTriangle, 
  Calendar, 
  Clock, 
  FileText, 
  Phone, 
  Smartphone, 
  User, 
  Wifi 
} from "lucide-react";

interface AssetDetailsDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AssetDetailsDialog({ 
  asset, 
  isOpen, 
  onClose 
}: AssetDetailsDialogProps) {
  const { getClientById, getAssetHistory } = useAssets();
  
  if (!asset) return null;
  
  const client = asset.clientId ? getClientById(asset.clientId) : null;
  const assetHistory = getAssetHistory(asset.id).slice(0, 5);  // Get last 5 entries
  
  const getStatusBadgeStyle = (status: string) => {
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
  
  const isChip = asset.type === "CHIP";
  const chip = isChip ? asset as ChipAsset : null;
  const router = !isChip ? asset as EquipamentAsset : null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isChip ? (
              <>
                <Smartphone className="h-5 w-5" />
                Detalhes do Chip
              </>
            ) : (
              <>
                <Wifi className="h-5 w-5" />
                Detalhes do Roteador
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isChip 
              ? `ICCID: ${chip?.iccid}` 
              : `ID: ${router?.uniqueId}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Identificação</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-500">ID:</div>
                  <div>{asset.id}</div>
                  
                  <div className="text-gray-500">Tipo:</div>
                  <div>{isChip ? "Chip" : "Roteador"}</div>
                  
                  {isChip ? (
                    <>
                      <div className="text-gray-500">ICCID:</div>
                      <div>{chip?.iccid}</div>
                      
                      <div className="text-gray-500">Número:</div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-gray-500" />
                        {chip?.phoneNumber}
                      </div>
                      
                      <div className="text-gray-500">Operadora:</div>
                      <div>{chip?.carrier}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-500">ID Único:</div>
                      <div>{router?.uniqueId}</div>
                      
                      <div className="text-gray-500">Marca:</div>
                      <div>{router?.brand}</div>
                      
                      <div className="text-gray-500">Modelo:</div>
                      <div>{router?.model}</div>
                      
                      <div className="text-gray-500">SSID:</div>
                      <div>{router?.ssid}</div>
                      
                      <div className="text-gray-500">Senha:</div>
                      <div className="flex items-center gap-1">
                        {router?.password}
                        {router?.hasWeakPassword && (
                          <div className="ml-2 text-orange-500 text-xs flex items-center">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="ml-1">Senha fraca</span>
                          </div>
                        )}
                      </div>
                      
                      {router?.ipAddress && (
                        <>
                          <div className="text-gray-500">IP Gerência:</div>
                          <div>{router.ipAddress}</div>
                        </>
                      )}
                      
                      {router?.imei && (
                        <>
                          <div className="text-gray-500">IMEI:</div>
                          <div>{router.imei}</div>
                        </>
                      )}
                      
                      {router?.serialNumber && (
                        <>
                          <div className="text-gray-500">Número de Série:</div>
                          <div>{router.serialNumber}</div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Status</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-gray-500">Status Atual:</div>
                  <div>
                    <Badge className={getStatusBadgeStyle(asset.status)}>
                      {asset.status}
                    </Badge>
                  </div>
                  
                  <div className="text-gray-500">Data de Registro:</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    {new Date(asset.registrationDate).toLocaleDateString("pt-BR")}
                  </div>
                  
                  {client && (
                    <>
                      <div className="text-gray-500">Cliente:</div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-500" />
                        {client.nome}
                      </div>
                    </>
                  )}
                  
                  {asset.subscription && (
                    <>
                      <div className="text-gray-500">Tipo de Assinatura:</div>
                      <div>{asset.subscription.type}</div>
                      
                      <div className="text-gray-500">Início:</div>
                      <div>{new Date(asset.subscription.startDate).toLocaleDateString("pt-BR")}</div>
                      
                      <div className="text-gray-500">Término:</div>
                      <div className="flex items-center gap-1">
                        {asset.subscription.isExpired ? (
                          <span className="text-red-500">Expirado em {new Date(asset.subscription.endDate).toLocaleDateString("pt-BR")}</span>
                        ) : (
                          <span>{new Date(asset.subscription.endDate).toLocaleDateString("pt-BR")}</span>
                        )}
                      </div>
                      
                      {asset.subscription.event && (
                        <>
                          <div className="text-gray-500">Evento:</div>
                          <div>{asset.subscription.event}</div>
                        </>
                      )}
                      
                      <div className="text-gray-500">Renovação Automática:</div>
                      <div>{asset.subscription.autoRenew ? "Sim" : "Não"}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {asset.notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Observações
                </h3>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  {asset.notes}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            {assetHistory.length > 0 ? (
              <div className="space-y-4">
                {assetHistory.map((entry) => (
                  <div key={entry.id} className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{formatDate(entry.timestamp)}</span>
                      </div>
                      <Badge className={getStatusBadgeStyle(entry.operationType)}>
                        {entry.operationType}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 text-sm gap-y-1">
                      <div className="text-gray-500">Cliente:</div>
                      <div>{entry.clientName}</div>
                      
                      {entry.event && (
                        <>
                          <div className="text-gray-500">Evento:</div>
                          <div>{entry.event}</div>
                        </>
                      )}
                    </div>
                    
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
                  Nenhum histórico encontrado para este ativo.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
