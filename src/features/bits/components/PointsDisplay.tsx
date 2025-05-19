
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface PointsDisplayProps {
  points: number;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({
  points,
  label = 'Pontos',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 bg-primary/10">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className={`font-bold ${sizeClasses[size]}`}>
          {points.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};
