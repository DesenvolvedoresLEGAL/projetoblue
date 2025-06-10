
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
 * Enhanced Form Field component optimized for dark mode following PRD specifications
 * Provides better contrast and visual feedback with LEGAL brand colors
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
    <div className={cn("enhanced-form-field space-y-2", className)}>
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
          "enhanced-search-input bg-input border-border text-foreground placeholder:text-muted-foreground",
          "focus:border-legal-primary dark:focus:border-legal-primary focus:ring-2 focus:ring-legal-primary/20",
          "transition-colors duration-200",
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
