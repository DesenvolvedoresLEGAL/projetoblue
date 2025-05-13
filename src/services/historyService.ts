
import { AssetHistoryEntry } from "@/types/assetHistory";
import { toast } from '@/utils/toast';

export const historyService = {
  addHistoryEntry(
    history: AssetHistoryEntry[],
    setHistory: React.Dispatch<React.SetStateAction<AssetHistoryEntry[]>>,
    entry: Omit<AssetHistoryEntry, "id" | "timestamp">
  ): void {
    const newEntry: AssetHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...entry
    };
    
    setHistory(prev => [newEntry, ...prev]);
  },

  getAssetHistory(history: AssetHistoryEntry[], assetId: string): AssetHistoryEntry[] {
    return history
      .filter(entry => entry.assetIds.includes(assetId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  
  getClientHistory(history: AssetHistoryEntry[], clientId: string): AssetHistoryEntry[] {
    return history
      .filter(entry => entry.clientId === clientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};
