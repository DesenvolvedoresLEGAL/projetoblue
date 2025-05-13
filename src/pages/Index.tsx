
import React from "react";
import { useAssets } from "@/context/useAssets";
import { 
  DashboardKpis, 
  AssetsChart, 
  EventsTimeline,
  AlertsPanel,
  QuickActions 
} from "@/components/dashboard";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { Clock } from "lucide-react";

const Index = () => {
  const { assets, loading } = useAssets();
  const lastSyncTime = new Date().toLocaleTimeString();
  
  return (
    <div className="space-y-4">
      <PageBreadcrumbs />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content area (70%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* KPIs */}
          <DashboardKpis />
          
          {/* Chart */}
          <div className="rounded-2xl border bg-card shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Assets Registered (Last 7 Days)</h2>
            <AssetsChart />
          </div>
          
          {/* Timeline */}
          <div className="rounded-2xl border bg-card shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
            <EventsTimeline />
          </div>
        </div>
        
        {/* Right sidebar (30%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alerts */}
          <AlertsPanel />
          
          {/* Quick Actions */}
          <QuickActions />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background px-6 py-3 flex justify-between items-center text-sm text-muted-foreground mt-8">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Last synced: {lastSyncTime}</span>
        </div>
        <div>
          <span>BLUE Platform v1.0.2</span>
        </div>
        <div>
          <a href="#" className="text-primary hover:underline">Changelog</a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
