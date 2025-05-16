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
import { PrivateRoute } from "./routes/PrivateRoute";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";

// Imports of all other pages
import GeneralDashboard from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RegisterAsset from "./pages/RegisterAsset";
import AssetsDashboard from "./pages/AssetsDashboard";
import AssetsInventory from "./pages/AssetsInventory";
import Clients from "./pages/Clients";
import Association from "./pages/Association";
import Subscriptions from "./pages/Subscriptions";
import Monitoring from "./pages/Monitoring";
import History from "./pages/History";
import DataUsage from "./pages/DataUsage";
import WifiAnalyzer from "./pages/WifiAnalyzer";
import Suppliers from "./pages/Suppliers";
import Topology from "./pages/Topology";
import Discovery from "./pages/Discovery";

// BITS™ Pages
import BitsDashboard from "./pages/bits/BitsDashboard";
import BitsIndicateNow from "./pages/bits/BitsIndicateNow";
import BitsMyReferrals from "./pages/bits/BitsMyReferrals";
import BitsPointsAndRewards from "./pages/bits/BitsPointsAndRewards";
import BitsSettings from "./pages/bits/BitsSettings";
import BitsHelpAndSupport from "./pages/bits/BitsHelpAndSupport";

const queryClient = new QueryClient();

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
                  
                  {/* Protected routes */}
                  <Route element={<PrivateRoute />}>
                    {/* Main layout with sidebar and header */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      
                      {/* Dashboard routes */}
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Assets module routes */}
                      <Route path="assets">
                        <Route index element={<Navigate to="/assets/dashboard" replace />} />
                        <Route path="dashboard" element={<AssetsDashboard />} />
                        <Route path="inventory" element={<AssetsInventory />} />
                        <Route path="register" element={<RegisterAsset />} />
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
                      <Route path="link-asset" element={<Association />} />
                      
                      {/* Legacy routes for backward compatibility */}
                      <Route path="/inventory" element={<Navigate to="/assets/inventory" replace />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/suppliers" element={<Suppliers />} />
                      <Route path="/association" element={<Association />} />
                      <Route path="/subscriptions" element={<Subscriptions />} />
                      <Route path="/monitoring" element={<Monitoring />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/data-usage" element={<DataUsage />} />
                      <Route path="/wifi-analyzer" element={<WifiAnalyzer />} />
                    </Route>
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
