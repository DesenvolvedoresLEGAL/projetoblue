
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import { useAuth } from "@/context/AuthContext";

export const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};
