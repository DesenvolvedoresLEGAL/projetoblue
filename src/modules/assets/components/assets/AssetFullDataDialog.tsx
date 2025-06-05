
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import { formatDate } from '@/utils/formatDate';
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, Wifi } from "lucide-react";
import { toast } from "@/utils/toast";
import AssetStatusBadge from './AssetStatusBadge';

interface AssetFullDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
}

const AssetFullDataDialog = ({ isOpen, onClose, asset }: AssetFullDataDialogProps) => {
  const [showPasswords, setShowPasswords] = React.useState(false);

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`${label} copiado para a área de transferência`);
    });
  };

  const renderPasswordField = (value: string | undefined, label: string) => {
    if (!value) return 'N/A';
    
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">
          {showPasswords ? value : '•'.repeat(value.length)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(value, label)}
          className="h-6 w-6 p-0"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  const renderNetworkField = (value: string | undefined, label: string, isPassword = false) => {
    if (!value) return 'N/A';
    
    return (
      <div className="flex items-center gap-2">
        <span className={`${isPassword ? 'font-mono' : ''} text-sm`}>
          {isPassword && !showPasswords ? '•'.repeat(value.length) : value}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(value, label)}
          className="h-6 w-6 p-0"
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  if (!asset) return null;

  const isEquipment = asset.solucao.id !== 11; // Não é CHIP

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium flex items-center gap-2">
            Dados Completos do Ativo
            {isEquipment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswords(!showPasswords)}
                className="ml-auto"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPasswords ? 'Ocultar' : 'Mostrar'} Senhas
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Informações Básicas</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium">Identificador:</span>
              <span>{asset.uuid}</span>
              
              <span className="font-medium">Tipo:</span>
              <span>{asset.solucao.name}</span>
              
              <span className="font-medium">Status:</span>
              <AssetStatusBadge status={asset.status.name} />
              
              <span className="font-medium">Fabricante:</span>
              <span>{asset.manufacturer.name}</span>
              
              {asset.model && (
                <>
                  <span className="font-medium">Modelo:</span>
                  <span>{asset.model}</span>
                </>
              )}

              {asset.radio && (
                <>
                  <span className="font-medium">Rádio:</span>
                  <span>{asset.radio}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1">Detalhes Técnicos</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {asset.solucao.id === 11 ? (
                <>
                  <span className="font-medium">ICCID:</span>
                  <span>{asset.iccid || 'N/A'}</span>
                  
                  {asset.line_number && (
                    <>
                      <span className="font-medium">Número de Linha:</span>
                      <span>{asset.line_number}</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="font-medium">Número de Série:</span>
                  <span>{asset.serial_number || 'N/A'}</span>
                </>
              )}
              
              {asset.rented_days !== undefined && (
                <>
                  <span className="font-medium">Dias Alugados:</span>
                  <span>{asset.rented_days}</span>
                </>
              )}
            </div>

            {isEquipment && (
              <>
                <h3 className="text-lg font-semibold border-b pb-1">Acesso Administrativo</h3>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium">Admin:</span>
                  <span>{asset.admin_user}</span>
                  <span className="font-medium">Senha:</span>
                  {renderPasswordField(asset.admin_pass, 'Senha Admin')}
                </div>
              </>
            )}
          </div>

          {/* Nova Seção: Configurações de Rede (apenas para equipamentos) */}
          {isEquipment && (
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
                      {renderNetworkField(asset.ssid_fabrica, 'SSID de Fábrica')}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Senha WiFi:</span>
                      {renderNetworkField(asset.pass_fabrica, 'Senha WiFi de Fábrica', true)}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Admin:</span>
                      {renderNetworkField(asset.admin_user_fabrica, 'Usuário Admin de Fábrica')}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Senha Admin:</span>
                      {renderNetworkField(asset.admin_pass_fabrica, 'Senha Admin de Fábrica', true)}
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
                      {renderNetworkField(asset.ssid_atual, 'SSID Atual')}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Senha WiFi:</span>
                      {renderNetworkField(asset.pass_atual, 'Senha WiFi Atual', true)}
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
          )}

          <div className="space-y-4 col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold border-b pb-1">Informações de Sistema</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium block">Data de Criação:</span>
                <span>{formatDate(asset.created_at)}</span>
              </div>
              
              <div>
                <span className="font-medium block">Última Atualização:</span>
                <span>{formatDate(asset.updated_at)}</span>
              </div>
              
              <div>
                <span className="font-medium block">ID da Solução:</span>
                <span>{asset.solucao.id}</span>
              </div>
              
              <div>
                <span className="font-medium block">ID do Status:</span>
                <span>{asset.status.id || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFullDataDialog;
