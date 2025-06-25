import React, { useState, useEffect } from "react";
import { useAssets } from "@/context/AssetContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Asset, ChipAsset, EquipamentAsset } from "@/types/asset";
import { toast } from "sonner";

export default function Association() {
  const { assets, clients, associateAssetToClient, removeAssetFromClient, addHistoryEntry } = useAssets();
  const [assetId, setAssetId] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<{ uuid: string, nome: string } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Find the asset when the assetId changes
    setSelectedAsset(assets.find(asset => asset.id === assetId));
  }, [assetId, assets]);

  useEffect(() => {
    // Find the client when the clientId changes
    const client = clients.find(client => client.uuid === clientId);
    setSelectedClient(client ? { uuid: client.uuid, nome: client.nome } : undefined);
  }, [clientId, clients]);

  const handleAssociate = async () => {
    if (!assetId) {
      toast.error("Por favor, insira um ID de ativo.");
      return;
    }
    if (!clientId) {
      toast.error("Por favor, insira um ID de cliente.");
      return;
    }

    setIsLoading(true);
    try {
      await associateAssetToClient(assetId, clientId);
      
      // Add history entry
      if (selectedAsset && selectedClient) {
        addHistoryEntry({
          operationType: "ASSOCIATION",
          description: `Ativo associado ao cliente ${selectedClient.nome}`,
          assetIds: [assetId],
          clientId: clientId,
          clientName: selectedClient.nome,
          assets: [{
            id: assetId,
            type: selectedAsset.type,
            identifier: selectedAsset.type === 'CHIP' 
              ? (selectedAsset as ChipAsset).iccid 
              : (selectedAsset as EquipamentAsset).uniqueId
          }],
          comments: `Ativo associado ao cliente ${selectedClient.nome}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      toast.success("Ativo associado ao cliente com sucesso.");
    } catch (error) {
      console.error("Erro ao associar ativo ao cliente:", error);
      toast.error(`Erro ao associar ativo ao cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAssociation = async () => {
    if (!assetId) {
      toast.error("Por favor, insira um ID de ativo.");
      return;
    }
    if (!clientId) {
      toast.error("Por favor, insira um ID de cliente.");
      return;
    }

    setIsLoading(true);
    try {
      await removeAssetFromClient(assetId, clientId);
      
      // Add history entry
      if (selectedAsset && selectedClient) {
        addHistoryEntry({
          operationType: "DISASSOCIATION",
          description: `Ativo removido do cliente ${selectedClient.nome}`,
          assetIds: [assetId],
          clientId: clientId,
          clientName: selectedClient.nome,
          assets: [{
            id: assetId,
            type: selectedAsset.type,
            identifier: selectedAsset.type === 'CHIP' 
              ? (selectedAsset as ChipAsset).iccid 
              : (selectedAsset as EquipamentAsset).uniqueId
          }],
          comments: `Ativo removido do cliente ${selectedClient.nome}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      toast.success("Ativo removido do cliente com sucesso.");
    } catch (error) {
      console.error("Erro ao remover associação do ativo:", error);
      toast.error(`Erro ao remover associação do ativo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Associar Ativo ao Cliente</CardTitle>
          <CardDescription>
            Associe um ativo existente a um cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="asset-id">ID do Ativo</Label>
            <Input
              type="text"
              id="asset-id"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              disabled={isLoading}
            />
            {selectedAsset && (
              <div className="text-sm text-muted-foreground">
                Ativo selecionado: {selectedAsset.type === 'CHIP' 
                  ? (selectedAsset as ChipAsset).iccid 
                  : (selectedAsset as EquipamentAsset).uniqueId}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client-id">ID do Cliente</Label>
            <Input
              type="text"
              id="client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isLoading}
            />
            {selectedClient && (
              <div className="text-sm text-muted-foreground">
                Cliente selecionado: {selectedClient.nome}
              </div>
            )}
          </div>
          <Button onClick={handleAssociate} disabled={isLoading}>
            {isLoading ? 'Processando...' : 'Associar Ativo'}
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Remover Associação</CardTitle>
          <CardDescription>
            Remova a associação de um ativo de um cliente.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="asset-id-remove">ID do Ativo</Label>
            <Input
              type="text"
              id="asset-id-remove"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              disabled={isLoading}
            />
            {selectedAsset && (
              <div className="text-sm text-muted-foreground">
                Ativo selecionado: {selectedAsset.type === 'CHIP' 
                  ? (selectedAsset as ChipAsset).iccid 
                  : (selectedAsset as EquipamentAsset).uniqueId}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client-id-remove">ID do Cliente</Label>
            <Input
              type="text"
              id="client-id-remove"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isLoading}
            />
            {selectedClient && (
              <div className="text-sm text-muted-foreground">
                Cliente selecionado: {selectedClient.nome}
              </div>
            )}
          </div>
          <Button onClick={handleRemoveAssociation} disabled={isLoading} variant="outline">
            {isLoading ? 'Processando...' : 'Remover Associação'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
