
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AssetProvider } from "@/context/AssetContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthRoute } from "@/components/auth/AuthRoute";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AssetsManagement from "./pages/AssetsManagement";
import AssetsInventory from "./pages/AssetsInventory";
import AssetAssociation from "./pages/AssetAssociation";
import AssetsAssociations from "./pages/AssetsAssociations";
import RegisterAsset from "./pages/RegisterAsset";
import Clients from "./pages/Clients";
import Export from "./pages/Export";
import Association from "./pages/Association";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <AssetProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={
                    <AuthRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </AuthRoute>
                  } />
                  <Route path="/assets" element={
                    <AuthRoute>
                      <Layout>
                        <AssetsManagement />
                      </Layout>
                    </AuthRoute>
                  } />
                  <Route path="/assets/inventory" element={
                    <AuthRoute>
                      <Layout>
                        <AssetsInventory />
                      </Layout>
                    </AuthRoute>
                  } />
                  <Route path="/assets/association" element={
                    <AuthRoute>
                      <Layout>
                        <AssetAssociation />
                      </Layout>
                    </AuthRoute>
                  } />
                  <Route path="/assets/associations" element={
                    <AuthRoute>
                      <Layout>
                        <AssetsAssociations />
                      </Layout>
                    </AuthRoute>
                  } />
                  <Route path="/register-asset" element={
                    <AuthRoute>
                      <Layout>
                        <RegisterAsset />
                      </Layout>
                    </AuthRoute>
                  } />
                  <Route path="/clients" element={
                    <AuthRoute>
                      <Layout>
                        <Clients />
                      </Layout>
                    </AuthRoute>
                  } />
                   <Route path="/export" element={
                    <AuthRoute>
                      <Layout>
                        <Export />
                      </Layout>
                    </AuthRoute>
                  } />
                   <Route path="/association" element={
                    <AuthRoute>
                      <Layout>
                        <Association />
                      </Layout>
                    </AuthRoute>
                  } />
                </Routes>
              </AssetProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
