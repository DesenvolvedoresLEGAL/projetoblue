
import { useState } from 'react';
import { toast } from '@/utils/toast';
import { associationService } from '../services/associationService';
import { AssociationWithRelations } from '../types/associationsTypes';

interface UseEndAssociationOptions {
  onSuccess?: () => void;
}

export const useEndAssociation = (options?: UseEndAssociationOptions) => {
  const [isLoading, setIsLoading] = useState(false);

  const endAssociation = async (
    association: AssociationWithRelations,
    exitDate: string,
    notes?: string
  ) => {
    try {
      setIsLoading(true);
      
      // Simular chamada à API - na implementação real, usar associationService
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular atualização dos dados mockados
      const updatedAssociation = {
        ...association,
        exit_date: exitDate,
        status: false,
        notes: notes ? `${association.notes || ''} | Finalizada: ${notes}` : association.notes,
        updated_at: new Date().toISOString()
      };
      
      toast.success('Associação finalizada com sucesso!');
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      return updatedAssociation;
    } catch (error) {
      console.error('Erro ao finalizar associação:', error);
      toast.error('Erro ao finalizar associação. Tente novamente.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    endAssociation,
    isLoading
  };
};
