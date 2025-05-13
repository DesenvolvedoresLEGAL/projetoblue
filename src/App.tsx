
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
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RegisterAsset from "./pages/RegisterAsset";
import Inventory from "./pages/Inventory";
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
import InventorySummary from "./pages/InventorySummary";
import ToolsSummary from "./pages/ToolsSummary";
import MonitoringSummary from "./pages/MonitoringSummary";

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
                
                {/* Home route */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  
                  {/* Inventory module routes - New standardized English routes */}
                  <Route path="inventory">
                    <Route index element={<InventorySummary />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="assets" element={<Inventory />} />
                    <Route path="customers" element={<Clients />} />
                    <Route path="suppliers" element={<Suppliers />} />
                    <Route path="subscriptions" element={<Subscriptions />} />
                    <Route path="monitoring">
                      <Route index element={<MonitoringSummary />} />
                      <Route path="active" element={<Monitoring />} />
                      <Route path="history" element={<History />} />
                    </Route>
                    <Route path="tools">
                      <Route index element={<ToolsSummary />} />
                      <Route path="register-asset" element={<RegisterAsset />} />
                      <Route path="associate-assets" element={<Association />} />
                      <Route path="data-usage" element={<DataUsage />} />
                      <Route path="wifi-analyzer" element={<WifiAnalyzer />} />
                    </Route>
                  </Route>
                  
                  {/* Maintain legacy routes for backward compatibility */}
                  <Route path="/inventario">
                    <Route index element={<Navigate to="/inventory/dashboard" replace />} />
                    <Route path="dashboard" element={<Navigate to="/inventory/dashboard" replace />} />
                    <Route path="ativos" element={<Navigate to="/inventory/assets" replace />} />
                    <Route path="clientes" element={<Navigate to="/inventory/customers" replace />} />
                    <Route path="fornecedores" element={<Navigate to="/inventory/suppliers" replace />} />
                    <Route path="assinaturas" element={<Navigate to="/inventory/subscriptions" replace />} />
                    <Route path="historico" element={<Navigate to="/inventory/monitoring/history" replace />} />
                    <Route path="monitoramento" element={<Navigate to="/inventory/monitoring/active" replace />} />
                  </Route>
                  
                  {/* Additional legacy redirects */}
                  <Route path="/register-asset" element={<Navigate to="/inventory/tools/register-asset" replace />} />
                  <Route path="/inventory" element={<Navigate to="/inventory/assets" replace />} />
                  <Route path="/clients" element={<Navigate to="/inventory/customers" replace />} />
                  <Route path="/suppliers" element={<Navigate to="/inventory/suppliers" replace />} />
                  <Route path="/association" element={<Navigate to="/inventory/tools/associate-assets" replace />} />
                  <Route path="/subscriptions" element={<Navigate to="/inventory/subscriptions" replace />} />
                  <Route path="/monitoring" element={<Navigate to="/inventory/monitoring/active" replace />} />
                  <Route path="/history" element={<Navigate to="/inventory/monitoring/history" replace />} />
                  <Route path="/data-usage" element={<Navigate to="/inventory/tools/data-usage" replace />} />
                  <Route path="/wifi-analyzer" element={<Navigate to="/inventory/tools/wifi-analyzer" replace />} />
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
