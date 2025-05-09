
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivitySquare, History, AlertTriangle, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";

const MonitoringSummary = () => {
  const monitoringOptions = [
    {
      title: "Active Monitoring",
      description: "Real-time monitoring of assets and resources",
      icon: <ActivitySquare className="h-6 w-6" />,
      path: "/inventory/monitoring/active",
      color: "bg-blue-100 text-blue-700",
      features: [
        "Current status of all assets",
        "Alert notifications for issues",
        "Resource utilization metrics"
      ]
    },
    {
      title: "History",
      description: "View past activities and events",
      icon: <History className="h-6 w-6" />,
      path: "/inventory/monitoring/history",
      color: "bg-purple-100 text-purple-700",
      features: [
        "Event logs and timestamps",
        "Status change tracking",
        "Historical performance data"
      ]
    }
  ];

  const alertTypes = [
    {
      title: "Blocked Assets",
      description: "Assets that require immediate attention",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-red-100 text-red-700"
    },
    {
      title: "No Data Assets",
      description: "Assets without connectivity or data",
      icon: <WifiOff className="h-5 w-5" />,
      color: "bg-gray-100 text-gray-700"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Monitoring Resources</h1>
        <p className="text-muted-foreground mt-2">
          Tools to track, monitor, and analyze the status of your assets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {monitoringOptions.map((option, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`${option.color} p-2 rounded-md`}>
                {option.icon}
              </div>
              <div>
                <CardTitle>{option.title}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Key Features:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {option.features.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground">{feature}</li>
                  ))}
                </ul>
              </div>
              <Button asChild className="w-full">
                <Link to={option.path}>View {option.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Alert Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {alertTypes.map((alert, index) => (
            <div key={index} className="border rounded-md p-4 flex items-center gap-3">
              <div className={`${alert.color} p-2 rounded-md`}>
                {alert.icon}
              </div>
              <div>
                <h3 className="font-medium">{alert.title}</h3>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitoringSummary;
