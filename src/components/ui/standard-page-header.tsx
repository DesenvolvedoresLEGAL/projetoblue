
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StandardPageHeaderProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

export const StandardPageHeader: React.FC<StandardPageHeaderProps> = ({
  icon: Icon,
  title,
  description,
  children,
  className
}) => {
  return (
    <Card className={cn("border-[#4D2BFB]/20 bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5 shadow-sm", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#03F9FF]/20">
              <Icon className="h-6 w-6 text-[#4D2BFB] dark:text-[#B9ABFC]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight dark:text-[#868CFD] text-[#020CBC] font-neue-haas">
                {title}
              </h1>
              <p className="text-muted-foreground font-neue-haas mt-1">
                {description}
              </p>
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
