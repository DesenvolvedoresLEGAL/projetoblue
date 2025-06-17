
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { translateAssetError } from '@/utils/errorTranslator';
import { toast } from 'sonner';

interface ChipFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ChipForm: React.FC<ChipFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    iccid: '',
    line_number: '',
    manufacturer_id: '',
    plan_id: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar operadoras (fabricantes)
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .is('deleted_at', null)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar planos
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .is('deleted_at', null)
        .order('nome');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.iccid || !formData.line_number) {
      toast.error('ICCID e número da linha são obrigatórios. Por favor, preencha todos os campos necessários.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('assets')
        .insert({
          solution_id: 11, // CHIP
          status_id: 1, // DISPONÍVEL
          iccid: formData.iccid,
          line_number: parseInt(formData.line_number),
          manufacturer_id: formData.manufacturer_id ? parseInt(formData.manufacturer_id) : null,
          plan_id: formData.plan_id ? parseInt(formData.plan_id) : null,
          notes: formData.notes || null
        });

      if (error) {
        console.error('Erro ao criar CHIP:', error);
        toast.error(translateAssetError(error, 'create'));
        return;
      }

      toast.success('CHIP cadastrado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro:', error);
      toast.error(translateAssetError(error, 'create'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ICCID */}
        <div className="space-y-2">
          <Label htmlFor="iccid">ICCID *</Label>
          <Input
            id="iccid"
            value={formData.iccid}
            onChange={(e) => setFormData(prev => ({ ...prev, iccid: e.target.value }))}
            placeholder="Digite o ICCID"
            required
          />
        </div>

        {/* Número da linha */}
        <div className="space-y-2">
          <Label htmlFor="line_number">Número da Linha *</Label>
          <Input
            id="line_number"
            type="number"
            value={formData.line_number}
            onChange={(e) => setFormData(prev => ({ ...prev, line_number: e.target.value }))}
            placeholder="Digite o número da linha"
            required
          />
        </div>

        {/* Operadora */}
        <div className="space-y-2">
          <Label htmlFor="manufacturer_id">Operadora</Label>
          <Select
            value={formData.manufacturer_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, manufacturer_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a operadora" />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                  {manufacturer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plano */}
        <div className="space-y-2">
          <Label htmlFor="plan_id">Plano</Label>
          <Select
            value={formData.plan_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, plan_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o plano" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.nome} {plan.tamanho_gb && `(${plan.tamanho_gb}GB)`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Observações adicionais..."
          rows={3}
        />
      </div>

      {/* Botões */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas"
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar CHIP'}
        </Button>
      </div>
    </form>
  );
};

export default ChipForm;
