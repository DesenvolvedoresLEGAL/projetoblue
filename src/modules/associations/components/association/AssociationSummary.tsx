
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building, Phone, Mail, Hash, User, Wifi, Smartphone } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';

import type { Client } from '@/types/client';
import type { AssociationGeneralConfig } from './AssociationGeneralConfig';

interface AssociationSummaryProps {
  client: Client;
  assets: SelectedAsset[];
  generalConfig: AssociationGeneralConfig;
  onComplete: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const AssociationSummary: React.FC<AssociationSummaryProps> = ({
  client,
  assets,
  generalConfig,
  onComplete,
  onBack,
  isLoading = false
}) => {
  const getAssetIdentifier = (asset: SelectedAsset) => {
    if (asset.type === 'CHIP') {
      return asset.iccid || asset.line_number || asset.uuid.substring(0, 8);
    }
    return asset.radio || asset.serial_number || asset.uuid.substring(0, 8);
  };

  const equipmentCount = assets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = assets.filter(asset => asset.type === 'CHIP').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-[#4D2BFB]/20">
        <CardHeader>
          <CardTitle className="text-xl text-[#4D2BFB] flex items-center gap-2">
            <User className="h-5 w-5" />
            Resumo da Associação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="h-4 w-4" />
                  <span className="text-sm font-medium">Empresa:</span>
                </div>
                <div className="font-medium text-gray-900 ml-6">
                  {client?.empresa || 'Não informado'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Responsável:</span>
                </div>
                <div className="font-medium text-gray-900 ml-6">
                  {client?.responsavel || client?.nome || 'Não informado'}
                </div>
              </div>
              
              {client?.telefones && client.telefones.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Telefone:</span>
                  </div>
                  <div className="font-medium text-gray-900 ml-6">
                    {client.telefones[0]}
                  </div>
                </div>
              )}
              
              {client?.contato && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">Contato:</span>
                  </div>
                  <div className="font-medium text-gray-900 ml-6">
                    {client.contato}
                  </div>
                </div>
              )}
              
              {client?.email && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email:</span>
                  </div>
                  <div className="font-medium text-gray-900 ml-6">
                    {client.email}
                  </div>
                </div>
              )}
              
              {client?.cnpj && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Hash className="h-4 w-4" />
                    <span className="text-sm font-medium">CNPJ:</span>
                  </div>
                  <div className="font-medium text-gray-900 ml-6">
                    {client.cnpj}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Resumo dos Ativos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Ativos Associados ({assets.length})
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Wifi className="h-3 w-3 mr-1" />
                  {equipmentCount} Equipamentos
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Smartphone className="h-3 w-3 mr-1" />
                  {chipCount} CHIPs
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              {assets.map((asset, index) => (
                <Card key={asset.uuid} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Ícone do tipo */}
                        <div className="flex-shrink-0">
                          {asset.type === 'CHIP' ? (
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Smartphone className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Wifi className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        
                        {/* Informações do ativo */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {index + 1}. {asset.type === 'CHIP' ? 'CHIP' : 'Equipamento'}:
                            </span>
                            <span className="font-semibold text-gray-900">
                              {getAssetIdentifier(asset)}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            {asset.type === 'CHIP' && asset.line_number && (
                              <div>Linha: {asset.line_number}</div>
                            )}
                            {asset.model && (
                              <div>Modelo: {asset.model}</div>
                            )}
                            {asset.brand && (
                              <div>Marca: {asset.brand}</div>
                            )}
                            {asset.solucao && (
                              <div>Solução: {asset.solucao}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="flex-shrink-0">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {asset.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Configurações da Associação */}
          {generalConfig && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Configurações da Associação
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Tipo de Associação:</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {generalConfig.associationType || 'ALUGUEL'}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">Data de Início:</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {generalConfig.startDate ? 
                        new Date(generalConfig.startDate).toLocaleDateString('pt-BR') : 
                        'Não definida'
                      }
                    </div>
                  </div>
                  
                  {generalConfig.endDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Data de Fim:</span>
                      <div className="font-medium text-gray-900 mt-1">
                        {new Date(generalConfig.endDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  )}
                  
                  {generalConfig.notes && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">Observações:</span>
                      <div className="font-medium text-gray-900 mt-1">
                        {generalConfig.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex items-center justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/10"
          disabled={isLoading}
        >
          Voltar
        </Button>
        <Button 
          onClick={onComplete}
          className="bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Criando Associações...' : 'Confirmar Associação'}
        </Button>
      </div>
    </div>
  );
};
