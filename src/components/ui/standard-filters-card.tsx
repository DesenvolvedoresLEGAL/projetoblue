
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandardFiltersCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const StandardFiltersCard: React.FC<StandardFiltersCardProps> = ({
  title = "Filtros e Busca",
  children,
  className
}) => {
  return (
    <Card className={cn("border-[#4D2BFB]/20 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#020CBC] font-neue-haas">
          <Filter className="h-4 w-4 text-[#03F9FF]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
