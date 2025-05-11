
import { Asset, ChipAsset, RouterAsset, AssetStatus, Client, SubscriptionInfo } from '@/types/asset';
import { AssetHistoryEntry } from '@/types/assetHistory';
import { toast } from '@/utils/toast';

export const useAssetClient = (
  assets: Asset[],
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>,
  clients?: Client[],
  addHistoryEntry?: (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => void
) => {
  // Skip client-related operations if clients or addHistoryEntry are not provided
  if (!clients || !addHistoryEntry) {
    return {
      associateAssetToClient: () => {},
      removeAssetFromClient: () => {},
      returnAssetsToStock: () => {},
      getExpiredSubscriptions: () => [] as Asset[],
      extendSubscription: () => {}
    };
  }

  const getAssetById = (id: string) => {
    return assets.find(asset => asset.id === id);
  };

  const associateAssetToClient = (assetId: string, clientId: string, subscription?: SubscriptionInfo) => {
    const asset = getAssetById(assetId);
    const client = clients.find(c => c.id === clientId);
    
    if (!asset || !client) return;
    
    let status: AssetStatus;
    let statusId: number;
    
    if (subscription?.type === "ANUAL" || subscription?.type === "MENSAL") {
      status = "ASSINATURA";
      statusId = 3; // Assuming 'Assinatura' has id = 3
    } else if (subscription?.type === "ALUGUEL") {
      status = "ALUGADO";
      statusId = 2; // Assuming 'Alugado' has id = 2
    } else {
      status = "ALUGADO"; // Default fallback
      statusId = 2;
    }
    
    updateAsset(assetId, { 
      status,
      statusId,
      clientId,
      subscription: subscription ? {
        ...subscription,
        isExpired: false
      } : undefined
    });
    
    const assetIdentifier = asset.type === "CHIP" 
      ? (asset as ChipAsset).iccid 
      : (asset as RouterAsset).uniqueId;
      
    addHistoryEntry({
      clientId,
      clientName: client.name,
      assetIds: [assetId],
      assets: [{
        id: assetId,
        type: asset.type,
        identifier: assetIdentifier
      }],
      operationType: status === "ASSINATURA" ? "ASSINATURA" : "ALUGUEL",
      comments: `Ativo ${assetIdentifier} associado ao cliente ${client.name}`
    });
  };
  
  const removeAssetFromClient = (assetId: string, clientId: string) => {
    const asset = getAssetById(assetId);
    const client = clients.find(c => c.id === clientId);
    
    if (!asset || !client) return;
    
    let needsPasswordChange = false;
    
    if (asset.type === "ROTEADOR") {
      needsPasswordChange = true;
      toast.error(`⚠️ O roteador saiu do cliente ${client.name} e retornou ao estoque. Altere o SSID e a senha.`);
    }
    
    updateAsset(assetId, { 
      status: "DISPONÍVEL",
      statusId: 1, // Assuming 'Disponível' has id = 1
      clientId: undefined,
      subscription: undefined,
      ...(asset.type === "ROTEADOR" ? { needsPasswordChange } : {})
    });
    
    const assetIdentifier = asset.type === "CHIP" 
      ? (asset as ChipAsset).iccid 
      : (asset as RouterAsset).uniqueId;
      
    addHistoryEntry({
      clientId,
      clientName: client.name,
      assetIds: [assetId],
      assets: [{
        id: assetId,
        type: asset.type,
        identifier: assetIdentifier
      }],
      operationType: asset.status === "ASSINATURA" ? "ASSINATURA" : "ALUGUEL",
      event: "Retorno ao estoque",
      comments: `Ativo ${assetIdentifier} removido do cliente ${client.name}`
    });
  };

  const returnAssetsToStock = (assetIds: string[]) => {
    const assetActions = assetIds.map(id => {
      const asset = getAssetById(id);
      if (!asset) return null;
      
      if (asset.clientId) {
        const client = clients.find(c => c.id === asset.clientId);
        if (client) {
          const assetIdentifier = asset.type === "CHIP" 
            ? (asset as ChipAsset).iccid 
            : (asset as RouterAsset).uniqueId;
              
          addHistoryEntry({
            clientId: asset.clientId,
            clientName: client.name,
            assetIds: [asset.id],
            assets: [{
              id: asset.id,
              type: asset.type,
              identifier: assetIdentifier
            }],
            operationType: asset.status === "ASSINATURA" ? "ASSINATURA" : "ALUGUEL",
            event: "Retorno ao estoque",
            comments: `Ativo ${assetIdentifier} retornado ao estoque`
          });
          
          if (asset.type === "ROTEADOR") {
            toast.error(`⚠️ O roteador saiu do cliente ${client.name} e retornou ao estoque. Altere o SSID e a senha.`);
          }
        }
      }
      
      return updateAsset(id, {
        status: "DISPONÍVEL",
        statusId: 1,
        clientId: undefined,
        subscription: undefined,
        ...(asset.type === "ROTEADOR" ? { needsPasswordChange: true } : {})
      });
    });
    
    Promise.all(assetActions.filter(Boolean)).then(() => {
      toast.success("Ativos retornados ao estoque com sucesso!");
    });
  };

  const getExpiredSubscriptions = () => {
    const today = new Date();
    return assets.filter(asset => {
      if (!asset.subscription) return false;
      
      const endDate = new Date(asset.subscription.endDate);
      return endDate < today;
    });
  };

  const extendSubscription = (assetId: string, newEndDate: string) => {
    const asset = getAssetById(assetId);
    if (!asset?.subscription || !asset.clientId) return;
    
    const client = clients.find(c => c.id === asset.clientId);
    if (!client) return;
    
    updateAsset(assetId, {
      subscription: {
        ...asset.subscription,
        endDate: newEndDate,
        isExpired: false
      }
    });
    
    const assetIdentifier = asset.type === "CHIP" 
      ? (asset as ChipAsset).iccid 
      : (asset as RouterAsset).uniqueId;
      
    addHistoryEntry({
      clientId: asset.clientId,
      clientName: client.name,
      assetIds: [asset.id],
      assets: [{
        id: asset.id,
        type: asset.type,
        identifier: assetIdentifier
      }],
      operationType: "ASSINATURA",
      event: "Extensão de assinatura",
      comments: `Assinatura do ativo ${assetIdentifier} estendida até ${new Date(newEndDate).toLocaleDateString('pt-BR')}`
    });
  };

  return {
    associateAssetToClient,
    removeAssetFromClient,
    returnAssetsToStock,
    getExpiredSubscriptions,
    extendSubscription
  };
};
