
import { useQuery } from '@tanstack/react-query';
import { associationTypesService } from '../services/associationTypesService';

export const useAssociationTypes = () => {
  return useQuery({
    queryKey: ['association-types'],
    queryFn: associationTypesService.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
