
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { toast } from 'sonner';
import { mapDatabaseClientToFrontend, normalizePhoneForStorage } from '@/utils/clientMappers';
import { formatPhoneNumber } from '@/utils/phoneFormatter';
import { useClientRegistrationState, ClientRegistrationFormData } from '@/modules/clients/hooks/useClientRegistrationState';

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
  clearStateOnSuccess?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, clearStateOnSuccess = true }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    formData,
    isFormDataLoaded,
    updateFormData,
    clearState,
    syncWithForm
  } = useClientRegistrationState();

  const [localFormData, setLocalFormData] = useState<ClientRegistrationFormData>(formData);

  // Sync local form data with sessionStorage data when loaded
  useEffect(() => {
    if (isFormDataLoaded) {
      console.log('[ClientForm] Setting form data from sessionStorage:', formData);
      setLocalFormData(formData);
    }
  }, [formData, isFormDataLoaded]);

  // Update sessionStorage when local form data changes
  useEffect(() => {
    if (isFormDataLoaded) {
      updateFormData(localFormData);
    }
  }, [localFormData, updateFormData, isFormDataLoaded]);

  const isFormValid = localFormData.empresa.trim().length >= 2 && 
                     localFormData.responsavel.trim().length >= 2 &&
                     localFormData.telefones.some(tel => tel.trim().length >= 10);

  const addPhoneField = () => {
    setLocalFormData(prev => ({
      ...prev,
      telefones: [...prev.telefones, '']
    }));
  };

  const removePhoneField = (index: number) => {
    setLocalFormData(prev => ({
      ...prev,
      telefones: prev.telefones.filter((_, i) => i !== index)
    }));
  };

  const updatePhone = (index: number, value: string) => {
    // Remove formatação para validação e armazenamento
    const cleanValue = value.replace(/\D/g, '');
    // Aplica formatação apenas para exibição
    const formattedValue = formatPhoneNumber(cleanValue);
    
    setLocalFormData(prev => ({
      ...prev,
      telefones: prev.telefones.map((tel, i) => i === index ? formattedValue : tel)
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
      // Limpar e normalizar telefones para array de strings sem formatação
      const cleanPhones = localFormData.telefones
        .filter(tel => tel.trim())
        .map(tel => normalizePhoneForStorage(tel));

      const dbData = {
        empresa: localFormData.empresa.trim(),
        responsavel: localFormData.responsavel.trim(),
        telefones: cleanPhones, // Enviar como array, não como string JSON
        email: localFormData.email?.trim() || null,
        cnpj: localFormData.cnpj?.trim() || null,
        // Campos legados para compatibilidade
        nome: localFormData.empresa.trim(),
        contato: cleanPhones.length > 0 ? parseInt(cleanPhones[0]) || 0 : 0
      };

      console.log('Dados sendo enviados:', dbData);

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
      
      // Clear sessionStorage on successful submission
      if (clearStateOnSuccess) {
        clearState();
      }
      
      onSubmit(newClient);
      toast.success('Cliente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast.error('Erro ao cadastrar cliente. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render form until data is loaded
  if (!isFormDataLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="empresa" className="font-neue-haas font-bold text-[#020CBC]">
          Nome da Empresa *
        </Label>
        <Input
          id="empresa"
          value={localFormData.empresa}
          onChange={(e) => setLocalFormData({ ...localFormData, empresa: e.target.value })}
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
          value={localFormData.responsavel}
          onChange={(e) => setLocalFormData({ ...localFormData, responsavel: e.target.value })}
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
        {localFormData.telefones.map((telefone, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={telefone}
              onChange={(e) => updatePhone(index, e.target.value)}
              placeholder="(11) 99999-9999"
              className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
              required={index === 0}
              maxLength={15} // Limitar o tamanho do campo
            />
            {localFormData.telefones.length > 1 && (
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
          value={localFormData.email}
          onChange={(e) => setLocalFormData({ ...localFormData, email: e.target.value })}
          placeholder="cliente@empresa.com"
          className="border-[#4D2BFB]/30 focus:border-[#4D2BFB] focus:ring-[#4D2BFB]/20 font-neue-haas"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj" className="font-neue-haas font-bold text-[#020CBC]">
          CNPJ (opcional)
        </Label>
        <Input
          id="cnpj"
          value={localFormData.cnpj}
          onChange={(e) => setLocalFormData({ ...localFormData, cnpj: e.target.value })}
          placeholder="00.000.000/0000-00"
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
