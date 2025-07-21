
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
      

      const data = await associationService.endAssociation(association.uuid, exitDate, notes);   
      
      toast.success('Associação finalizada com sucesso!');
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      return data;
    } catch (error) {
     
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
