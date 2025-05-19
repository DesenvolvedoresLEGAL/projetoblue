
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/context/ThemeContext';

// Layout
import { Layout } from '@/components/layout/Layout';

// Auth Pages
import Login from '@/features/auth/pages/Login';
import Signup from '@/features/auth/pages/Signup';
import ForgotPassword from '@/features/auth/pages/ForgotPassword';
import { PrivateRoute } from '@/features/auth/components/PrivateRoute';
import { AuthProvider } from '@/features/auth/context/AuthContext';

// Main Pages
import Dashboard from '@/pages/Dashboard';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Inventory Pages
import Inventory from '@/pages/Inventory';
import InventorySummary from '@/pages/InventorySummary';
import RegisterAsset from '@/pages/RegisterAsset';

// Client Pages
import Clients from '@/pages/Clients';

// Import your CSS
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Auth Routes (Public) */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  {/* Dashboard */}
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Inventory */}
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/inventory/summary" element={<InventorySummary />} />
                  <Route path="/register-asset" element={<RegisterAsset />} />
                  
                  {/* Clients */}
                  <Route path="/clients" element={<Clients />} />
                </Route>
              </Route>
              
              {/* Specialized Routes */}
              <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
              
              {/* Admin Routes */}
              <Route element={<PrivateRoute requiredRole="admin" />}>
                <Route element={<Layout />}>
                  <Route path="/admin" element={<div>Admin Dashboard</div>} />
                </Route>
              </Route>
              
              {/* Not Found */}
              <Route path="/not-found" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Routes>
            
            <Toaster />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
