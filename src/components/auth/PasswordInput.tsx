
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
  disabled?: boolean;  // Add the disabled prop to the interface
}

export const PasswordInput = ({ 
  id, 
  value, 
  onChange, 
  placeholder = "••••••••", 
  required = true,
  className = "",
  autoComplete,
  disabled = false  // Add default value for the disabled prop
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
        disabled={disabled}  // Pass the disabled prop to the Input component
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
        onClick={togglePasswordVisibility}
        tabIndex={-1}
        disabled={disabled}  // Also disable the toggle button when the input is disabled
        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {showPassword ? (
          <Eye size={16} aria-hidden="true" />
        ) : (
          <EyeOff size={16} aria-hidden="true" />
        )}
      </Button>
    </div>
  );
};
