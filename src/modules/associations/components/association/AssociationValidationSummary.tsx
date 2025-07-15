
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';
import { AssociationGeneralConfig } from './AssociationGeneralConfig';

interface ValidationRule {
  id: string;
  title: string;
  isValid: boolean;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
}

interface AssociationValidationSummaryProps {
  selectedAssets: SelectedAsset[];
  generalConfig: AssociationGeneralConfig;
  selectedClient: any;
}

export const AssociationValidationSummary: React.FC<AssociationValidationSummaryProps> = ({
  selectedAssets,
  generalConfig,
  selectedClient
}) => {
  const validateAssociation = (): ValidationRule[] => {
    const rules: ValidationRule[] = [];

    // Validação de cliente
    rules.push({
      id: 'client',
      title: 'Cliente Selecionado',
      isValid: !!selectedClient,
      message: selectedClient ? `Cliente: ${selectedClient.empresa}` : 'Nenhum cliente selecionado',
      type: selectedClient ? 'success' : 'error'
    });

    // Validação de ativos
    rules.push({
      id: 'assets',
      title: 'Ativos Selecionados',
      isValid: selectedAssets.length > 0,
      message: selectedAssets.length > 0 ? 
        `${selectedAssets.length} ativo(s) selecionado(s)` : 
        'Nenhum ativo selecionado',
      type: selectedAssets.length > 0 ? 'success' : 'error'
    });

    // Validação de equipamentos Speedy
    const speedyEquipments = selectedAssets.filter(asset => 
      asset.type === 'EQUIPMENT' && 
      (asset.modelo?.includes('SPEEDY') || asset.model?.includes('SPEEDY'))
    );

    if (speedyEquipments.length > 0) {
      const chipsAssociated = selectedAssets.filter(asset => 
        asset.type === 'CHIP' && asset.associatedEquipmentId
      );

      rules.push({
        id: 'speedy-chip',
        title: 'Equipamentos Speedy + CHIP',
        isValid: speedyEquipments.length === chipsAssociated.length,
        message: speedyEquipments.length === chipsAssociated.length ?
          'Todos os equipamentos Speedy têm CHIPs associados' :
          `${speedyEquipments.length - chipsAssociated.length} equipamento(s) Speedy sem CHIP`,
        type: speedyEquipments.length === chipsAssociated.length ? 'success' : 'warning'
      });
    }

    // Validação de datas
    rules.push({
      id: 'start-date',
      title: 'Data de Início',
      isValid: !!generalConfig.startDate,
      message: generalConfig.startDate ? 
        `Início: ${generalConfig.startDate.toLocaleDateString()}` : 
        'Data de início não definida',
      type: generalConfig.startDate ? 'success' : 'error'
    });

    // Validação de tipo de associação
    rules.push({
      id: 'association-type',
      title: 'Tipo de Associação',
      isValid: !!generalConfig.associationType,
      message: generalConfig.associationType ? 
        `Tipo: ${generalConfig.associationType === 1 ? 'Aluguel' : 'Assinatura'}` : 
        'Tipo de associação não definido',
      type: generalConfig.associationType ? 'success' : 'error'
    });

    return rules;
  };

  const rules = validateAssociation();
  const errors = rules.filter(rule => rule.type === 'error');
  const warnings = rules.filter(rule => rule.type === 'warning');
  const success = rules.filter(rule => rule.type === 'success');
  const isValidForSubmission = errors.length === 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-5 w-5 text-[#03F9FF]" />
            Resumo da Validação
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={isValidForSubmission ? "default" : "destructive"}>
              {isValidForSubmission ? 'Pronto para Submeter' : 'Pendências'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status geral */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{success.length}</div>
            <div className="text-sm text-green-600">Válidos</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{warnings.length}</div>
            <div className="text-sm text-yellow-600">Avisos</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{errors.length}</div>
            <div className="text-sm text-red-600">Erros</div>
          </div>
        </div>

        {/* Lista de validações */}
        <div className="space-y-2">
          {rules.map((rule) => (
            <Alert key={rule.id} variant={getAlertVariant(rule.type)}>
              <div className="flex items-center gap-2">
                {getIcon(rule.type)}
                <div className="flex-1">
                  <div className="font-medium text-sm">{rule.title}</div>
                  <AlertDescription className="text-xs">
                    {rule.message}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>

        {/* Resumo final */}
        {isValidForSubmission ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Tudo pronto!</strong> A associação pode ser criada com sucesso.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Ação necessária:</strong> Corrija os erros acima antes de prosseguir.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
