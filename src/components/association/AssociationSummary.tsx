import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Package, Users, AlertCircle } from "lucide-react";
import { Client } from '@/types/client';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { AssociationGeneralConfig } from './AssociationGeneralConfig';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatPhoneForDisplay } from '@/utils/clientMappers';

interface AssociationSummaryProps {
  client: Client;
  assets: SelectedAsset[];
  generalConfig: AssociationGeneralConfig;
  onComplete: () => void;
  onBack: () => void;
}

export const AssociationSummary: React.FC<AssociationSummaryProps> = ({
  client,
  assets,
  generalConfig,
  onComplete,
  onBack
}) => {
  const [isCreating, setIsCreating] = useState(false);

  // Usar telefones da nova estrutura
  const primaryPhone = client.telefones && client.telefones.length > 0 
    ? formatPhoneForDisplay(client.telefones[0]) 
    : '';

  const handleCreateAssociation = async () => {
    setIsCreating(true);
    
    try {
      console.log('Iniciando criação de associação:', {
        client: client.uuid,
        assets: assets.length,
        generalConfig
      });

      // Mapear tipo de associação para association_id correto
      const getAssociationId = (type: string) => {
        switch (type) {
          case 'ALUGUEL': return 1;
          case 'ASSINATURA': return 2;
          case 'EMPRESTIMO': return 3;
          default: 
            console.warn(`Tipo de associação não reconhecido: ${type}, usando ALUGUEL como padrão`);
            return 1;
        }
      };

      const associationId = getAssociationId(generalConfig.associationType);
      console.log(`Mapeando tipo ${generalConfig.associationType} para association_id: ${associationId}`);
      
      // Criar registros de associação para cada ativo
      const associationPromises = assets.map(async (asset) => {
        const associationData = {
          asset_id: asset.uuid,
          client_id: client.uuid,
          entry_date: format(generalConfig.startDate, 'yyyy-MM-dd'),
          exit_date: generalConfig.endDate ? format(generalConfig.endDate, 'yyyy-MM-dd') : null,
          association_id: associationId, // Usar ID mapeado corretamente
          notes: asset.notes || generalConfig.notes || null,
          // Campos específicos por ativo
          ssid: asset.ssid_atual || null,
          pass: asset.pass_atual || null,
          gb: asset.gb || 0
        };

        console.log(`Criando associação para ativo ${asset.uuid}:`, associationData);

        const { data, error } = await supabase
          .from('asset_client_assoc')
          .insert(associationData)
          .select()
          .single();

        if (error) {
          console.error(`Erro ao criar associação para ativo ${asset.uuid}:`, error);
          throw error;
        }

        console.log(`Associação criada com sucesso para ativo ${asset.uuid}:`, data);
        return data;
      });

      const results = await Promise.all(associationPromises);
      console.log('Todas as associações criadas com sucesso:', results);
      
      toast.success('Associações criadas com sucesso!');
      onComplete();
    } catch (error) {
      console.error('Erro ao criar associações:', error);
      
      // Tratamento de erro mais específico
      if (error?.code === '23503') {
        toast.error('Erro de configuração: tipo de associação inválido. Tente novamente.');
      } else if (error?.code === '23505') {
        toast.error('Alguns ativos já estão associados. Verifique os ativos selecionados.');
      } else {
        toast.error('Erro ao criar associações. Tente novamente.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getAssetTypeIcon = (asset: SelectedAsset) => {
    return asset.type === 'CHIP' ? '📱' : '📡';
  };

  const getAssociationTypeColor = (type: string) => {
    switch (type) {
      case 'ALUGUEL': return 'bg-blue-100 text-blue-800';
      case 'ASSINATURA': return 'bg-green-100 text-green-800';
      case 'EMPRESTIMO': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">Confirmar Associação</h3>
      </div>

      {/* Resumo da Configuração Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Configuração da Associação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Tipo:</span>
              <div className="mt-1">
                <Badge className={getAssociationTypeColor(generalConfig.associationType)}>
                  {generalConfig.associationType}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">Data de Início:</span>
              <p className="text-sm text-muted-foreground mt-1">
                {format(generalConfig.startDate, 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
            {generalConfig.endDate && (
              <div>
                <span className="text-sm font-medium">Data de Fim:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(generalConfig.endDate, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            )}
            {generalConfig.notes && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium">Observações Gerais:</span>
                <p className="text-sm text-muted-foreground mt-1">{generalConfig.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Empresa:</span>
              <p className="text-sm text-muted-foreground">{client.empresa}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Responsável:</span>
              <p className="text-sm text-muted-foreground">{client.responsavel}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Telefone:</span>
              <p className="text-sm text-muted-foreground">{primaryPhone}</p>
            </div>
            {client.email && (
              <div>
                <span className="text-sm font-medium">Email:</span>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Ativos Selecionados ({assets.length})
          </CardTitle>
          <CardDescription>
            Resumo dos ativos que serão associados ao cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset, index) => (
              <div key={asset.uuid}>
                <div className="flex items-start justify-between p-4 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getAssetTypeIcon(asset)}</span>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {asset.type === 'CHIP' ? 'CHIP' : 'EQUIPAMENTO'}
                        {asset.solucao && ` - ${asset.solucao}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {asset.type === 'CHIP' ? `ICCID: ${asset.iccid}` : `Rádio: ${asset.radio || asset.serial_number}`}
                      </div>
                      {asset.notes && (
                        <div className="text-xs">
                          <Badge variant="outline">{asset.notes}</Badge>
                        </div>
                      )}
                      {asset.ssid_atual && (
                        <div className="text-xs text-muted-foreground">
                          WiFi: {asset.ssid_atual}
                        </div>
                      )}
                      {asset.rented_days && generalConfig.associationType === 'ALUGUEL' && (
                        <div className="text-xs text-muted-foreground">
                          Dias de aluguel: {asset.rented_days}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < assets.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aviso importante */}
      <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800">Atenção</p>
          <p className="text-yellow-700">
            Ao confirmar, todos os ativos selecionados serão associados ao cliente nas condições especificadas.
            Esta ação não pode ser desfeita facilmente.
          </p>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isCreating}>
          Voltar
        </Button>
        
        <Button onClick={handleCreateAssociation} disabled={isCreating}>
          {isCreating ? 'Criando Associação...' : 'Confirmar e Criar Associação'}
        </Button>
      </div>
    </div>
  );
};
