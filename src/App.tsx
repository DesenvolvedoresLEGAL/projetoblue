
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/layout/Layout";
import AuthRoute from "./components/auth/AuthRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Clients from "./pages/Clients";
import Inventory from "./pages/Inventory";
import RegisterAsset from "./pages/RegisterAsset";
import NotFound from "./pages/NotFound";
import { AssetProvider } from "./context/asset/AssetContext";
import { ThemeProvider } from "./components/theme-provider";

// Create a client for react-query
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AssetProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<AuthRoute><Layout /></AuthRoute>}>
              <Route index element={<Home />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="clients" element={<Clients />} />
              <Route path="register-asset" element={<RegisterAsset />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AssetProvider>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
