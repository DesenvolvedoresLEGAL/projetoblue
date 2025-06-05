import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AssetProvider } from "@/context/AssetContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import { DataUsageProvider } from "@/context/DataUsageContext";
import { AuthProvider } from "@/context/AuthContext";
import { AuthRoute } from "@/components/auth/AuthRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Dashboard from "@modules/dashboard/pages/Dashboard";
import RegisterAsset from "@modules/assets/pages/RegisterAsset";
import AssetsDashboard from "@modules/assets/pages/AssetsDashboard";
import AssetsInventory from "@modules/assets/pages/AssetsInventory";
import AssetsManagement from "@modules/assets/pages/AssetsManagement";
import AssetAssociation from "@modules/associations/pages/AssetAssociation";
import AssociationsList from "@modules/associations/pages/AssociationsList";
import Clients from "@modules/clients/pages/Clients";
import Association from "@modules/associations/pages/Association";
import Subscriptions from "./pages/Subscriptions";
import Monitoring from "./pages/Monitoring";
import History from "@modules/assets/pages/AssetHistory";
import DataUsage from "@modules/data-usage/pages/DataUsage";
import WifiAnalyzer from "./pages/WifiAnalyzer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Suppliers from "./pages/Suppliers";
import Topology from "./pages/Topology";
import Discovery from "./pages/Discovery";

// BITS™ Pages
import BitsDashboard from "@modules/bits/pages/BitsDashboard";
import BitsIndicateNow from "@modules/bits/pages/BitsIndicateNow";
import BitsMyReferrals from "@modules/bits/pages/BitsMyReferrals";
import BitsPointsAndRewards from "@modules/bits/pages/BitsPointsAndRewards";
import BitsSettings from "@modules/bits/pages/BitsSettings";
import BitsHelpAndSupport from "@modules/bits/pages/BitsHelpAndSupport";

// Configure React Query client with global settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // 1 minute
    },
  },
});

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
  },
  enumerable: false
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AssetProvider>
            <DataUsageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Public authentication routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* Main layout with sidebar and header - Protected routes */}
                  <Route path="/" element={
                    <AuthRoute>
                      <Layout />
                    </AuthRoute>
                  }>
                    {/* Wrap the main dashboard route with ErrorBoundary */}
                    <Route index element={
                      <ErrorBoundary>
                        <Home />
                      </ErrorBoundary>
                    } />
                    
                    {/* Dashboard routes - Redirect to Home for consistent experience */}
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* Assets module routes */}
                    <Route path="assets">
                      <Route index element={<AssetsManagement />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="inventory" element={<AssetsInventory />} />
                      <Route path="management" element={<AssetsManagement />} />
                      <Route path="register" element={<RegisterAsset />} />
                      <Route path="associations" element={<AssetAssociation />} />
                      <Route path="associations-list" element={<AssociationsList />} />
                      <Route path="history" element={<History />} />
                    </Route>
                    
                    {/* Topology module routes */}
                    <Route path="topology">
                      <Route index element={<Navigate to="/topology/view" replace />} />
                      <Route path="view" element={<Topology />} />
                    </Route>
                    
                    {/* Tools module routes */}
                    <Route path="tools">
                      <Route index element={<Navigate to="/tools/discovery" replace />} />
                      <Route path="discovery" element={<Discovery />} />
                    </Route>
                    
                    {/* BITS™ module routes */}
                    <Route path="bits">
                      <Route index element={<BitsDashboard />} />
                      <Route path="indicate" element={<BitsIndicateNow />} />
                      <Route path="my-referrals" element={<BitsMyReferrals />} />
                      <Route path="rewards" element={<BitsPointsAndRewards />} />
                      <Route path="settings" element={<BitsSettings />} />
                      <Route path="help" element={<BitsHelpAndSupport />} />
                    </Route>
                    
                    {/* Direct shortcuts */}
                    <Route path="register-asset" element={<Navigate to="/assets/register" replace />} />
                    <Route path="link-asset" element={<Navigate to="/assets/association" replace />} />
                    
                    {/* Legacy routes for backward compatibility */}
                    <Route path="/assets/association" element={<Navigate to="/assets/associations" replace />} />
                    <Route path="/associations" element={<Navigate to="/assets/associations" replace />} />
                    <Route path="/inventory" element={<Navigate to="/assets/inventory" replace />} />
                    <Route path="/history" element={<Navigate to="/assets/history" replace />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/association" element={<Navigate to="/assets/association" replace />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/monitoring" element={<Monitoring />} />
                    <Route path="/data-usage" element={<DataUsage />} />
                    <Route path="/wifi-analyzer" element={<WifiAnalyzer />} />
                  </Route>
                  
                  {/* Fallback route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </DataUsageProvider>
          </AssetProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
