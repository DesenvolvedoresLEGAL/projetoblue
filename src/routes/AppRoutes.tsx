
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoutes } from "./ProtectedRoutes";
import { PublicRoutes } from "./PublicRoutes";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/auth/*" element={<PublicRoutes />} />
        
        {/* Protected routes */}
        <Route path="/*" element={<ProtectedRoutes />} />
        
        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
