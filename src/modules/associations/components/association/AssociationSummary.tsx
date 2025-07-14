
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  ArrowLeft, 
  Save, 
  User, 
  Wifi, 
  Smartphone, 
  Calendar, 
  FileText,
  Settings
} from 'lucide-react';
import { Client } from '@/types/client';
import { SelectedAsset } from '@modules/associations/types';
import { AssociationGeneralConfig } from './AssociationGeneralConfig';
import { AssociationValidationSummary } from './AssociationValidationSummary';

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
  const equipmentCount = assets.filter(asset => asset.type === 'EQUIPMENT').length;
  const chipCount = assets.filter(asset => asset.type === 'CHIP').length;

  const getAssetIcon = (asset: SelectedAsset) => {
    return asset.type === 'EQUIPMENT' ? 
      <Wifi className="h-4 w-4 text-blue-600" /> : 
      <Smartphone className="h-4 w-4 text-green-600" />;
  };

  const getAssetIdentifier = (asset: SelectedAsset) => {
    if (asset.type === 'EQUIPMENT') {
      return asset.radio || asset.serial_number || asset.model || asset.uuid;
    } else {
      return asset.line_number || asset.iccid || asset.uuid;
    }
  };

  return (
    <div className="space-y-6">
      {/* Validação Summary */}
      <AssociationValidationSummary
        selectedAssets={assets}
        generalConfig={generalConfig}
        selectedClient={client}
      />

      {/* Resumo do Cliente */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-[#03F9FF]" />
            Cliente Selecionado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{client.empresa}</h3>
                <p className="text-sm text-gray-600">{client.nome}</p>
                <p className="text-sm text-gray-500">{client.contato}</p>
                {client.email && (
                  <p className="text-sm text-gray-500">{client.email}</p>
                )}
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Cliente
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Ativos */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-5 w-5 text-[#03F9FF]" />
              Ativos Selecionados ({assets.length})
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Wifi className="h-3 w-3 mr-1" />
                {equipmentCount}
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <Smartphone className="h-3 w-3 mr-1" />
                {chipCount}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assets.map((asset, index) => (
              <div key={asset.uuid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getAssetIcon(asset)}
                  <div>
                    <p className="font-medium text-sm">{getAssetIdentifier(asset)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={
                        asset.type === 'EQUIPMENT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }>
                        {asset.type === 'EQUIPMENT' ? 'Equipamento' : 'CHIP'}
                      </Badge>
                      {asset.associatedChip && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                          + CHIP {asset.associatedChip.isPrincipalChip ? 'Principal' : 'Backup'}
                        </Badge>
                      )}
                      {asset.associatedEquipmentId && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                          Associado a Equipamento
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuração Geral */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-[#03F9FF]" />
            Configuração da Associação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Data de Início:</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                {generalConfig.startDate.toLocaleDateString('pt-BR')}
              </p>
            </div>

            {generalConfig.endDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Data de Fim:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  {generalConfig.endDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Tipo:</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                {generalConfig.associationType === 1 ? 'Aluguel' : 'Assinatura'}
              </p>
            </div>

            {generalConfig.planGb && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">GB do Plano:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  {generalConfig.planGb} GB
                </p>
              </div>
            )}
          </div>

          {generalConfig.notes && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Observações:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6 bg-gray-50 p-3 rounded">
                  {generalConfig.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90 text-white flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Criando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Criar Associação
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
