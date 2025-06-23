import React, { useState, useEffect } from "react";
import { useAssets } from "@/context/AssetContext";
import { Asset, ChipAsset, EquipamentAsset } from "@/types/asset";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Wifi, Router, SimCard, User, Info, AlertTriangle } from "lucide-react";

interface AssetDetailsDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

const AssetDetailsDialog = ({ asset, isOpen, onClose }: AssetDetailsDialogProps) => {
  const { getClientById } = useAssets();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (asset && asset.clientId) {
      const foundClient = getClientById(asset.clientId);
      setClient(foundClient);
    } else {
      setClient(null);
    }
  }, [asset, getClientById]);

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {asset.type === "CHIP" ? (
              <>
                <SimCard className="mr-2 h-6 w-6" />
                Chip - ICCID: {(asset as ChipAsset).iccid}
              </>
            ) : (
              <>
                <Router className="mr-2 h-6 w-6" />
                Roteador - ID: {(asset as EquipamentAsset).uniqueId}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do ativo
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Info className="mr-2 h-5 w-5 text-gray-500" />
              Informações Gerais
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Tipo:</strong> {asset.type}
              </p>
              <p>
                <strong>Status:</strong> <Badge>{asset.status}</Badge>
              </p>
              {asset.type === "CHIP" ? (
                <>
                  <p>
                    <strong>Número:</strong> {(asset as ChipAsset).phoneNumber}
                  </p>
                  <p>
                    <strong>Operadora:</strong> {(asset as ChipAsset).carrier}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Marca:</strong> {(asset as EquipamentAsset).brand}
                  </p>
                  <p>
                    <strong>Modelo:</strong> {(asset as EquipamentAsset).model}
                  </p>
                </>
              )}
              {client ? (
                <p className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <strong>Cliente:</strong> {client.nome}
                </p>
              ) : (
                <p>
                  <strong>Cliente:</strong> Não associado
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Wifi className="mr-2 h-5 w-5 text-gray-500" />
              Detalhes de Conexão
            </h3>
            <div className="space-y-2">
              {asset.type === "CHIP" ? (
                <>
                  <p>
                    <strong>ICCID:</strong> {(asset as ChipAsset).iccid}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>SSID:</strong> {(asset as EquipamentAsset).ssid}
                  </p>
                  <p>
                    <strong>Endereço IP:</strong> {(asset as EquipamentAsset).ipAddress || "N/A"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-gray-500" />
            Informações Adicionais
          </h3>
          <div className="space-y-2">
            {asset.type === "CHIP" ? (
              <>
                <p>
                  <strong>Plano:</strong> Plano de dados padrão
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Usuário Admin:</strong> {(asset as EquipamentAsset).adminUser || "N/A"}
                </p>
                <p>
                  <strong>Senha Admin:</strong> {(asset as EquipamentAsset).adminPassword || "N/A"}
                </p>
              </>
            )}
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="mt-6">
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AssetDetailsDialog;
