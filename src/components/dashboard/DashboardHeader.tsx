
import React from "react";

interface DashboardHeaderProps {
  title: string;
}

export function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      </div>
    </div>
  );
}
