
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-muted/50 rounded-lg p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
};

export default StatsSkeleton;
