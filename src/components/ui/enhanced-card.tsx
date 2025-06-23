
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
 * Enhanced Card component optimized for dark mode following PRD specifications
 * Provides better visual hierarchy, contrast, and proper shadows
 */
export const EnhancedCard: React.FC<EnhancedCardProps> = ({ 
  children, 
  className, 
  hoverable = true 
}) => {
  return (
    <Card className={cn(
      "enhanced-card transition-all duration-300",
      "bg-card border border-border",
      "shadow-md hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl",
      "dark:bg-card dark:border-border",
      hoverable && "hover:scale-[1.02] hover:border-legal-primary/30 dark:hover:border-legal-primary/30",
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
            <div className={cn(
              "p-2 rounded-lg",
              "bg-legal-primary/10 text-legal-primary",
              "dark:bg-legal-primary/20 dark:text-legal-primary"
            )}>
              {icon}
            </div>
          )}
          <div>
            <CardTitle className={cn(
              "enhanced-title text-lg font-bold",
              "text-foreground dark:text-foreground"
            )}>
              {title}
            </CardTitle>
            {description && (
              <CardDescription className={cn(
                "enhanced-body-text mt-1",
                "text-muted-foreground dark:text-muted-foreground"
              )}>
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
