
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { NamedLogo } from '@/components/ui/namedlogo';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { translateAuthError } from '@/utils/errorTranslator';
import { toast } from '@/utils/toast';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { signIn, isAuthenticated, isLoading, error } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Email e senha são obrigatórios. Por favor, preencha todos os campos.");
      return;
    }

    try {
      await signIn(email, password);
      // No need to redirect here as the AuthContext will handle it
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      toast.error(translateAuthError(err));
    }
  };

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTheme(theme === 'dark' ? 'light' : 'dark', e);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center justify-center pt-8">
          <div className="w-full flex justify-center py-4">
            <NamedLogo size="lg" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end">
              <Link to="/esqueci-senha" className="text-sm text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                  Entrando...
                </>
              ) : "Entrar"}
            </Button>
            
            {error && (
              <div className="p-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded">
                {error}
              </div>
            )}
          </form>
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Não possui uma conta?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <MoonStar size={20} />}
          </Button>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} - Sistema BLUE
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
