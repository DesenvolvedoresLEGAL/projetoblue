
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthActions } from '@/hooks/useAuthActions';

type UserRole = 'admin' | 'manager' | 'employee' | null;

interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<void>; // Added signUp method to match the type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const { id, email } = session.user;
              // In a real app, we would fetch the role from the database
              // For now, we'll simulate it with a default role
              setUser({
                id,
                email: email || '',
                role: 'admin' // Default role for demonstration
              });
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          }
        );

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { id, email } = session.user;
          setUser({
            id,
            email: email || '',
            role: 'admin' // Default role for demonstration
          });
        }

        setIsLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up auth:', error);
        setIsLoading(false);
      }
    };

    setupAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        toast({
          title: "Erro de login",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Login bem-sucedido",
          description: "Você está conectado agora",
          variant: "default"
        });
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro durante o login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Implementing the signUp method to match the interface
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        setError(error.message);
        toast({
          title: "Erro de cadastro",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      if (data.user) {
        toast({
          title: "Cadastro bem-sucedido",
          description: "Sua conta foi criada. Você já pode fazer login.",
          variant: "default"
        });
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro durante o cadastro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Logout bem-sucedido",
        description: "Você foi desconectado",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro durante o logout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        signUp, // Added signUp method to the context value
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
