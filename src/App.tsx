import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AssetProvider } from "@/context/AssetProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Layout } from "@/components/layout/Layout";
import { DataUsageProvider } from "@/context/DataUsageProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { AuthRoute } from "@/components/auth/AuthRoute";
import { PrivateRoute } from "@/components/auth/PrivateRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Dashboard from "@modules/dashboard/pages/Dashboard";
import RegisterAsset from "@modules/assets/pages/RegisterAsset";
import AssetsDashboard from "@modules/assets/pages/AssetsDashboard";
import AssetsInventory from "@modules/assets/pages/AssetsInventory";
import AssetsManagement from "@modules/assets/pages/AssetsManagement";
import AssetsRanking from "@modules/assets/pages/AssetsRanking";
import Clients from "@modules/clients/pages/Clients";
import RegisterClient from "@modules/clients/pages/RegisterClient";
import Subscriptions from "./pages/Subscriptions";
import Monitoring from "./pages/Monitoring";
import History from "@modules/assets/pages/AssetHistory";
import DataUsage from "@modules/data-usage/pages/DataUsage";
import WifiAnalyzer from "./pages/WifiAnalyzer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Suppliers from "./pages/Suppliers";
import AdminConfig from "./pages/AdminConfig";
import Unauthorized from "./pages/Unauthorized";
import Topology from "./pages/Topology";
import Discovery from "./pages/Discovery";
import AssetAssociation from "./pages/AssetAssociation";
import AssociationsList from "@modules/associations/pages/AssociationsList";

// BITS™ Pages
// import BitsDashboard from "@modules/bits/pages/BitsDashboard";
// import BitsIndicateNow from "@modules/bits/pages/BitsIndicateNow";
// import BitsMyReferrals from "@modules/bits/pages/BitsMyReferrals";
// import BitsPointsAndRewards from "@modules/bits/pages/BitsPointsAndRewards";
// import BitsSettings from "@modules/bits/pages/BitsSettings";
// import BitsHelpAndSupport from "@modules/bits/pages/BitsHelpAndSupport";

// Tickets Pages
import TicketsDashboard from "@modules/tickets/pages/TicketsDashboard";
import TicketsInbox from "@modules/tickets/pages/TicketsInbox";
import MyTickets from "@modules/tickets/pages/MyTickets";
import NewTicket from "@modules/tickets/pages/NewTicket";
import KnowledgeBase from "@modules/tickets/pages/KnowledgeBase";
import TicketAutomation from "@modules/tickets/pages/TicketAutomation";
import TicketAnalytics from "@modules/tickets/pages/TicketAnalytics";
import QualityAudit from "@modules/tickets/pages/QualityAudit";
import AgentCopilot from "@modules/tickets/pages/AgentCopilot";
import TicketIntegrations from "@modules/tickets/pages/TicketIntegrations";

// Configure React Query client with global settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 2 * 60 * 60 * 1000, // 2 hours
    },
  },
});


const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Public authentication routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Main layout with sidebar and header - Protected routes */}
                  <Route
                    path="/"
                    element={
                      <AuthRoute>
                        <Layout />
                      </AuthRoute>
                    }
                  >
                    {/* Wrap the main dashboard route with ErrorBoundary */}
                    <Route
                      index
                      element={
                        <ErrorBoundary>
                          <Home />
                        </ErrorBoundary>
                      }
                    />

                    {/* Dashboard routes - Available to all authenticated users */}
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Assets module routes - Requires suporte or above */}
                    <Route path="assets">
                      <Route
                        index
                        element={
                          <AuthRoute requiredRole="suporte">
                            <AssetsManagement />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="dashboard"
                        element={
                          <AuthRoute requiredRole="suporte">
                            <Dashboard />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="inventory"
                        element={
                          <AuthRoute requiredRole="suporte">
                            <AssetsInventory />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="ranking"
                        element={
                          <AuthRoute requiredRole="suporte">
                            <AssetsRanking />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="management"
                        element={
                          <AuthRoute requiredRole="suporte">
                            <AssetsManagement />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="register"
                        element={
                          <AuthRoute requiredRole="suporte">
                            <RegisterAsset />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="history"
                        element={
                          <AuthRoute requiredRole="suporte">
                            <History />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="associations"
                        element={
                          <AuthRoute requiredRole="suporte">
                            <AssetAssociation />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="associations-list"
                        element={
                          <AuthRoute requiredRole="suporte">
                            <AssociationsList />
                          </AuthRoute>
                        }
                      />
                    </Route>

                    {/* Tickets module routes - Requires suporte or above */}
                    <Route path="tickets">
                      <Route
                        index
                        element={
                          <AuthRoute requiredRole="admin">
                            <Navigate to="/tickets/dashboard" replace />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="dashboard"
                        element={
                          <AuthRoute requiredRole="admin">
                            <TicketsDashboard />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="inbox"
                        element={
                          <AuthRoute requiredRole="admin">
                            <TicketsInbox />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="my-tickets"
                        element={
                          <AuthRoute requiredRole="admin">
                            <MyTickets />
                          </AuthRoute>
                        }
                      />

                      <Route
                        path="new"
                        element={
                          <AuthRoute requiredRole="admin">
                            <NewTicket />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="knowledge-base"
                        element={
                          <AuthRoute requiredRole="admin">
                            <KnowledgeBase />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="automation"
                        element={
                          <AuthRoute requiredRole="admin">
                            <TicketAutomation />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="analytics"
                        element={
                          <AuthRoute requiredRole="admin">
                            <TicketAnalytics />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="quality"
                        element={
                          <AuthRoute requiredRole="admin">
                            <QualityAudit />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="copilot"
                        element={
                          <AuthRoute requiredRole="admin">
                            <AgentCopilot />
                          </AuthRoute>
                        }
                      />
                    </Route>

                    {/* Topology module routes */}
                    <Route path="topology">
                      <Route
                        index
                        element={<Navigate to="/topology/view" replace />}
                      />
                      <Route path="view" element={<Topology />} />
                    </Route>

                    {/* Tools module routes */}
                    <Route path="tools">
                      <Route
                        index
                        element={<Navigate to="/tools/discovery" replace />}
                      />
                      <Route path="discovery" element={<Discovery />} />
                    </Route>

                    {/* BITS™ module routes - Available to cliente or above
                    <Route path="bits">
                      <Route
                        index
                        element={
                          <AuthRoute requiredRole="admin">
                            <BitsDashboard />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="indicate"
                        element={
                          <AuthRoute requiredRole="admin">
                            <BitsIndicateNow />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="my-referrals"
                        element={
                          <AuthRoute requiredRole="admin">
                            <BitsMyReferrals />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="rewards"
                        element={
                          <AuthRoute requiredRole="admin">
                            <BitsPointsAndRewards />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="settings"
                        element={
                          <AuthRoute requiredRole="admin">
                            <BitsSettings />
                          </AuthRoute>
                        }
                      />
                      <Route
                        path="help"
                        element={
                          <AuthRoute requiredRole="admin">
                            <BitsHelpAndSupport />
                          </AuthRoute>
                        }
                      />
                    </Route> */}

                    {/* Client management routes - Requires suporte or above */}
                    <Route
                      path="/clients/list"
                      element={
                        <AuthRoute requiredRole="suporte">
                          <Clients />
                        </AuthRoute>
                      }
                    />
                    <Route
                      path="/clients/register"
                      element={
                        <AuthRoute requiredRole="suporte">
                          <RegisterClient />
                        </AuthRoute>
                      }
                    />

                    {/* Admin/Management routes - Requires admin */}
                    <Route
                      path="/suppliers"
                      element={
                        <AuthRoute requiredRole="admin">
                          <Suppliers />
                        </AuthRoute>
                      }
                    />

                    <Route
                      path="/admin/config"
                      element={
                        <PrivateRoute requiredRole="admin">
                          <AdminConfig />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/admin/integrations"
                      element={
                        <AuthRoute requiredRole="admin">
                          <TicketIntegrations />
                        </AuthRoute>
                      }
                    />

                    {/* Direct shortcuts */}
                    <Route
                      path="register-asset"
                      element={<Navigate to="/assets/register" replace />}
                    />

                    {/* Legacy routes for backward compatibility */}
                    <Route
                      path="/inventory"
                      element={<Navigate to="/assets/inventory" replace />}
                    />
                    <Route
                      path="/history"
                      element={<Navigate to="/assets/history" replace />}
                    />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/monitoring" element={<Monitoring />} />
                    <Route path="/data-usage" element={<DataUsage />} />
                    <Route path="/wifi-analyzer" element={<WifiAnalyzer />} />
                  </Route>

                  {/* Fallback route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
