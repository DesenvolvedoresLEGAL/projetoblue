
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './integrations/supabase/client'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Prefetch dashboard stats data when the app loads
queryClient.prefetchQuery({
  queryKey: ['dashboard', 'stats'],
  queryFn: async () => {
    try {
      // Basic prefetch 
      const { count } = await supabase
        .from('assets')
        .select('*', { head: true, count: 'exact' })
        .throwOnError();
      return { totalAssets: count || 0 };
    } catch (error) {
      console.error('Error prefetching dashboard stats:', error);
      return { totalAssets: 0 };
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
