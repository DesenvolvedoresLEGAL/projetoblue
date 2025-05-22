
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";

interface StatsSummaryCardProps {
  title: string;
  total: number;
  available: number;
  unavailable: number;
  description?: string;
  isLoading?: boolean;
  actionLabel?: string;
  actionPath?: string;
}

export const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  title,
  total,
  available,
  unavailable,
  description = "Disponibilidade atual do inventário",
  isLoading = false,
  actionLabel = "Ver todos",
  actionPath = "/assets/inventory",
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-normal">
          {title}: <span className="font-semibold">{total}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="size-4 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="size-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Disponíveis</p>
                <p className="text-lg font-bold">{available}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-gray-300 rounded-full flex items-center justify-center">
                <X className="size-3 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Indisponíveis</p>
                <p className="text-lg font-bold">{unavailable}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to={actionPath} className="w-full">
          <Button variant="outline" className="w-full" size="sm">
            {actionLabel}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
