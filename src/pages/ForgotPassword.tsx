
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { NamedLogo } from '@/components/ui/namedlogo';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/auth/ThemeToggle';

// Form schema
const resetSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' }),
});

type ResetFormValues = z.infer<typeof resetSchema>;

const ForgotPassword = () => {
  const { resetPassword, isLoading, error } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  
  // Initialize form
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit: SubmitHandler<ResetFormValues> = async (data) => {
    if (form.formState.isSubmitting || isLoading) return;
    
    try {
      await resetPassword(data.email);
      setSubmitted(true);
    } catch (error) {
      // Error is already handled in resetPassword function
      console.error('Unexpected error during password reset:', error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-col items-center justify-center pt-8">
          <div className="w-full flex justify-center py-4">
            <NamedLogo size="lg" />
          </div>
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <>
              <p className="text-muted-foreground text-center mb-6">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="your@email.com"
                            disabled={isLoading || form.formState.isSubmitting}
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {error && (
                    <div className="bg-destructive/10 p-3 rounded-md border border-destructive/30">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || form.formState.isSubmitting}
                  >
                    {(isLoading || form.formState.isSubmitting) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : 'Send Reset Instructions'}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">Check your email</h3>
              <p className="text-muted-foreground mb-6">
                We've sent password reset instructions to your email address.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </div>
          )}
          
          {!submitted && (
            <div className="mt-4 text-center">
              <Button asChild variant="link">
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </Button>
            </div>
          )}
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

export default ForgotPassword;
