
import apiClient from "./apiClient";
import { toast } from "@/utils/toast";

// Auth token storage key
const AUTH_TOKEN_KEY = "blue_auth_token";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authService = {
  // Initialize auth state from local storage
  initialize() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      apiClient.setAuthToken(token);
      return true;
    }
    return false;
  },
  
  // Login with credentials
  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const response = await apiClient.post<LoginResponse>("/token", credentials);
      
      if (!response.success || !response.data?.token) {
        toast.error(response.error || "Login failed. Please try again.");
        return false;
      }
      
      // Store token
      const token = response.data.token;
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      apiClient.setAuthToken(token);
      
      toast.success("Login successful");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your network connection.");
      return false;
    }
  },
  
  // Logout
  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    apiClient.clearAuthToken();
    window.dispatchEvent(new CustomEvent("auth:logout"));
    toast.success("Logged out successfully");
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!apiClient.getAuthToken();
  }
};

// Initialize auth on import
authService.initialize();

export default authService;
