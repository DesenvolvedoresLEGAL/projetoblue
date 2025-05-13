
import { toast } from "@/utils/toast";

// API base URL and endpoints
const API_BASE_URL = "https://api.blue.legal";

// API request timeout in milliseconds
const API_TIMEOUT = 30000;

// Types for request options
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  messages?: string[];
  status: number;
}

// Error types
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class ApiTimeoutError extends ApiError {
  constructor(message: string = "Request timed out") {
    super(message, 408);
    this.name = "ApiTimeoutError";
  }
}

export class ApiNetworkError extends ApiError {
  constructor(message: string = "Network error") {
    super(message, 0);
    this.name = "ApiNetworkError";
  }
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  
  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  // Set authentication token
  setAuthToken(token: string | null) {
    this.authToken = token;
  }
  
  // Get authentication token
  getAuthToken(): string | null {
    return this.authToken;
  }
  
  // Clear authentication token
  clearAuthToken() {
    this.authToken = null;
  }
  
  // Build request headers
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...customHeaders
    };
    
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }
  
  // Build URL with query parameters
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }
    
    return url.toString();
  }
  
  // Handle API request with timeout
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = API_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const { signal } = controller;
    
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { ...options, signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiTimeoutError();
      }
      if (error instanceof Error) {
        throw new ApiNetworkError(error.message);
      }
      throw error;
    }
  }
  
  // Process API response
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status;
    
    try {
      const data = await response.json();
      
      if (status >= 200 && status < 300) {
        return {
          success: true,
          data: data as T,
          status
        };
      }
      
      // Handle authentication errors
      if (status === 401) {
        // Handle token expiration
        this.clearAuthToken();
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
      
      return {
        success: false,
        error: data.error || "An unknown error occurred",
        messages: data.messages,
        status
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to parse response",
        status
      };
    }
  }
  
  // GET request
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.fetchWithTimeout(
        url,
        {
          method: "GET",
          headers: this.getHeaders(options?.headers)
        },
        options?.timeout
      );
      
      return this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
          status: error.status
        };
      }
      
      return {
        success: false,
        error: "Network error",
        status: 0
      };
    }
  }
  
  // POST request
  async post<T>(endpoint: string, data: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: this.getHeaders(options?.headers),
          body: JSON.stringify(data)
        },
        options?.timeout
      );
      
      return this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
          status: error.status
        };
      }
      
      return {
        success: false,
        error: "Network error",
        status: 0
      };
    }
  }
  
  // PATCH request
  async patch<T>(endpoint: string, data: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.fetchWithTimeout(
        url,
        {
          method: "PATCH",
          headers: this.getHeaders(options?.headers),
          body: JSON.stringify(data)
        },
        options?.timeout
      );
      
      return this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
          status: error.status
        };
      }
      
      return {
        success: false,
        error: "Network error",
        status: 0
      };
    }
  }
  
  // DELETE request
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint, options?.params);
      const response = await this.fetchWithTimeout(
        url,
        {
          method: "DELETE",
          headers: this.getHeaders(options?.headers)
        },
        options?.timeout
      );
      
      return this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
          status: error.status
        };
      }
      
      return {
        success: false,
        error: "Network error",
        status: 0
      };
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Helper for displaying API errors as toasts
export const handleApiError = (error: string | undefined, fallbackMessage: string = "An error occurred"): void => {
  toast.error(error || fallbackMessage);
};

export default apiClient;
