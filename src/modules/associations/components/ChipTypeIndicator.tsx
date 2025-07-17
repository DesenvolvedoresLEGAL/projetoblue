
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChipType, getChipTypeLabel } from '../utils/chipUtils';

interface ChipTypeIndicatorProps {
  chipType: ChipType;
  className?: string;
}

const ChipTypeIndicator: React.FC<ChipTypeIndicatorProps> = ({ chipType, className }) => {
  if (chipType === 'none') {
    return null;
  }

  const variant = chipType === 'principal' ? 'default' : 'secondary';
  const label = getChipTypeLabel(chipType);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default ChipTypeIndicator;
