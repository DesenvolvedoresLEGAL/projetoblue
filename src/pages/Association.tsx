import React, { useState, useEffect } from 'react';
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
import { useAssets } from "@/context/useAssets";
import { Asset, ChipAsset, RouterAsset } from "@/types/asset";
import { Client } from "@/types/asset";
import { toast } from "@/utils/toast";

const Association = () => {
  const { assets, clients, associateAssetToClient, removeAssetFromClient, addHistoryEntry } = useAssets();
  const [assetId, setAssetId] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

  useEffect(() => {
    // Find the asset when the assetId changes
    setSelectedAsset(assets.find(asset => asset.id === assetId));
  }, [assetId, assets]);

  useEffect(() => {
    // Find the client when the clientId changes
    setSelectedClient(clients.find(client => client.id === clientId));
  }, [clientId, clients]);

  const handleAssociate = async () => {
    if (!assetId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de ativo.",
        variant: "destructive"
      });
      return;
    }
    if (!clientId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de cliente.",
        variant: "destructive"
      });
      return;
    }

    if (assetId && clientId) {
      try {
        await associateAssetToClient(assetId, clientId);
        toast({
          title: "Sucesso",
          description: "Ativo associado ao cliente com sucesso.",
        });

        // Fix the history entry
        addHistoryEntry({
          type: "ASSOCIATION",
          description: `Ativo associado ao cliente`,
          assetIds: [assetId],
          clientId: clientId,
          details: {
            assetType: selectedAsset?.type,
            assetIdentifier: selectedAsset?.type === 'CHIP' 
              ? (selectedAsset as ChipAsset).iccid 
              : (selectedAsset as RouterAsset).uniqueId,
            clientName: selectedClient?.name
          }
        });
      } catch (error) {
        console.error("Erro ao associar ativo ao cliente:", error);
        toast({
          title: "Erro",
          description: "Erro ao associar ativo ao cliente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRemoveAssociation = async () => {
    if (!assetId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de ativo.",
        variant: "destructive"
      });
      return;
    }
    if (!clientId) {
      toast({
        title: "Erro",
        description: "Por favor, insira um ID de cliente.",
        variant: "destructive"
      });
      return;
    }

    if (assetId && clientId) {
      try {
        await removeAssetFromClient(assetId, clientId);
        toast({
          title: "Sucesso",
          description: "Ativo removido do cliente com sucesso.",
        });

        // Fix the history entry
        addHistoryEntry({
          type: "DISASSOCIATION",
          description: `Ativo removido do cliente`,
          assetIds: [assetId],
          clientId: clientId,
          details: {
            assetType: selectedAsset?.type,
            assetIdentifier: selectedAsset?.type === 'CHIP' 
              ? (selectedAsset as ChipAsset).iccid 
              : (selectedAsset as RouterAsset).uniqueId,
            clientName: selectedClient?.name
          }
        });
      } catch (error) {
        console.error("Erro ao remover associação do ativo:", error);
        toast({
          title: "Erro",
          description: "Erro ao remover associação do ativo.",
          variant: "destructive"
        });
      }
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
            />
            {selectedAsset && (
              <div className="text-sm text-muted-foreground">
                Ativo selecionado: {selectedAsset.type === 'CHIP' ? (selectedAsset as ChipAsset).iccid : (selectedAsset as RouterAsset).uniqueId}
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
            />
            {selectedClient && (
              <div className="text-sm text-muted-foreground">
                Cliente selecionado: {selectedClient.name}
              </div>
            )}
          </div>
          <Button onClick={handleAssociate}>Associar Ativo</Button>
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
            />
            {selectedAsset && (
              <div className="text-sm text-muted-foreground">
                Ativo selecionado: {selectedAsset.type === 'CHIP' ? (selectedAsset as ChipAsset).iccid : (selectedAsset as RouterAsset).uniqueId}
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
            />
            {selectedClient && (
              <div className="text-sm text-muted-foreground">
                Cliente selecionado: {selectedClient.name}
              </div>
            )}
          </div>
          <Button onClick={handleRemoveAssociation}>Remover Associação</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Association;
