
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "@/hooks/useDashboardStats";

interface Event {
  id: number;
  type: string;
  description: string;
  time: Date;
  asset_name: string;
}

interface RecentEventsListProps {
  events: Event[];
}

export function RecentEventsList({ events }: RecentEventsListProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Eventos Recentes</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => navigate('/history')}>
          Ver histórico <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="flex gap-3 border-b pb-2 last:border-0 last:pb-0">
              <div className={`h-2 w-2 mt-2 rounded-full 
                ${event.type === 'register' ? 'bg-green-500' : 
                  event.type === 'link' ? 'bg-blue-500' : 
                  'bg-amber-500'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{event.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{event.type}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(event.time)}</span>
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum evento registrado recentemente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
