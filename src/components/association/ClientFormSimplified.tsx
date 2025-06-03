
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { toast } from 'sonner';
import { mapDatabaseClientToFrontend, mapFormDataToDatabase, normalizePhoneForStorage } from '@/utils/clientMappers';

interface ClientFormSimplifiedProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
}

export const ClientFormSimplified: React.FC<ClientFormSimplifiedProps> = ({ onSubmit, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    empresa: '',
    responsavel: '',
    telefones: [''],
    email: ''
  });

  const isFormValid = formData.empresa.trim().length >= 2 && 
                     formData.responsavel.trim().length >= 2 &&
                     formData.telefones.some(tel => tel.trim().length >= 10);

  const addPhoneField = () => {
    setFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, '']
    }));
  };

  const removePhoneField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.filter((_, i) => i !== index)
    }));
  };

  const updatePhone = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      telefones: prev.telefones.map((tel, i) => i === index ? value : tel)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Preencha empresa, responsável e pelo menos um telefone válido');
      return;
    }

    setIsLoading(true);

    try {
      const dbData = mapFormDataToDatabase({
        ...formData,
        telefones: formData.telefones
          .filter(tel => tel.trim())
          .map(tel => normalizePhoneForStorage(tel))
      });

      const { data, error } = await supabase
        .from('clients')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar cliente:', error);
        throw error;
      }

      const newClient = mapDatabaseClientToFrontend(data);
      onSubmit(newClient);
      toast.success('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast.error('Erro ao cadastrar cliente. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="empresa" className="font-neue-haas font-bold text-[#020CBC]">
          Nome da Empresa *
        </Label>
        <Input
          id="empresa"
          value={formData.empresa}
          onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
          placeholder="Digite o nome da empresa"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsavel" className="font-neue-haas font-bold text-[#020CBC]">
          Nome do Responsável *
        </Label>
        <Input
          id="responsavel"
          value={formData.responsavel}
          onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
          placeholder="Digite o nome do responsável"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-neue-haas font-bold text-[#020CBC]">
            Telefones *
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPhoneField}
            className="text-[#4D2BFB] border-[#4D2BFB]"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
        {formData.telefones.map((telefone, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={telefone}
              onChange={(e) => updatePhone(index, e.target.value)}
              placeholder="(11) 99999-9999"
              className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
              required={index === 0}
            />
            {formData.telefones.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePhoneField(index)}
                className="text-red-500 border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="font-neue-haas font-bold text-[#020CBC]">
          Email (opcional)
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="cliente@empresa.com"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-neue-haas"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="flex-1 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Cadastrar Cliente
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
