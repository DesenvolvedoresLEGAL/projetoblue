
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { PublicRoutes } from "./PublicRoutes";
import NotFound from "../pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/auth/*" element={<PublicRoutes />} />
          
          {/* Protected routes */}
          <Route path="/*" element={<ProtectedRoutes />} />
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
