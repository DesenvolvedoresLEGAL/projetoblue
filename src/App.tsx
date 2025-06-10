
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/modules/dashboard/pages/Dashboard';
import AssetsDashboard from '@/modules/assets/pages/AssetsDashboard';
import AssetsInventory from '@/modules/inventory/pages/Inventory';
import AssetsManagement from '@/modules/assets/pages/AssetsManagement';
import AssetsRegister from '@/modules/assets/pages/RegisterAsset';
import AssociationsList from '@/modules/associations/pages/AssociationsList';
import TicketsDashboard from '@/modules/tickets/pages/TicketsDashboard';
import TicketsInbox from '@/modules/tickets/pages/TicketsInbox';
import TicketsMyTickets from '@/modules/tickets/pages/MyTickets';
import TicketsNew from '@/modules/tickets/pages/NewTicket';
import TicketsKnowledgeBase from '@/modules/tickets/pages/KnowledgeBase';
import TicketsAutomation from '@/modules/tickets/pages/TicketAutomation';
import TicketsAnalytics from '@/modules/tickets/pages/TicketAnalytics';
import TicketsQuality from '@/modules/tickets/pages/QualityAudit';
import TicketsCopilot from '@/modules/tickets/pages/AgentCopilot';
import TicketsIntegrations from '@/modules/tickets/pages/TicketIntegrations';
import BitsDashboard from '@/modules/bits/pages/BitsDashboard';
import BitsIndicate from '@/modules/bits/pages/BitsIndicateNow';
import BitsMyReferrals from '@/modules/bits/pages/BitsMyReferrals';
import BitsRewards from '@/modules/bits/pages/BitsPointsAndRewards';
import BitsSettings from '@/modules/bits/pages/BitsSettings';
import BitsHelp from '@/modules/bits/pages/BitsHelpAndSupport';
import ClientsView from '@/modules/clients/pages/Clients';
import ClientsCreate from '@/modules/clients/pages/RegisterClient';
import ClientsEdit from '@/modules/clients/pages/Clients';
import ClientsDelete from '@/modules/clients/pages/Clients';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { AdminConfig } from './modules/admin/pages/AdminConfig';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    
    // Show loading while checking authentication
    if (isLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Assets Routes */}
                <Route path="/assets" element={<AssetsDashboard />} />
                <Route path="/assets/inventory" element={<AssetsInventory />} />
                <Route path="/assets/management" element={<AssetsManagement />} />
                <Route path="/assets/register" element={<AssetsRegister />} />
                <Route path="/assets/associations" element={<AssociationsList />} />
                
                {/* Tickets Routes */}
                <Route path="/tickets" element={<TicketsDashboard />} />
                <Route path="/tickets/inbox" element={<TicketsInbox />} />
                <Route path="/tickets/my-tickets" element={<TicketsMyTickets />} />
                <Route path="/tickets/new" element={<TicketsNew />} />
                <Route path="/tickets/knowledge-base" element={<TicketsKnowledgeBase />} />
                <Route path="/tickets/automation" element={<TicketsAutomation />} />
                <Route path="/tickets/analytics" element={<TicketsAnalytics />} />
                <Route path="/tickets/quality" element={<TicketsQuality />} />
                <Route path="/tickets/copilot" element={<TicketsCopilot />} />
                <Route path="/tickets/integrations" element={<TicketsIntegrations />} />
                
                {/* Bits Routes */}
                <Route path="/bits" element={<BitsDashboard />} />
                <Route path="/bits/indicate" element={<BitsIndicate />} />
                <Route path="/bits/my-referrals" element={<BitsMyReferrals />} />
                <Route path="/bits/rewards" element={<BitsRewards />} />
                <Route path="/bits/settings" element={<BitsSettings />} />
                <Route path="/bits/help" element={<BitsHelp />} />
                
                {/* Clients Routes */}
                <Route path="/clients/view" element={<ClientsView />} />
                <Route path="/clients/create" element={<ClientsCreate />} />
                <Route path="/clients/edit" element={<ClientsEdit />} />
                <Route path="/clients/delete" element={<ClientsDelete />} />
                
                {/* Admin Routes */}
                <Route path="/admin/config" 
                  element={
                    <RoleGuard requiredRole="admin">
                      <AdminConfig />
                    </RoleGuard>
                  } 
                />
                
                {/* 404 Route - Make sure it's the last route */}
                <Route path="*" element={<div>Página não encontrada</div>} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
