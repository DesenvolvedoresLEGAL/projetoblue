
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
                  
                  {/* Inventory module routes */}
                  <Route path="inventario">
                    <Route index element={<Navigate to="/inventario/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="ativos" element={<Inventory />} />
                    <Route path="clientes" element={<Clients />} />
                    <Route path="fornecedores" element={<Suppliers />} />
                    <Route path="assinaturas" element={<Subscriptions />} />
                    <Route path="historico" element={<History />} />
                    <Route path="monitoramento" element={<Monitoring />} />
                  </Route>
                  
                  {/* Maintain legacy routes for backward compatibility */}
                  <Route path="/register-asset" element={<RegisterAsset />} />
                  <Route path="/inventory" element={<Navigate to="/inventario/ativos" replace />} />
                  <Route path="/clients" element={<Navigate to="/inventario/clientes" replace />} />
                  <Route path="/suppliers" element={<Navigate to="/inventario/fornecedores" replace />} />
                  <Route path="/association" element={<Association />} />
                  <Route path="/subscriptions" element={<Navigate to="/inventario/assinaturas" replace />} />
                  <Route path="/monitoring" element={<Navigate to="/inventario/monitoramento" replace />} />
                  <Route path="/history" element={<Navigate to="/inventario/historico" replace />} />
                  <Route path="/data-usage" element={<DataUsage />} />
                  <Route path="/wifi-analyzer" element={<WifiAnalyzer />} />
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
