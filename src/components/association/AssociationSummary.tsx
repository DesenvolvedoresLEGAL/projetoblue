
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, User, Package, Calendar, Settings } from "lucide-react";
import { Client } from '@/types/asset';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConfirmationModal } from './ConfirmationModal';
import { formatPhoneNumber, parsePhoneFromScientific } from '@/utils/phoneFormatter';

interface AssociationSummaryProps {
  client: Client;
  assets: SelectedAsset[];
  onComplete: () => void;
  onBack: () => void;
}

interface AssociationConfig {
  type: 'aluguel' | 'assinatura';
  entryDate: string;
  exitDate: string;
}

export const AssociationSummary: React.FC<AssociationSummaryProps> = ({
  client,
  assets,
  onComplete,
  onBack
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKnowWhatImDoingModal, setShowKnowWhatImDoingModal] = useState(false);
  const [associationConfig, setAssociationConfig] = useState<AssociationConfig>({
    type: 'aluguel',
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: ''
  });

  const validateBusinessRules = () => {
    const speedyAssets = assets.filter(asset => 
      asset.solucao === 'SPEEDY 5G' || asset.solution_id === 1
    );
    const chipAssets = assets.filter(asset => asset.type === 'CHIP');

    return {
      hasSpeedyWithoutChip: speedyAssets.length > 0 && chipAssets.length === 0,
      speedyCount: speedyAssets.length,
      chipCount: chipAssets.length
    };
  };

  const handleSubmit = async (forceSubmit = false) => {
    setIsSubmitting(true);

    try {
      const validation = validateBusinessRules();

      // Validar regra SPEEDY + CHIP (se não forçou submissão)
      if (!forceSubmit && validation.hasSpeedyWithoutChip) {
        setShowKnowWhatImDoingModal(true);
        setIsSubmitting(false);
        return;
      }

      // Validar data de entrada
      if (!associationConfig.entryDate) {
        toast.error('Data de entrada é obrigatória');
        setIsSubmitting(false);
        return;
      }

      // Validar se data de saída é posterior à data de entrada
      if (associationConfig.exitDate && associationConfig.exitDate <= associationConfig.entryDate) {
        toast.error('Data de saída deve ser posterior à data de entrada');
        setIsSubmitting(false);
        return;
      }

      // Validar campos obrigatórios
      for (const asset of assets) {
        if (asset.type === 'CHIP') {
          if (!asset.line_number) {
            toast.error(`CHIP ${asset.iccid}: Número da linha é obrigatório`);
            setIsSubmitting(false);
            return;
          }
        } else {
          if (!asset.serial_number || !asset.model) {
            toast.error(`Equipamento ${asset.radio}: Serial e modelo são obrigatórios`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Determinar status baseado no tipo de associação
      const statusId = associationConfig.type === 'assinatura' ? 3 : 2; // 3 = assinatura, 2 = alugado
      const associationTypeId = associationConfig.type === 'assinatura' ? 2 : 1; // 2 = assinatura, 1 = aluguel

      // Criar associações
      for (const asset of assets) {
        // Atualizar ativo
        const updateData: any = {
          status_id: statusId,
        };

        if (asset.type === 'CHIP') {
          updateData.line_number = parseInt(asset.line_number!);
          updateData.manufacturer_id = asset.manufacturer_id;
          updateData.plan_id = asset.plan_id;
        } else {
          updateData.serial_number = asset.serial_number;
          updateData.model = asset.model;
          updateData.radio = asset.radio;
          updateData.rented_days = asset.rented_days || 0;
          updateData.manufacturer_id = asset.manufacturer_id;
          updateData.solution_id = asset.solution_id;
          updateData.admin_user = asset.admin_user || 'admin';
          updateData.admin_pass = asset.admin_pass || '';
        }

        const { error: updateError } = await supabase
          .from('assets')
          .update(updateData)
          .eq('uuid', asset.uuid);

        if (updateError) {
          console.error('Error updating asset:', updateError);
          toast.error(`Erro ao atualizar ativo ${asset.type === 'CHIP' ? asset.iccid : asset.radio}`);
          setIsSubmitting(false);
          return;
        }

        // Criar associação
        const associationData = {
          asset_id: asset.uuid,
          client_id: client.uuid,
          entry_date: associationConfig.entryDate,
          exit_date: associationConfig.exitDate || null,
          association_id: associationTypeId,
          plan_id: asset.plan_id || 1, // Default plan
          notes: asset.notes || null,
          gb: asset.gb || 0,
          ssid: asset.ssid || null,
          pass: asset.password || null
        };

        const { error: assocError } = await supabase
          .from('asset_client_assoc')
          .insert(associationData);

        if (assocError) {
          console.error('Error creating association:', assocError);
          toast.error(`Erro ao criar associação para ${asset.type === 'CHIP' ? asset.iccid : asset.radio}`);
          setIsSubmitting(false);
          return;
        }
      }

      onComplete();
    } catch (error) {
      console.error('Error in association submission:', error);
      toast.error('Erro inesperado ao criar associações');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validation = validateBusinessRules();

  return (
    <div className="space-y-6">
      {/* Configuração da Associação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Configuração da Associação
          </CardTitle>
          <CardDescription>
            Configure o tipo de associação e as datas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Associação */}
            <div className="space-y-2">
              <Label htmlFor="association-type">Tipo de Associação</Label>
              <Select
                value={associationConfig.type}
                onValueChange={(value: 'aluguel' | 'assinatura') => 
                  setAssociationConfig(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="assinatura">Assinatura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data de Entrada */}
            <div className="space-y-2">
              <Label htmlFor="entry-date">Data de Entrada *</Label>
              <Input
                id="entry-date"
                type="date"
                value={associationConfig.entryDate}
                onChange={(e) => 
                  setAssociationConfig(prev => ({ ...prev, entryDate: e.target.value }))
                }
                required
              />
            </div>

            {/* Data de Saída */}
            <div className="space-y-2">
              <Label htmlFor="exit-date">Data de Saída (opcional)</Label>
              <Input
                id="exit-date"
                type="date"
                value={associationConfig.exitDate}
                onChange={(e) => 
                  setAssociationConfig(prev => ({ ...prev, exitDate: e.target.value }))
                }
                min={associationConfig.entryDate}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirmação da Associação
          </CardTitle>
          <CardDescription>
            Revise os dados antes de finalizar a associação entre cliente e ativos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumo do cliente */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente
            </h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nome:</span>
                  <p className="text-muted-foreground">{client.nome}</p>
                </div>
                <div>
                  <span className="font-medium">CNPJ:</span>
                  <p className="text-muted-foreground">{client.cnpj}</p>
                </div>
                <div>
                  <span className="font-medium">Telefone:</span>
                  <p className="text-muted-foreground">{formatPhoneNumber(parsePhoneFromScientific(client.contato))}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo da associação */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Associação
            </h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span>
                  <p className="text-muted-foreground capitalize">{associationConfig.type}</p>
                </div>
                <div>
                  <span className="font-medium">Data de Entrada:</span>
                  <p className="text-muted-foreground">
                    {new Date(associationConfig.entryDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Data de Saída:</span>
                  <p className="text-muted-foreground">
                    {associationConfig.exitDate 
                      ? new Date(associationConfig.exitDate).toLocaleDateString('pt-BR')
                      : 'Não definida'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo dos ativos */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Ativos ({assets.length})
            </h3>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.uuid} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {asset.type === 'CHIP' ? '📱' : '📡'}
                    <span className="font-medium">
                      {asset.type === 'CHIP' ? 'CHIP' : 'EQUIPAMENTO'}
                      {asset.solucao && ` - ${asset.solucao}`}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {asset.type === 'CHIP' ? (
                      <>
                        <div>ICCID: {asset.iccid}</div>
                        <div>Linha: {formatPhoneNumber(asset.line_number || '')}</div>
                        <div>GB: {asset.gb || 0}</div>
                        <div>Plano: {asset.plan_id || 'Não informado'}</div>
                      </>
                    ) : (
                      <>
                        <div>Rádio: {asset.radio}</div>
                        <div>Serial: {asset.serial_number}</div>
                        <div>Modelo: {asset.model}</div>
                        <div>Dias Aluguel: {asset.rented_days || 0}</div>
                        <div>SSID: {asset.ssid || '#WiFi.LEGAL'}</div>
                        <div>Senha: {asset.password || '123legal'}</div>
                      </>
                    )}
                  </div>
                  
                  {asset.notes && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Observações:</span> {asset.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Validações */}
          <div className="space-y-2">
            {validation.hasSpeedyWithoutChip && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Atenção: Equipamento SPEEDY 5G sem CHIP associado
              </div>
            )}
            
            {!validation.hasSpeedyWithoutChip && validation.speedyCount > 0 && validation.chipCount > 0 && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Regra SPEEDY + CHIP validada
              </div>
            )}
            
            {assets.length > 0 && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                {assets.length} ativo(s) selecionado(s)
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Finalizando...' : 'Finalizar Associação'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal "Sei o que estou fazendo" */}
      <ConfirmationModal
        open={showKnowWhatImDoingModal}
        onOpenChange={setShowKnowWhatImDoingModal}
        title="Associação sem CHIP"
        description={`Você está associando ${validation.speedyCount} equipamento(s) SPEEDY 5G sem nenhum CHIP. Esta configuração pode não funcionar adequadamente. Tem certeza que deseja continuar?`}
        confirmText="Sei o que estou fazendo"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={() => handleSubmit(true)}
      />
    </div>
  );
};
