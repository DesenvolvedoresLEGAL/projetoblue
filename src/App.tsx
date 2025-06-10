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
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { Dashboard } from '@/pages/Dashboard';
import { AssetsDashboard } from '@/pages/assets/AssetsDashboard';
import { AssetsInventory } from '@/pages/assets/AssetsInventory';
import { AssetsManagement } from '@/pages/assets/AssetsManagement';
import { AssetsRegister } from '@/pages/assets/AssetsRegister';
import { AssetsAssociations } from '@/pages/assets/AssetsAssociations';
import { TicketsDashboard } from '@/pages/tickets/TicketsDashboard';
import { TicketsInbox } from '@/pages/tickets/TicketsInbox';
import { TicketsMyTickets } from '@/pages/tickets/TicketsMyTickets';
import { TicketsNew } from '@/pages/tickets/TicketsNew';
import { TicketsKnowledgeBase } from '@/pages/tickets/TicketsKnowledgeBase';
import { TicketsAutomation } from '@/pages/tickets/TicketsAutomation';
import { TicketsAnalytics } from '@/pages/tickets/TicketsAnalytics';
import { TicketsQuality } from '@/pages/tickets/TicketsQuality';
import { TicketsCopilot } from '@/pages/tickets/TicketsCopilot';
import { TicketsIntegrations } from '@/pages/tickets/TicketsIntegrations';
import { BitsDashboard } from '@/pages/bits/BitsDashboard';
import { BitsIndicate } from '@/pages/bits/BitsIndicate';
import { BitsMyReferrals } from '@/pages/bits/BitsMyReferrals';
import { BitsRewards } from '@/pages/bits/BitsRewards';
import { BitsSettings } from '@/pages/bits/BitsSettings';
import { BitsHelp } from '@/pages/bits/BitsHelp';
import { ClientsView } from '@/pages/clients/ClientsView';
import { ClientsCreate } from '@/pages/clients/ClientsCreate';
import { ClientsEdit } from '@/pages/clients/ClientsEdit';
import { ClientsDelete } from '@/pages/clients/ClientsDelete';
import { AdminSuppliers } from '@/pages/admin/AdminSuppliers';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { RoleGuard } from '@/guards/RoleGuard';
import { UserRole } from '@/types/auth';
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
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      return <Navigate to="/login" />;
    }
    
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              <Route path="/" element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  
                  {/* Assets Routes */}
                  <Route path="/assets" element={<AssetsDashboard />} />
                  <Route path="/assets/inventory" element={<AssetsInventory />} />
                  <Route path="/assets/management" element={<AssetsManagement />} />
                  <Route path="/assets/register" element={<AssetsRegister />} />
                  <Route path="/assets/associations" element={<AssetsAssociations />} />
                  
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
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
