
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from '@/hooks/useIsMobile';

interface AssetSummaryCardProps {
  title: string;
  description: string;
  total: number;
  available: number;
  inUse: number;
  icon: React.ReactNode;
  actionLink: string;
  isLoading?: boolean;
}

export const AssetSummaryCard: React.FC<AssetSummaryCardProps> = ({
  title,
  description,
  total,
  available,
  inUse,
  icon,
  actionLink,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const availabilityPercentage = total > 0 ? (available / total) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#4D2BFB]/10 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className={`legal-title ${isMobile ? 'text-lg' : 'text-xl'}`}>
                {title}
              </CardTitle>
              <CardDescription className="legal-text text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-3xl font-bold text-[#4D2BFB] mb-2">
            {total.toLocaleString()}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {available}
              </div>
              <div className="text-xs text-muted-foreground">Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {inUse}
              </div>
              <div className="text-xs text-muted-foreground">Em uso</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Disponibilidade</span>
              <span className="font-medium">{availabilityPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={availabilityPercentage} 
              className="h-2"
              style={{
                backgroundColor: '#f1f5f9',
              }}
            />
          </div>
        </div>

        <Button 
          onClick={() => navigate(actionLink)}
          className={`legal-button w-full ${isMobile ? 'h-12 text-base' : 'h-10'}`}
          variant="outline"
        >
          Gerenciar {title}
        </Button>
      </CardContent>
    </Card>
  );
};
