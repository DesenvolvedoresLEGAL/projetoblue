
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EquipmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    radio: '',
    serial_number: '',
    model: '',
    solution_id: '',
    manufacturer_id: '',
    admin_user: 'admin',
    admin_pass: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar soluções (exceto CHIP)
  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('*')
        .neq('id', 11) // Excluir CHIP
        .is('deleted_at', null)
        .order('solution');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar fabricantes
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.radio || !formData.serial_number || !formData.model || !formData.solution_id) {
      toast.error('Rádio, serial, modelo e solução são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('assets')
        .insert({
          solution_id: parseInt(formData.solution_id),
          status_id: 1, // DISPONÍVEL
          radio: formData.radio,
          serial_number: formData.serial_number,
          model: formData.model,
          manufacturer_id: formData.manufacturer_id ? parseInt(formData.manufacturer_id) : null,
          admin_user: formData.admin_user,
          admin_pass: formData.admin_pass,
          notes: formData.notes || null
        });

      if (error) {
        console.error('Erro ao criar equipamento:', error);
        toast.error('Erro ao cadastrar equipamento');
        return;
      }

      toast.success('Equipamento cadastrado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro inesperado ao cadastrar equipamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rádio */}
        <div className="space-y-2">
          <Label htmlFor="radio">Rádio/Etiqueta *</Label>
          <Input
            id="radio"
            value={formData.radio}
            onChange={(e) => setFormData(prev => ({ ...prev, radio: e.target.value }))}
            placeholder="Digite o número do rádio"
            required
          />
        </div>

        {/* Serial */}
        <div className="space-y-2">
          <Label htmlFor="serial_number">Número de Série *</Label>
          <Input
            id="serial_number"
            value={formData.serial_number}
            onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
            placeholder="Digite o número de série"
            required
          />
        </div>

        {/* Modelo */}
        <div className="space-y-2">
          <Label htmlFor="model">Modelo *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            placeholder="Digite o modelo"
            required
          />
        </div>

        {/* Solução */}
        <div className="space-y-2">
          <Label htmlFor="solution_id">Solução *</Label>
          <Select
            value={formData.solution_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, solution_id: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a solução" />
            </SelectTrigger>
            <SelectContent>
              {solutions.map((solution) => (
                <SelectItem key={solution.id} value={solution.id.toString()}>
                  {solution.solution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fabricante */}
        <div className="space-y-2">
          <Label htmlFor="manufacturer_id">Fabricante</Label>
          <Select
            value={formData.manufacturer_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, manufacturer_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o fabricante" />
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

        {/* Usuário Admin */}
        <div className="space-y-2">
          <Label htmlFor="admin_user">Usuário Admin</Label>
          <Input
            id="admin_user"
            value={formData.admin_user}
            onChange={(e) => setFormData(prev => ({ ...prev, admin_user: e.target.value }))}
            placeholder="admin"
          />
        </div>

        {/* Senha Admin */}
        <div className="space-y-2">
          <Label htmlFor="admin_pass">Senha Admin</Label>
          <Input
            id="admin_pass"
            type="password"
            value={formData.admin_pass}
            onChange={(e) => setFormData(prev => ({ ...prev, admin_pass: e.target.value }))}
            placeholder="Digite a senha do admin"
          />
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
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar Equipamento'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;
