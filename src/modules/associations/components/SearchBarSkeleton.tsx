
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SearchBarSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="flex-1 h-10" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-4 w-48" />
    </div>
  );
};

export default SearchBarSkeleton;
