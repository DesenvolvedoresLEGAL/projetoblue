
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

interface EnhancedCardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

interface EnhancedCardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Enhanced Card component optimized for dark mode
 * Provides better visual hierarchy and contrast
 */
export const EnhancedCard: React.FC<EnhancedCardProps> = ({ 
  children, 
  className, 
  hoverable = true 
}) => {
  return (
    <Card className={cn(
      "enhanced-card transition-all duration-300",
      hoverable && "hover:scale-[1.02]",
      className
    )}>
      {children}
    </Card>
  );
};

export const EnhancedCardHeader: React.FC<EnhancedCardHeaderProps> = ({ 
  title, 
  description, 
  icon, 
  action,
  className 
}) => {
  return (
    <CardHeader className={cn("pb-4", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-legal-primary/10 text-legal-primary dark:bg-legal-primary/20 dark:text-legal-secondary">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="enhanced-title text-lg">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="enhanced-body-text mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </CardHeader>
  );
};

export const EnhancedCardContent: React.FC<EnhancedCardContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <CardContent className={cn("pt-0", className)}>
      {children}
    </CardContent>
  );
};
