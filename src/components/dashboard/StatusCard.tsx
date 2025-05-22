
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleAlert } from "lucide-react";
import { Link } from "react-router-dom";

export interface StatusCardItem {
  id: string;
  uuid?: string;
  identifier: string;
  type: string;
  status: string;
  additionalInfo?: string;
}

interface StatusCardProps {
  title: string;
  description: string;
  items: StatusCardItem[];
  isLoading: boolean;
  emptyMessage?: string;
  actionLabel: string;
  actionPath: string;
  variant?: "default" | "problem" | "warning";
  icon?: React.ReactNode;
  itemRenderer?: (item: StatusCardItem) => React.ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  description,
  items,
  isLoading,
  emptyMessage = "Nenhum item encontrado",
  actionLabel,
  actionPath,
  variant = "default",
  icon,
  itemRenderer,
}) => {
  // Determine card styling based on variant
  const getCardClasses = () => {
    switch (variant) {
      case "problem":
        return "bg-red-50 border-red-200 flex flex-col h-full";
      case "warning":
        return "bg-yellow-50 border-yellow-200 flex flex-col h-full";
      default:
        return "flex flex-col h-full";
    }
  };

  // Determine button styling based on variant
  const getButtonVariant = () => {
    switch (variant) {
      case "problem":
        return "destructive";
      case "warning":
        return "outline";
      default:
        return "outline";
    }
  };

  // Default item renderer if none provided
  const defaultItemRenderer = (item: StatusCardItem) => (
    <li key={item.id || item.uuid} className="flex items-center gap-2 text-sm font-mono border-b border-gray-100 py-1 last:border-b-0">
      <CircleAlert className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="font-semibold">{item.identifier}</span>
      <span className="text-xs text-muted-foreground ml-auto">
        {item.additionalInfo || `${item.type} - ${item.status}`}
      </span>
    </li>
  );

  return (
    <Card className={getCardClasses()}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            {icon}
            <span>
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <>
                  {items.length} {title}
                </>
              )}
            </span>
          </CardTitle>
        </div>
        <CardDescription className={variant === "problem" ? "text-red-700" : variant === "warning" ? "text-yellow-700" : ""}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <ul className="space-y-1">
            {items.map(item => (itemRenderer ? itemRenderer(item) : defaultItemRenderer(item)))}
          </ul>
        ) : (
          <p className="text-center py-3 text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <Link to={actionPath} className="w-full">
          <Button variant={getButtonVariant()} className="w-full" size="sm">
            {actionLabel}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
