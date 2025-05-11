
import { FileText } from "lucide-react";

interface AssetObservationsProps {
  notes?: string;
}

export function AssetObservations({ notes }: AssetObservationsProps) {
  if (!notes) return null;
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-1">
        <FileText className="h-4 w-4" />
        Observações
      </h3>
      <div className="p-3 bg-gray-50 rounded-md text-sm">
        {notes}
      </div>
    </div>
  );
}
