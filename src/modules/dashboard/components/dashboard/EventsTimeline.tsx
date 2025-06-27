
import React from "react";
import { useAssets } from "@/context/AssetContext";
import { cn } from "@/lib/utils";
import { Clock, Package, Activity } from "lucide-react";

export function EventsTimeline() {
  const { history } = useAssets();
  
  // Get the last 5 events, sorted by timestamp (newest first)
  const recentEvents = [...history]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
    
  if (recentEvents.length === 0) {
    return <div className="text-muted-foreground text-center py-8">No events recorded yet</div>;
  }

  return (
    <div className="space-y-4">
      {recentEvents.map((event, index) => (
        <TimelineEvent key={event.id} event={event} isLast={index === recentEvents.length - 1} />
      ))}
    </div>
  );
}

import type { AssetHistoryEntry } from '@/types/assetHistory';

interface TimelineEventProps {
  event: AssetHistoryEntry;
  isLast: boolean;
}

function TimelineEvent({ event, isLast }: TimelineEventProps) {
  // Determine the icon based on event type
  let Icon = Activity;
  let iconColor = "text-gray-500";
  
  if (event.action === "CREATE") {
    Icon = Package;
    iconColor = "text-green-500";
  } else if (event.action === "UPDATE") {
    Icon = Activity;
    iconColor = "text-blue-500";
  } else if (event.action === "STATUS_CHANGE") {
    Icon = Activity;
    iconColor = "text-amber-500";
  }
  
  const formattedTime = new Date(event.timestamp).toLocaleString();
  
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={cn("rounded-full p-2 w-10 h-10 flex items-center justify-center", 
          iconColor === "text-green-500" ? "bg-green-100" : 
          iconColor === "text-blue-500" ? "bg-blue-100" : 
          iconColor === "text-amber-500" ? "bg-amber-100" : "bg-gray-100"
        )}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {!isLast && <div className="w-0.5 bg-gray-200 grow my-1"></div>}
      </div>
      
      <div className="pb-6">
        <h3 className="font-medium">{event.description || `Asset ${event.assetIds[0].substring(0, 8)} ${event.action}`}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {formattedTime}
        </p>
        {event.details && <p className="text-sm mt-1">{event.details}</p>}
      </div>
    </div>
  );
}
