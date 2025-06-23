import React from "react";
import { useAssets } from "@/context/AssetContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Asset } from '@/types/asset';
import { AlertCircle, Clock, Users, Wifi } from 'lucide-react';
import ProblemAssetsCard from '@modules/dashboard/components/dashboard/ProblemAssetsCard';
import AssetsStatusCard from '@modules/dashboard/components/dashboard/AssetsStatusCard';

export default function AssetsDashboard() {
  const { assets, loading } = useAssets();
  const [stats, setStats] = useState({
    inUse: 0,
    faulty: 0,
    expired: 0,
    total: 0
  });
  
  // Calculate stats based on real data
  useEffect(() => {
    if (assets.length > 0) {
      setStats({
        inUse: assets.filter(a => a.status === 'ALUGADO' || a.status === 'ASSINATURA').length,
        faulty: assets.filter(a => a.status === 'BLOQUEADO' || a.status === 'MANUTENÇÃO').length,
        expired: assets.filter(a => a.status === 'SEM DADOS').length,
        total: assets.length
      });
    }
  }, [assets]);

  // Generate mock recent alerts based on real data
  const generateRecentAlerts = () => {
    const alerts = [];
    
    // Add alerts for assets with problems
    const problematicAssets = assets.filter(a => 
      a.status === 'BLOQUEADO' || a.status === 'MANUTENÇÃO' || a.status === 'SEM DADOS'
    ).slice(0, 3);
    
    problematicAssets.forEach((asset, index) => {
      alerts.push({
        severity: asset.status === 'SEM DADOS' ? 'default' : 
                 asset.status === 'BLOQUEADO' ? 'destructive' : 'warning',
        text: `Asset ID ${asset.id.substring(0, 8)} ${
          asset.status === 'SEM DADOS' ? 'has no data' : 
          asset.status === 'BLOQUEADO' ? 'is blocked' : 'needs maintenance'
        }`
      });
    });
    
    // Add generic alerts if we don't have enough real ones
    if (alerts.length < 3) {
      if (assets.filter(a => !a.clientId).length > 0) {
        alerts.push({ severity: 'default', text: 'Some assets are unassigned' });
      }
      if (alerts.length < 3) {
        alerts.push({ severity: 'warning', text: 'Review expired assets' });
      }
      if (alerts.length < 3) {
        alerts.push({ severity: 'default', text: 'Update inventory report' });
      }
    }
    
    return alerts;
  };
  
  const recentAlerts = generateRecentAlerts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Assets Dashboard</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-muted-foreground">Loading assets data...</p>
        </div>
      ) : (
        <>
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
                  {stats.total > 0 ? Math.round((stats.inUse / stats.total) * 100) : 0}% of total inventory
                </p>
              </CardContent>
            </Card>
            
            <ProblemAssetsCard />
            
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
                  {stats.total > 0 ? Math.round((stats.expired / stats.total) * 100) : 0}% of total inventory
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <AssetsStatusCard />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>System alerts based on asset status</CardDescription>
              </CardHeader>
              <CardContent className="border-t pt-4">
                <ul className="space-y-2">
                  {recentAlerts.map((alert, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Badge variant={alert.severity}>{
                        alert.severity === 'destructive' ? 'Critical' : 
                        alert.severity === 'warning' ? 'Warning' : 'Info'
                      }</Badge>
                      <span className="text-sm">{alert.text}</span>
                    </li>
                  ))}
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
                  {stats.expired > 0 && (
                    <li className="flex items-center gap-2">
                      <Badge>Action</Badge>
                      <span className="text-sm">Review {stats.expired} expired assets</span>
                    </li>
                  )}
                  {stats.faulty > 0 && (
                    <li className="flex items-center gap-2">
                      <Badge>Action</Badge>
                      <span className="text-sm">Check {stats.faulty} assets with issues</span>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Badge>Action</Badge>
                    <span className="text-sm">Update inventory report</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

// Missing BarChart3 icon component
const BarChart3 = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M9 9v10" />
      <path d="M9 5v2" />
      <path d="M15 5v14" />
      <path d="M15 17h-6" />
      <path d="M21 9v10" />
      <path d="M21 5v2" />
    </svg>
  );
};

export default AssetsDashboard;
