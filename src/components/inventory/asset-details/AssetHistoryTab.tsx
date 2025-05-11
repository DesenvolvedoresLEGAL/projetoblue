
import { AssetHistoryEntry } from "@/types/assetHistory";
import { formatDate } from "@/utils/formatDate";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { AssetStatusBadge } from "./AssetStatusBadge";

interface AssetHistoryTabProps {
  assetHistory: AssetHistoryEntry[];
}

export function AssetHistoryTab({ assetHistory }: AssetHistoryTabProps) {
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

  return assetHistory.length > 0 ? (
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
  );
}
