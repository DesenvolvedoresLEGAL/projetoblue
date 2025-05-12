
import React from "react";
import { useWizard } from "../WizardContext";
import { Card, CardContent } from "@/components/ui/card";
import { Router, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export const AssetTypeSelection: React.FC = () => {
  const { assetType, setAssetType, updateAssetData } = useWizard();

  const handleSelectType = (type: "CHIP" | "ROTEADOR") => {
    setAssetType(type);
    updateAssetData({ 
      type_id: type === "CHIP" ? 1 : 2 
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Selecione o tipo de Asset</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={cn(
            "cursor-pointer hover:border-primary transition-colors",
            assetType === "CHIP" && "border-primary ring-1 ring-primary"
          )}
          onClick={() => handleSelectType("CHIP")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className={cn(
              "p-3 rounded-full mb-3",
              assetType === "CHIP" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Smartphone className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg">Chip</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              SIM Cards para conexão de dados móveis
            </p>
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "cursor-pointer hover:border-primary transition-colors",
            assetType === "ROTEADOR" && "border-primary ring-1 ring-primary"
          )}
          onClick={() => handleSelectType("ROTEADOR")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className={cn(
              "p-3 rounded-full mb-3",
              assetType === "ROTEADOR" ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Router className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg">Roteador</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Equipamentos para distribuição de rede
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
