
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Wifi, AlertCircle } from "lucide-react";
import { SelectedAsset } from '@/pages/AssetAssociation';

interface NetworkConfigurationFieldsProps {
  asset: SelectedAsset;
  ssidAtual: string;
  passAtual: string;
  onSsidChange: (value: string) => void;
  onPassChange: (value: string) => void;
}

export const NetworkConfigurationFields: React.FC<NetworkConfigurationFieldsProps> = ({
  asset,
  ssidAtual,
  passAtual,
  onSsidChange,
  onPassChange
}) => {
  // Só renderizar para equipamentos (não-CHIP)
  const isChip = asset.solution_id === 11;
  
  if (isChip) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-gray-600" />
          <p className="text-xs text-gray-700">
            CHIPs não possuem configurações de rede específicas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-[#4D2BFB]" />
          <h4 className="font-medium text-sm text-[#020CBC]">Configurações de Rede</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SSID Atual */}
          <div className="space-y-2">
            <Label htmlFor="ssid-atual" className="text-sm font-medium">
              SSID da Rede (Atual)
            </Label>
            <Input
              id="ssid-atual"
              value={ssidAtual}
              onChange={(e) => onSsidChange(e.target.value)}
              placeholder="Nome da rede Wi-Fi"
            />
            <p className="text-xs text-muted-foreground">
              Configure o nome da rede para esta associação
            </p>
          </div>

          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="pass-atual" className="text-sm font-medium">
              Senha da Rede (Atual)
            </Label>
            <Input
              id="pass-atual"
              type="password"
              value={passAtual}
              onChange={(e) => onPassChange(e.target.value)}
              placeholder="Senha da rede Wi-Fi"
            />
            <p className="text-xs text-muted-foreground">
              Configure a senha da rede para esta associação
            </p>
          </div>
        </div>

        {/* Informação sobre dados de fábrica */}
        {(asset.ssid_fabrica || asset.pass_fabrica) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Dados de Fábrica (somente leitura):</p>
                {asset.ssid_fabrica && (
                  <p>SSID de Fábrica: <code className="bg-blue-100 px-1 rounded">{asset.ssid_fabrica}</code></p>
                )}
                {asset.pass_fabrica && (
                  <p>Senha de Fábrica: <code className="bg-blue-100 px-1 rounded">•••••••••</code></p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
