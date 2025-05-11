
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataUsageProvider } from './context/DataUsageContext';
import { ThemeProvider } from "./components/theme-provider"
import Index from './pages/Index';
import Home from './pages/Home';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Association from './pages/Association';
import History from './pages/History';
import DataUsage from './pages/DataUsage';
import Clients from './pages/Clients';
import InventorySummary from './pages/InventorySummary';
import { Layout } from './components/layout/Layout';
import { Toaster } from "@/components/ui/toaster"
import { AssetProvider } from './context/asset/AssetContext';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const App = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        {/* The ThemeProvider from "./components/theme-provider" doesn't require a props argument */}
        <ThemeProvider defaultTheme="system">
          <QueryClientProvider client={queryClient}>
            <AssetProvider>
              <DataUsageProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
                  <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                  
                  {/* Inventory Module */}
                  <Route path="/inventory" element={<PrivateRoute><InventorySummary /></PrivateRoute>} />
                  <Route path="/inventory/assets" element={<PrivateRoute><Inventory /></PrivateRoute>} />
                  <Route path="/inventory/customers" element={<PrivateRoute><Clients /></PrivateRoute>} />
                  <Route path="/inventory/suppliers" element={<PrivateRoute><Clients /></PrivateRoute>} />
                  <Route path="/inventory/subscriptions" element={<PrivateRoute><Clients /></PrivateRoute>} />
                  <Route path="/inventory/tools" element={<PrivateRoute><Clients /></PrivateRoute>} />
                  <Route path="/inventory/monitoring/active" element={<PrivateRoute><Clients /></PrivateRoute>} />
                  <Route path="/inventory/monitoring/history" element={<PrivateRoute><History /></PrivateRoute>} />
                  
                  <Route path="/association" element={<PrivateRoute><Association /></PrivateRoute>} />
                  <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                  <Route path="/data-usage" element={<PrivateRoute><DataUsage /></PrivateRoute>} />
                </Routes>
                <Toaster />
              </DataUsageProvider>
            </AssetProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
