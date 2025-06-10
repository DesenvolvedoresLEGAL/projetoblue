
import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface PasswordMatchProps {
  passwordsMatch: boolean;
  confirmPassword: string;
}

export const PasswordMatch = ({ passwordsMatch, confirmPassword }: PasswordMatchProps) => {
  if (!confirmPassword) return null;
  
  if (!passwordsMatch) {
    return (
      <p className="text-sm text-destructive flex items-center mt-1 transition-colors duration-200">
        <AlertCircle size={14} className="mr-1" />
        As senhas não coincidem
      </p>
    );
  }
  
  return (
    <p className="text-sm text-success flex items-center mt-1 transition-colors duration-200">
      <Check size={14} className="mr-1" />
      As senhas coincidem
    </p>
  );
};
