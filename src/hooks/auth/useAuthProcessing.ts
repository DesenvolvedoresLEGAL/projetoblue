
import { useState, useCallback, useRef } from 'react';

export function useAuthProcessing() {
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearProcessingState = useCallback(() => {
    console.log('Limpando estado de processamento...');
    setIsAuthProcessing(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setProcessingWithTimeout = useCallback((processing: boolean) => {
    setIsAuthProcessing(processing);
    
    if (processing) {
      timeoutRef.current = setTimeout(() => {
        console.warn('Timeout de auth operation detectado, limpando estado...');
        clearProcessingState();
      }, 30000);
    } else {
      clearProcessingState();
    }
  }, [clearProcessingState]);

  return {
    isAuthProcessing,
    setProcessingWithTimeout,
    clearProcessingState
  };
}
