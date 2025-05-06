
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AssetProvider } from "@/context/AssetContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/layout/Layout";
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
import { DataUsageProvider } from "@/context/DataUsageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ManagerRegistration from "./pages/ManagerRegistration";
import EmployeeRegistration from "./pages/EmployeeRegistration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AssetProvider>
        <DataUsageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  
                  {/* Protected routes */}
                  <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/register-asset" element={<RegisterAsset />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/association" element={<Association />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/monitoring" element={<Monitoring />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/data-usage" element={<DataUsage />} />
                    <Route path="/wifi-analyzer" element={<WifiAnalyzer />} />
                    
                    {/* Rotas protegidas para cadastro de gerentes e funcionários */}
                    <Route 
                      path="/cadastro-gerente" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <ManagerRegistration />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/cadastro-funcionario" 
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'manager']}>
                          <EmployeeRegistration />
                        </ProtectedRoute>
                      } 
                    />
                  </Route>
                  
                  {/* Redirection */}
                  <Route path="/index" element={<Navigate to="/" replace />} />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </DataUsageProvider>
      </AssetProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
