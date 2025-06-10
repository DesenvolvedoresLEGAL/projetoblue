
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  disabled?: boolean;
}

export const PasswordInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "••••••••", 
  required = true,
  className = "",
  autoComplete,
  disabled = false
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <Input 
        id={id} 
        type={showPassword ? "text" : "password"} 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`pr-10 ${className}`}
        autoComplete={autoComplete}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-legal-primary dark:hover:text-legal-secondary hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10"
        onClick={togglePasswordVisibility}
        tabIndex={-1}
        disabled={disabled}
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {showPassword ? (
          <Eye size={16} aria-hidden="true" className="text-legal-primary dark:text-legal-secondary" />
        ) : (
          <EyeOff size={16} aria-hidden="true" className="text-legal-primary dark:text-legal-secondary" />
        )}
      </Button>
    </div>
  );
};
