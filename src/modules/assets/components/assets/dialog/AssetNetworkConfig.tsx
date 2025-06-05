
import React from 'react';
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import { Wifi } from "lucide-react";
import { CopyableField } from './CopyableField';

interface AssetNetworkConfigProps {
  asset: AssetWithRelations;
  showPasswords: boolean;
}

export const AssetNetworkConfig: React.FC<AssetNetworkConfigProps> = ({
  asset,
  showPasswords
}) => {
  const isChip = asset.solucao.id === 11;

  if (isChip) return null;

  return (
    <div className="space-y-4 col-span-1 md:col-span-2">
      <div className="flex items-center gap-2 border-b pb-2">
        <Wifi className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-700">Configurações de Rede</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configurações Originais de Fábrica */}
        <div className="space-y-3 p-4 border border-amber-200 rounded-lg bg-amber-50/50">
          <h4 className="font-semibold text-amber-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            Configurações Originais de Fábrica
          </h4>
          <div className="text-xs text-amber-700 mb-3">
            Dados originais do equipamento (não editáveis)
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-sm">SSID:</span>
              <CopyableField value={asset.ssid_fabrica} label="SSID de Fábrica" />
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-sm">Senha WiFi:</span>
              <CopyableField 
                value={asset.pass_fabrica} 
                label="Senha WiFi de Fábrica" 
                isPassword={true}
                showPasswords={showPasswords}
              />
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-sm">Admin:</span>
              <CopyableField value={asset.admin_user_fabrica} label="Usuário Admin de Fábrica" />
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-sm">Senha Admin:</span>
              <CopyableField 
                value={asset.admin_pass_fabrica} 
                label="Senha Admin de Fábrica" 
                isPassword={true}
                showPasswords={showPasswords}
              />
            </div>
          </div>
        </div>

        {/* Configurações Atuais */}
        <div className="space-y-3 p-4 border border-green-200 rounded-lg bg-green-50/50">
          <h4 className="font-semibold text-green-800 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Configurações Atuais
          </h4>
          <div className="text-xs text-green-700 mb-3">
            Configurações aplicadas atualmente
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-sm">SSID:</span>
              <CopyableField value={asset.ssid_atual} label="SSID Atual" />
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-sm">Senha WiFi:</span>
              <CopyableField 
                value={asset.pass_atual} 
                label="Senha WiFi Atual" 
                isPassword={true}
                showPasswords={showPasswords}
              />
            </div>
          </div>
          
          {(!asset.ssid_atual && !asset.pass_atual) && (
            <div className="text-xs text-muted-foreground italic">
              Utilizando configurações de fábrica
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
