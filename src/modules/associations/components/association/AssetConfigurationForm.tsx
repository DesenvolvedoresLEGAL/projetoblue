
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Settings, Wifi, Smartphone, Package } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';
import { useQuery } from '@tanstack/react-query';
import { referenceDataService } from '@modules/assets/services/referenceDataService';

interface AssetConfigurationFormProps {
  asset: SelectedAsset;
  open: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
}

export const AssetConfigurationForm: React.FC<AssetConfigurationFormProps> = ({
  asset,
  open,
  onClose,
  onSave
}) => {
  // Estados para configurações específicas do ativo
  const [ssidAtual, setSsidAtual] = useState(asset.ssid_atual || '');
  const [passAtual, setPassAtual] = useState(asset.pass_atual || '');
  const [isPrincipalChip, setIsPrincipalChip] = useState(asset.isPrincipalChip || false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(asset.plan_id || null);
  const [customGb, setCustomGb] = useState(asset.gb || 0);
  const [rentedDays, setRentedDays] = useState(asset.rented_days || 30);
  const [notes, setNotes] = useState(asset.notes || '');

  // Buscar planos disponíveis
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => referenceDataService.getPlans()
  });

  // Verificar se é equipamento (não CHIP)
  const isEquipment = asset.solution_id !== 11 && asset.type !== 'CHIP';
  
  // Verificar se é CHIP
  const isChip = asset.solution_id === 11 || asset.type === 'CHIP';

  // Verificar se o plano selecionado é customizado
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);
  const isCustomPlan = selectedPlan && (
    selectedPlan.nome.toLowerCase().includes('customizado') || 
    selectedPlan.nome.toLowerCase().includes('outro') ||
    selectedPlan.nome.toLowerCase().includes('personalizado')
  );

  const handleSave = () => {
    const config: any = {
      notes,
    };

    // Configurações específicas para equipamentos
    if (isEquipment) {
      config.ssid_atual = ssidAtual;
      config.pass_atual = passAtual;
      config.rented_days = rentedDays;
    }

    // Configurações específicas para CHIPs
    if (isChip) {
      config.isPrincipalChip = isPrincipalChip;
      config.plan_id = selectedPlanId;
      config.gb = isCustomPlan ? customGb : 0;
      config.notes = isPrincipalChip ? 'principal' : 'backup';
    }

    onSave(config);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#03F9FF]" />
            Configurar Ativo
          </DialogTitle>
          <DialogDescription>
            Configure as propriedades específicas deste ativo para a associação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Ativo */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {isChip ? (
                  <Smartphone className="h-4 w-4 text-green-600" />
                ) : (
                  <Wifi className="h-4 w-4 text-blue-600" />
                )}
                Informações do Ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span> {asset.type}
                </div>
                <div>
                  <span className="font-medium">Solução:</span> {asset.solucao}
                </div>
                {asset.marca && (
                  <div>
                    <span className="font-medium">Marca:</span> {asset.marca}
                  </div>
                )}
                {asset.modelo && (
                  <div>
                    <span className="font-medium">Modelo:</span> {asset.modelo}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configurações específicas para equipamentos */}
          {isEquipment && (
            <Card className="border-[#4D2BFB]/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-[#03F9FF]" />
                  Configurações de Rede
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ssid-atual" className="text-sm">SSID da Rede</Label>
                    <Input
                      id="ssid-atual"
                      value={ssidAtual}
                      onChange={(e) => setSsidAtual(e.target.value)}
                      placeholder="Nome da rede WiFi"
                    />
                    <p className="text-xs text-muted-foreground">
                      Nome da rede WiFi que será configurada
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pass-atual" className="text-sm">Senha da Rede</Label>
                    <Input
                      id="pass-atual"
                      type="password"
                      value={passAtual}
                      onChange={(e) => setPassAtual(e.target.value)}
                      placeholder="Senha da rede WiFi"
                    />
                    <p className="text-xs text-muted-foreground">
                      Senha para acesso à rede
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rented-days" className="text-sm">Dias de Aluguel</Label>
                  <Input
                    id="rented-days"
                    type="number"
                    value={rentedDays}
                    onChange={(e) => setRentedDays(parseInt(e.target.value) || 30)}
                    placeholder="30"
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configurações específicas para CHIPs */}
          {isChip && (
            <div className="space-y-4">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4 text-[#03F9FF]" />
                    Configuração do CHIP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="principal-chip"
                      checked={isPrincipalChip}
                      onCheckedChange={(checked) => setIsPrincipalChip(checked === true)}
                    />
                    <Label htmlFor="principal-chip" className="text-sm font-medium">
                      Este chip é principal?
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#4D2BFB]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-[#03F9FF]" />
                    Plano do CHIP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-select" className="text-sm">Plano *</Label>
                    <Select 
                      value={selectedPlanId?.toString()} 
                      onValueChange={(value) => setSelectedPlanId(parseInt(value))}
                      disabled={plansLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={plansLoading ? "Carregando planos..." : "Selecione o plano"} />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.nome}
                            {plan.tamanho_gb && plan.tamanho_gb > 0 && ` (${plan.tamanho_gb}GB)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isCustomPlan && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-gb" className="text-sm">Tamanho (GB) *</Label>
                      <Input
                        id="custom-gb"
                        type="number"
                        value={customGb}
                        onChange={(e) => setCustomGb(parseInt(e.target.value) || 0)}
                        placeholder="Ex: 10"
                        min="1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Observações */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações específicas para este ativo..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white">
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
