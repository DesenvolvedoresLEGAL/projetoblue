
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  strength: 'weak' | 'medium' | 'strong';
}

export const PasswordStrengthIndicator = ({ strength }: PasswordStrengthIndicatorProps) => {
  const getPasswordStrengthColor = () => {
    switch (strength) {
      case 'strong': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'weak': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getPasswordStrengthValue = () => {
    switch (strength) {
      case 'strong': return 100;
      case 'medium': return 66;
      case 'weak': return 33;
      default: return 0;
    }
  };

  const getStrengthText = () => {
    switch (strength) {
      case 'weak': return 'Fraca';
      case 'medium': return 'Média';
      case 'strong': return 'Forte';
      default: return '';
    }
  };

  const getStrengthTextColor = () => {
    switch (strength) {
      case 'weak': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'strong': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-1">
      <Progress 
        value={getPasswordStrengthValue()} 
        className={`h-2 transition-all duration-300 ${getPasswordStrengthColor()}`} 
      />
      <p className="text-xs text-muted-foreground">
        Força da senha: 
        <span className={`ml-1 font-medium transition-colors duration-200 ${getStrengthTextColor()}`}>
          {getStrengthText()}
        </span>
      </p>
    </div>
  );
};
