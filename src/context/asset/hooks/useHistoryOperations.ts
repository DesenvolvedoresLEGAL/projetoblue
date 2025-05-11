
import { AssetHistoryEntry } from '@/types/assetHistory';

export const useHistoryOperations = (
  history: AssetHistoryEntry[],
  setHistory: React.Dispatch<React.SetStateAction<AssetHistoryEntry[]>>
) => {

  const addHistoryEntry = (entry: Omit<AssetHistoryEntry, "id" | "timestamp">) => {
    const newEntry: AssetHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  const getAssetHistory = (assetId: string): AssetHistoryEntry[] => {
    return history.filter(entry => entry.assetIds.includes(assetId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };
  
  const getClientHistory = (clientId: string): AssetHistoryEntry[] => {
    return history.filter(entry => entry.clientId === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  return {
    addHistoryEntry,
    getAssetHistory,
    getClientHistory
  };
};
