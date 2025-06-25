
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandardFiltersCardProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  additionalFilters?: React.ReactNode;
}

export const StandardFiltersCard: React.FC<StandardFiltersCardProps> = ({
  title = "Filtros e Busca",
  children,
  className,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  additionalFilters
}) => {
  return (
    <Card className={cn("border-[#4D2BFB]/20 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-[#020CBC] font-neue-haas">
          <Filter className="h-4 w-4 text-[#03F9FF]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {searchPlaceholder && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="max-w-sm"
          />
        )}
        {additionalFilters}
        {children}
      </CardContent>
    </Card>
  );
};
