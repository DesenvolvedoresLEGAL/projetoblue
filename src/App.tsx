
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AssetProvider } from "@/context/AssetContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Layout } from "@/components/layout/Layout";
import { DataUsageProvider } from "@/context/DataUsageContext";

// Pages
import GeneralDashboard from "./pages/GeneralDashboard";
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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Suppliers from "./pages/Suppliers";
import Topology from "./pages/Topology";
import Discovery from "./pages/Discovery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AssetProvider>
        <DataUsageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public authentication routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Main layout with sidebar and header */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<GeneralDashboard />} />
                  
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
                  
                  {/* Direct shortcuts */}
                  <Route path="register-asset" element={<Navigate to="/assets/register" replace />} />
                  <Route path="link-asset" element={<Association />} />
                  
                  {/* Legacy routes for backward compatibility */}
                  <Route path="/inventory" element={<Navigate to="/assets/inventory" replace />} />
                  <Route path="/clients" element={<Navigate to="/clients" replace />} />
                  <Route path="/suppliers" element={<Navigate to="/suppliers" replace />} />
                  <Route path="/association" element={<Navigate to="/link-asset" replace />} />
                  <Route path="/subscriptions" element={<Navigate to="/subscriptions" replace />} />
                  <Route path="/monitoring" element={<Navigate to="/monitoring" replace />} />
                  <Route path="/history" element={<Navigate to="/history" replace />} />
                  <Route path="/data-usage" element={<Navigate to="/data-usage" replace />} />
                  <Route path="/wifi-analyzer" element={<Navigate to="/wifi-analyzer" replace />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataUsageProvider>
      </AssetProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
