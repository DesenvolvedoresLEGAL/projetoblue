
import { AssetHistoryEntry } from "@/types/assetHistory";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/utils/toast";

export const useHistoryOperations = (
  history: AssetHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<AssetHistoryEntry[]>>
) => {
  // Add a new history entry
  const addHistoryEntry = (entryData: Omit<AssetHistoryEntry, "id" | "timestamp">): void => {
    const newEntry: AssetHistoryEntry = {
      ...entryData,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    
    setHistory(prevHistory => [...prevHistory, newEntry]);
    toast.success("Histórico registrado com sucesso!");
  };

  // Get asset history
  const getAssetHistory = (assetId: string): AssetHistoryEntry[] => {
    return history
      .filter(entry => entry.assetIds.includes(assetId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Get client history
  const getClientHistory = (clientId: string): AssetHistoryEntry[] => {
    return history
      .filter(entry => entry.clientId === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  return {
    addHistoryEntry,
    getAssetHistory,
    getClientHistory
  };
};
