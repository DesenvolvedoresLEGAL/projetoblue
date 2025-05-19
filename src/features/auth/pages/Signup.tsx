
import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { NamedLogo } from '@/components/ui/namedlogo';
import { SignupForm } from '@/components/auth/SignupForm';
import { ThemeToggle } from '@/components/auth/ThemeToggle';
import { useAuth } from '@/features/auth/context/AuthContext';

const Signup = () => {
  const { signUp, isAuthenticated, error, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup form submitted");
    
    try {
      const form = e.target as HTMLFormElement;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;
      const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value;
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      console.log('Form validation passed, sending signup data:', { email });
      await signUp(email, password);
    } catch (error: any) {
      console.error("Error caught in Signup component:", error);
      // Error is already handled in the signUp function
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center justify-center pt-8">
          <div className="w-full flex justify-center py-4">
            <NamedLogo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-center">Create Account</h2>
        </CardHeader>
        <CardContent>
          <SignupForm 
            onSubmit={handleSubmit} 
            error={error}
            isLoading={isLoading}
          />
          
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <ThemeToggle />
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} - BLUE System
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
