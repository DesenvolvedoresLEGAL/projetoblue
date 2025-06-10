
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface EnhancedFormFieldProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

/**
 * Enhanced Form Field component optimized for dark mode
 * Provides better contrast and visual feedback
 */
export const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className
}) => {
  return (
    <div className={cn("enhanced-form-field", className)}>
      <Label 
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          "enhanced-search-input",
          error && "border-destructive focus:border-destructive focus:ring-destructive/20"
        )}
      />
      
      {error && (
        <p className="text-xs text-destructive mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default EnhancedFormField;
