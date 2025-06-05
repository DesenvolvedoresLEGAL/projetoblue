
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import { formatDate } from '@/utils/formatDate';
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, Wifi, Smartphone, Router } from "lucide-react";
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

  const renderCopyableField = (value: string | undefined, label: string, isPassword = false) => {
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

  const isChip = asset.solucao.id === 11;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isChip ? (
                <Smartphone className="h-5 w-5 text-blue-600" />
              ) : (
                <Router className="h-5 w-5 text-green-600" />
              )}
              Dados Completos do Ativo
            </div>
            {!isChip && (
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
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Informações Básicas
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-sm">Identificador:</span>
                <span className="text-sm">{asset.uuid}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-sm">Tipo:</span>
                <span className="text-sm">{asset.solucao.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-sm">Status:</span>
                <AssetStatusBadge status={asset.status.name} />
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-sm">Fabricante:</span>
                <span className="text-sm">{asset.manufacturer.name}</span>
              </div>
              
              {asset.model && (
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Modelo:</span>
                  <span className="text-sm">{asset.model}</span>
                </div>
              )}

              {asset.rented_days !== undefined && (
                <div className="flex justify-between">
                  <span className="font-medium text-sm">Dias Alugados:</span>
                  <span className="text-sm">{asset.rented_days}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detalhes Técnicos - Específicos por Tipo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Detalhes Técnicos
            </h3>
            
            <div className="space-y-3">
              {isChip ? (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">ICCID:</span>
                    {renderCopyableField(asset.iccid, 'ICCID')}
                  </div>
                  
                  {asset.line_number && (
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Número de Linha:</span>
                      {renderCopyableField(asset.line_number.toString(), 'Número de Linha')}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">Número de Série:</span>
                    {renderCopyableField(asset.serial_number, 'Número de Série')}
                  </div>
                  
                  {asset.radio && (
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Rádio:</span>
                      {renderCopyableField(asset.radio, 'Rádio')}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Acesso Administrativo - Apenas para Equipamentos */}
            {!isChip && (
              <>
                <h4 className="font-semibold text-amber-800 flex items-center gap-2 mt-4">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Acesso Administrativo
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">Admin:</span>
                    {renderCopyableField(asset.admin_user, 'Usuário Admin')}
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">Senha:</span>
                    {renderPasswordField(asset.admin_pass, 'Senha Admin')}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Configurações de Rede - Apenas para Equipamentos */}
          {!isChip && (
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
                      {renderCopyableField(asset.ssid_fabrica, 'SSID de Fábrica')}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Senha WiFi:</span>
                      {renderCopyableField(asset.pass_fabrica, 'Senha WiFi de Fábrica', true)}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Admin:</span>
                      {renderCopyableField(asset.admin_user_fabrica, 'Usuário Admin de Fábrica')}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Senha Admin:</span>
                      {renderCopyableField(asset.admin_pass_fabrica, 'Senha Admin de Fábrica', true)}
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
                      {renderCopyableField(asset.ssid_atual, 'SSID Atual')}
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">Senha WiFi:</span>
                      {renderCopyableField(asset.pass_atual, 'Senha WiFi Atual', true)}
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

          {/* Informações de Sistema */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold border-b pb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              Informações de Sistema
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium block text-sm">Data de Criação:</span>
                <span className="text-sm">{formatDate(asset.created_at)}</span>
              </div>
              
              <div>
                <span className="font-medium block text-sm">Última Atualização:</span>
                <span className="text-sm">{formatDate(asset.updated_at)}</span>
              </div>
              
              <div>
                <span className="font-medium block text-sm">ID da Solução:</span>
                <span className="text-sm">{asset.solucao.id}</span>
              </div>
              
              <div>
                <span className="font-medium block text-sm">ID do Status:</span>
                <span className="text-sm">{asset.status.id || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetFullDataDialog;
