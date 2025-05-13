
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AssetsDashboard = () => {
  // Placeholder data, this would come from your API in a real app
  const stats = {
    inUse: 342,
    faulty: 28,
    expired: 15,
    total: 385
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Assets Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center">
              {stats.inUse}
              <Badge className="ml-2 bg-green-500" variant="secondary">Active</Badge>
            </CardTitle>
            <CardDescription>Assets currently in use</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {Math.round((stats.inUse / stats.total) * 100)}% of total inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center">
              {stats.faulty}
              <Badge className="ml-2 bg-amber-500" variant="secondary">Warning</Badge>
            </CardTitle>
            <CardDescription>Assets with issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {Math.round((stats.faulty / stats.total) * 100)}% of total inventory
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center">
              {stats.expired}
              <Badge className="ml-2 bg-red-500" variant="secondary">Critical</Badge>
            </CardTitle>
            <CardDescription>Expired assets</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {Math.round((stats.expired / stats.total) * 100)}% of total inventory
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Analytics</CardTitle>
            <CardDescription>Asset utilization over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border-t pt-4">
            <p className="text-muted-foreground">Usage graph placeholder</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Last 5 system alerts</CardDescription>
          </CardHeader>
          <CardContent className="border-t pt-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant="destructive">Critical</Badge>
                <span className="text-sm">Asset ID 1058 went offline</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="default">Info</Badge>
                <span className="text-sm">New asset registered</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="warning">Warning</Badge>
                <span className="text-sm">Asset ID 2305 reporting high usage</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions Required</CardTitle>
            <CardDescription>Pending tasks</CardDescription>
          </CardHeader>
          <CardContent className="border-t pt-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge>Action</Badge>
                <span className="text-sm">Review expired assets</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge>Action</Badge>
                <span className="text-sm">Update inventory report</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetsDashboard;
