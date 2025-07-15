import { useQuery } from '@tanstack/react-query';
import { listAssociations } from '../services/associationsService';

export const useAssociations = () => {
  return useQuery({
    queryKey: ['associations'],
    queryFn: listAssociations,
  });
};
