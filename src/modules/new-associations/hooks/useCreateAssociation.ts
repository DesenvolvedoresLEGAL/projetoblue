import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAssociation, NewAssociationInsert } from '../services/associationsService';

export const useCreateAssociation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewAssociationInsert) => createAssociation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associations'] });
    },
  });
};
