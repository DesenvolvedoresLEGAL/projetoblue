
import React, { useState } from 'react';
import { Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { toast } from 'sonner';
import { mapDatabaseClientToFrontend, normalizePhoneForStorage } from '@/utils/clientMappers';
import { useClientRegistrationState } from '@/modules/clients/hooks/useClientRegistrationState';
import { useClientFormValidation } from './hooks/useClientFormValidation';
import { PhoneFields } from './components/PhoneFields';
import { ClientFormFields } from './components/ClientFormFields';
import { ClientFormActions } from './components/ClientFormActions';

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
    updateField,
    clearState,
    addPhoneField,
    removePhoneField,
    updatePhone
  } = useClientRegistrationState();

  const { isFormValid } = useClientFormValidation(formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Preencha empresa, responsável e pelo menos um telefone válido');
      return;
    }

    setIsLoading(true);

    try {
      // Limpar e normalizar telefones para array de strings sem formatação
      const cleanPhones = formData.telefones
        .filter(tel => tel.trim())
        .map(tel => normalizePhoneForStorage(tel));

      const dbData = {
        empresa: formData.empresa.trim(),
        responsavel: formData.responsavel.trim(),
        telefones: cleanPhones,
        email: formData.email?.trim() || null,
        cnpj: formData.cnpj?.trim() || null,
        // Campos legados para compatibilidade
        nome: formData.empresa.trim(),
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
      <ClientFormFields 
        formData={formData}
        onUpdateField={updateField}
      />

      <PhoneFields
        phones={formData.telefones}
        onAddPhone={addPhoneField}
        onRemovePhone={removePhoneField}
        onUpdatePhone={updatePhone}
      />

      <ClientFormActions
        onCancel={onCancel}
        isLoading={isLoading}
        isFormValid={isFormValid}
      />
    </form>
  );
};
