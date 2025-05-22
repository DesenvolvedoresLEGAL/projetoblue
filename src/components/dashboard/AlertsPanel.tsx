
import React from "react";
import { useAssets } from "@/context/useAssets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Wifi, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { isSameStatus } from "@/utils/assetUtils";

export function AlertsPanel() {
  const { assets } = useAssets();
  
  // Calculate alerts
  const noDataChips = assets.filter(a => a.type === 'CHIP' && isSameStatus(a.status, 'SEM DADOS')).length;
  const unassignedAssets = assets.filter(a => !a.clientId).length;
  
  // Calculate subscriptions that expire in the next 7 days
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const expiringSubscriptions = assets.filter(a => 
    a.subscription?.endDate && 
    new Date(a.subscription.endDate) > today && 
    new Date(a.subscription.endDate) < nextWeek
  ).length;
  
  const expiredSubscriptions = assets.filter(a => 
    a.subscription?.endDate && 
    new Date(a.subscription.endDate) < today
  ).length;

  const alerts = [
    {
      icon: <Wifi className="h-5 w-5 text-red-500" />,
      title: "Chips Without Data",
      count: noDataChips,
      path: "/inventory/assets?status=SEM%20DADOS&type=CHIP"
    },
    {
      icon: <Users className="h-5 w-5 text-amber-500" />,
      title: "Unassigned Assets",
      count: unassignedAssets,
      path: "/inventory/assets?unassigned=true"
    },
    {
      icon: <Clock className="h-5 w-5 text-orange-500" />,
      title: "Expiring Subscriptions",
      count: expiringSubscriptions,
      path: "/inventory/subscriptions?expiring=true"
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      title: "Expired Subscriptions",
      count: expiredSubscriptions,
      path: "/inventory/subscriptions?expired=true"
    }
  ];

  return (
    <Card className="rounded-2xl border shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Active Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <Link 
            key={index} 
            to={alert.path}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              {alert.icon}
              <span>{alert.title}</span>
            </div>
            <Badge variant={alert.count > 0 ? "destructive" : "outline"}>
              {alert.count}
            </Badge>
          </Link>
        ))}
        
        {alerts.every(a => a.count === 0) && (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No active alerts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
