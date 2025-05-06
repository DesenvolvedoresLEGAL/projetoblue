
import React, { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAssets } from "@/context/useAssets";
import { StatusRecord, Asset } from "@/types/asset";
import { toast } from "@/utils/toast";
import { Check, ChevronDown, Loader2 } from "lucide-react";

interface AssetStatusDropdownProps {
  asset: Asset;
  statusRecords: StatusRecord[];
}

const AssetStatusDropdown = ({ asset, statusRecords }: AssetStatusDropdownProps) => {
  const { updateAsset } = useAssets();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleStatusChange = async (statusId: number, statusName: string) => {
    if (asset.statusId === statusId) return;
    
    setIsLoading(true);
    try {
      await updateAsset(asset.id, { 
        status: statusName as any, 
        statusId: statusId 
      });
      toast.success(`Status alterado para ${statusName}`);
    } catch (error) {
      toast.error("Erro ao atualizar o status do ativo");
      console.error("Error updating asset status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentStatus = (statusId: number) => asset.statusId === statusId;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>
                {statusRecords.find(s => s.id === asset.statusId)?.nome || "Atualizar Status"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white">
        {statusRecords.map((status) => (
          <DropdownMenuItem
            key={status.id}
            onClick={() => handleStatusChange(status.id, status.nome)}
            className={`flex justify-between ${isCurrentStatus(status.id) ? 'bg-muted' : ''}`}
          >
            {status.nome}
            {isCurrentStatus(status.id) && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AssetStatusDropdown;
