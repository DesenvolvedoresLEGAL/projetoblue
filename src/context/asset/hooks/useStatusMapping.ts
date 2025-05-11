
import { AssetStatus, StatusRecord } from "@/types/asset";

export const useStatusMapping = (
  setStatusRecords: React.Dispatch<React.SetStateAction<StatusRecord[]>>
) => {
  // Load status records from database/API
  const loadStatusRecords = async (): Promise<void> => {
    try {
      // Simulated fetch - in a real app this would be an API call
      const mockStatusRecords: StatusRecord[] = [
        { id: 1, nome: "DISPONÍVEL" },
        { id: 2, nome: "ALUGADO" },
        { id: 3, nome: "ASSINATURA" },
        { id: 4, nome: "SEM DADOS" },
        { id: 5, nome: "BLOQUEADO" },
        { id: 6, nome: "MANUTENÇÃO" }
      ];
      
      setStatusRecords(mockStatusRecords);
    } catch (error) {
      console.error("Error loading status records:", error);
    }
  };

  // Map status ID to asset status
  const mapStatusIdToAssetStatus = (statusId: number): AssetStatus => {
    const statusRecord = statusRecords.find(rec => rec.id === statusId);
    return (statusRecord?.nome as AssetStatus) || "DISPONÍVEL";
  };

  // Map asset status to status ID
  const mapAssetStatusToId = (status: AssetStatus): number => {
    const statusRecord = statusRecords.find(rec => rec.nome === status);
    return statusRecord?.id || 1; // Default to ID 1 (DISPONÍVEL) if not found
  };

  return {
    loadStatusRecords,
    mapStatusIdToAssetStatus,
    mapAssetStatusToId
  };
};
