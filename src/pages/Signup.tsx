
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { NamedLogo } from '@/components/ui/namedlogo';
import { SignupForm } from '@/components/auth/SignupForm';
import { ThemeToggle } from '@/components/auth/ThemeToggle';
import { toast } from '@/utils/toast';
import { showFriendlyError } from '@/utils/errorTranslator';

const Signup = () => {
  const { signUp, isAuthenticated, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [signupError, setSignupError] = useState<string | null>(error);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicalErrorInfo, setTechnicalErrorInfo] = useState<string | null>(null);

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
    
    setIsSubmitting(true);
    setTechnicalErrorInfo(null);
    setSignupError(null);
    
    try {
      const form = e.target as HTMLFormElement;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const username = (form.elements.namedItem('username') as HTMLInputElement).value;
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;
      const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value;
      
      if (password !== confirmPassword) {
        setSignupError('As senhas não coincidem. Verifique e tente novamente.');
        setIsSubmitting(false);
        return;
      }
      
      
      
      // Corrigido: usando apenas 3 argumentos conforme a assinatura esperada
      const result = await signUp(email, password, 'cliente');
      
      if (result && result.technicalError) {
        setTechnicalErrorInfo(JSON.stringify(result.technicalError, null, 2));
      }
      
    } catch (error: unknown) {
      
      
      if (error.message || error.stack) {
        setTechnicalErrorInfo(`Erro técnico: ${error.message || 'Erro desconhecido'}
Stack: ${error.stack || 'N/A'}
Categoria: ${error.category || 'Desconhecida'}
Timestamp: ${new Date().toISOString()}`);
      }
      
      const friendlyMessage = showFriendlyError(error, 'create');
      setSignupError(friendlyMessage);
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
          
          {technicalErrorInfo && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-300 font-mono overflow-auto max-h-48">
              <p className="font-semibold mb-1">Informação técnica (para suporte):</p>
              <code className="whitespace-pre-wrap break-all">{technicalErrorInfo}</code>
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
