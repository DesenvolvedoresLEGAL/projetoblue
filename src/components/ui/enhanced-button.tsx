
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  enhanced?: boolean;
}

/**
 * Enhanced Button component optimized for dark mode
 * Provides better visual feedback and loading states
 */
export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  className,
  variant = 'default',
  isLoading = false,
  loadingText = 'Carregando...',
  enhanced = true,
  disabled,
  ...props
}) => {
  const enhancedClasses = {
    default: enhanced ? 'enhanced-button-primary' : '',
    secondary: enhanced ? 'enhanced-button-secondary' : '',
    destructive: enhanced ? 'hover:shadow-lg transition-shadow duration-200' : '',
    outline: enhanced ? 'hover:shadow-md transition-shadow duration-200' : '',
    ghost: enhanced ? 'hover:bg-muted/50 transition-colors duration-200' : '',
    link: enhanced ? 'hover:text-legal-primary-light transition-colors duration-200' : ''
  };

  return (
    <Button
      variant={variant}
      className={cn(
        enhanced && enhancedClasses[variant],
        "transition-all duration-200",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default EnhancedButton;
