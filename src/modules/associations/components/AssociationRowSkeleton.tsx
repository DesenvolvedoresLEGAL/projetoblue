
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AssociationRowSkeleton: React.FC = () => {
  return (
    <tr className="border-b">
      <td className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <Skeleton className="h-5 w-8" />
          <Skeleton className="h-4 w-16" />
        </div>
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-4" />
      </td>
    </tr>
  );
};

export default AssociationRowSkeleton;
