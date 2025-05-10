
import React from "react";
import { useAssets } from "@/context/useAssets";
import { 
  DashboardKpis, 
  AssetsChart, 
  EventsTimeline,
  AlertsPanel,
  QuickActions 
} from "@/components/dashboard";

const Index = () => {
  const { assets, loading } = useAssets();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
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
    </div>
  );
};

export default Index;
