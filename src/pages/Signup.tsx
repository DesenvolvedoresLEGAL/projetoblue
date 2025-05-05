
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { NamedLogo } from '@/components/ui/namedlogo';
import { SignupForm } from '@/components/auth/SignupForm';
import { ThemeToggle } from '@/components/auth/ThemeToggle';

const Signup = () => {
  const { signUp, isAuthenticated, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState<string | null>(error);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicalError, setTechnicalError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
    setSignupError(error);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup form submitted");
    setIsSubmitting(true);
    setTechnicalError(null);
    setSignupError(null);
    
    try {
      const form = e.target as HTMLFormElement;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;
      const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value;
      
      if (password !== confirmPassword) {
        setSignupError('Senhas não conferem');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Validações do formulário passaram, enviando dados para cadastro:', { email });
      await signUp(email, password);
    } catch (error: any) {
      console.error("Erro capturado no componente Signup:", error);
      
      // Armazenar erro técnico para debug
      setTechnicalError(`Erro técnico: ${error.message || 'Erro desconhecido'}`);
      
      // Mostrar mensagem amigável para o usuário
      if (error.message?.includes('captcha') || error.message?.includes('configuração')) {
        setSignupError('Erro temporário no sistema. Nossa equipe técnica foi notificada. Por favor, tente novamente mais tarde.');
      } else {
        setSignupError(error.message || 'Ocorreu um erro durante o cadastro');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center justify-center pt-8">
          <div className="w-full flex justify-center py-4">
            <NamedLogo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-center">Criar Conta</h2>
        </CardHeader>
        <CardContent>
          <SignupForm 
            onSubmit={handleSubmit} 
            error={signupError}
            isLoading={isLoading || isSubmitting}
          />
          
          {technicalError && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-300 font-mono">
              <p className="font-semibold mb-1">Informação técnica (para suporte):</p>
              <code>{technicalError}</code>
            </div>
          )}
          
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Já possui uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <ThemeToggle />
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} - Sistema BLUE
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
