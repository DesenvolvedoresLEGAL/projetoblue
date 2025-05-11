
import { Asset, ChipAsset, RouterAsset, Client } from "@/types/asset";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Phone, User } from "lucide-react";
import { AssetStatusBadge } from "./AssetStatusBadge";
import { AssetObservations } from "./AssetObservations";

interface AssetDetailsTabProps {
  asset: Asset;
  client: Client | undefined | null;
}

export function AssetDetailsTab({ asset, client }: AssetDetailsTabProps) {
  const isChip = asset.type === "CHIP";
  const chip = isChip ? asset as ChipAsset : null;
  const router = !isChip ? asset as RouterAsset : null;
  
  return (
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
            <AssetStatusBadge status={asset.status} />
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
                {client.name}
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
            
      <AssetObservations notes={asset.notes} />
    </div>
  );
}
