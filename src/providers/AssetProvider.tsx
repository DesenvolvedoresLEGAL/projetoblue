
import { ReactNode } from 'react';
import { 
  QueryClient, 
  QueryClientProvider, 
} from '@tanstack/react-query';
import { assetQueryKeys } from '@/hooks/useAssetManagement';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Pre-fetch common datasets that are used across the application
const prefetchCommonData = async () => {
  // We'll prefetch statuses, manufacturers, and solutions
  await queryClient.prefetchQuery({ queryKey: assetQueryKeys.statuses });
  await queryClient.prefetchQuery({ queryKey: assetQueryKeys.manufacturers });
  await queryClient.prefetchQuery({ queryKey: assetQueryKeys.solutions });
};

// Initiate prefetching
prefetchCommonData();

interface AssetProviderProps {
  children: ReactNode;
}

export function AssetProvider({ children }: AssetProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
