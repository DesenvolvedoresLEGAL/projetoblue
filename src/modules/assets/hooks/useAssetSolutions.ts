
import { useQuery } from '@tanstack/react-query';
import { referenceDataService } from '@modules/assets/services/referenceDataService';

export const useAssetSolutions = () => {
  return useQuery({
    queryKey: ['asset-solutions'],
    queryFn: () => referenceDataService.getAssetSolutions(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export default useAssetSolutions;
