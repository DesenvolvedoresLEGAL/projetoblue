
import React, { useState, useEffect } from "react";
import { useWizard } from "../WizardContext";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AssetStatusForm: React.FC = () => {
  const { assetData, updateAssetData } = useWizard();
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStatuses = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: statusError } = await supabase
          .from('asset_status')
          .select('id, status');
          
        if (statusError) throw statusError;
        setStatusOptions(data || []);
        
        // Set default status (usually "disponivel" with id 1)
        if (data && data.length > 0 && !assetData.status_id) {
          const defaultStatus = data.find((s: any) => s.status.toLowerCase() === "disponivel") || data[0];
          updateAssetData({ status_id: defaultStatus.id });
        }
      } catch (err) {
        console.error("Error fetching status options:", err);
        setError("Erro ao carregar opções de status. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatuses();
  }, []);
  
  const handleStatusChange = (value: string) => {
    updateAssetData({ status_id: Number(value) });
  };
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAssetData({ status_notes: e.target.value });
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Carregando opções de status...</div>;
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="status_id">Status Inicial*</Label>
        <Select
          value={assetData.status_id?.toString() || ""}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status_id">
            <SelectValue placeholder="Selecione o status inicial" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.id} value={status.id.toString()}>
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status_notes">Observações sobre o Status</Label>
        <Textarea
          id="status_notes"
          value={assetData.status_notes || ""}
          onChange={handleNotesChange}
          placeholder="Informações adicionais sobre o status do ativo..."
          rows={4}
        />
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          O status inicial do ativo pode ser alterado posteriormente conforme necessário.
        </AlertDescription>
      </Alert>
    </div>
  );
};
