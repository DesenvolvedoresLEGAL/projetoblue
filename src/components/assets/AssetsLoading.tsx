
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const AssetsLoading = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventário de Ativos</h1>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
};

export default AssetsLoading;
