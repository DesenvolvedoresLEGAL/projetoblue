
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Cpu, Smartphone } from 'lucide-react';

interface AssetTypeIndicatorProps {
  solutionId?: number;
  solutionName?: string;
  className?: string;
}

const AssetTypeIndicator: React.FC<AssetTypeIndicatorProps> = ({ 
  solutionId, 
  solutionName, 
  className 
}) => {
  const isChip = solutionId === 11;
  
  if (isChip) {
    return (
      <Badge variant="outline" className={`${className} flex items-center gap-1`}>
        <Smartphone className="h-3 w-3" />
        CHIP
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`${className} flex items-center gap-1`}>
      <Cpu className="h-3 w-3" />
      {solutionName || 'Equipamento'}
    </Badge>
  );
};

export default AssetTypeIndicator;
