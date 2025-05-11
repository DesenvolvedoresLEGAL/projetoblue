
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { NamedLogo } from '@/components/ui/namedlogo';
import { MoonStar, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Authentication is removed, simply redirect to dashboard with a success toast
    toast({
      title: "Bem-vindo ao sistema!",
      description: "Acesso concedido automaticamente.",
      variant: "default"
    });
    
    navigate('/');
  };

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
            >
              Entrar
            </Button>
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
