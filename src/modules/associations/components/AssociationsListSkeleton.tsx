
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import StatsSkeleton from './StatsSkeleton';
import SearchBarSkeleton from './SearchBarSkeleton';
import AssociationRowSkeleton from './AssociationRowSkeleton';

const AssociationsListSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6 text-primary" />
          <Skeleton className="h-7 w-64" />
        </div>
        <Skeleton className="h-4 w-96 mb-6" />
        
        {/* Stats Skeleton */}
        <StatsSkeleton />
      </div>
      
      {/* Search Bar Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <SearchBarSkeleton />
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-24" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-16" />
                </th>
                <th className="text-left p-4">
                  <Skeleton className="h-4 w-20" />
                </th>
                <th className="w-12 p-4"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 11 }).map((_, index) => (
                <AssociationRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Skeleton */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};

export default AssociationsListSkeleton;
