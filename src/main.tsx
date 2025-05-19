
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
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0, // No retry for mutations by default
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
    <App />
  </React.StrictMode>,
)
