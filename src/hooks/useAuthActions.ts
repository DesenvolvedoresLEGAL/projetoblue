
import { useAuthProcessing } from './auth/useAuthProcessing';
import { useSignUp } from './auth/useSignUp';
import { useSignIn } from './auth/useSignIn';
import { useSignOut } from './auth/useSignOut';

export function useAuthActions(updateState: (state: any) => void) {
  const { 
    isAuthProcessing, 
    setProcessingWithTimeout, 
    clearProcessingState 
  } = useAuthProcessing();
  
  const { signUp, technicalError: signUpError } = useSignUp(
    updateState, 
    isAuthProcessing, 
    setProcessingWithTimeout, 
    clearProcessingState
  );
  
  const { signIn, technicalError: signInError } = useSignIn(
    updateState, 
    isAuthProcessing, 
    setProcessingWithTimeout, 
    clearProcessingState
  );
  
  const { signOut } = useSignOut(
    updateState, 
    isAuthProcessing, 
    setProcessingWithTimeout, 
    clearProcessingState
  );

  // Combine technical errors from both sign up and sign in
  const technicalError = signUpError || signInError;

  return { signIn, signUp, signOut, technicalError };
}
