
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PackageSearch, 
  Link, 
  Users, 
  ShieldAlert, 
  CircleCheck, 
  CircleX,
  BarChart3,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, formatRelativeTime, DashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Home = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useDashboardStats();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to LEGAL Platform - Your assets management hub
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            title="Refresh dashboard data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            onClick={() => navigate('/inventory/tools/register-asset')}
            className="bg-[#4D2BFB] hover:bg-[#4D2BFB]/90"
          >
            Register New Asset
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/inventory/tools/associate-assets')}
          >
            Link Asset to Client
          </Button>
        </div>
      </div>
      
      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load dashboard data: {error.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{(data as DashboardStats | undefined)?.totalAssets || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Routers, switches, and network equipment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{(data as DashboardStats | undefined)?.activeClients || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Clients with active equipment
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets with Issues</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-destructive">{(data as DashboardStats | undefined)?.assetsWithIssues || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Requiring attention or service
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content area (70%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Assets Overview</CardTitle>
              <CardDescription>
                Status breakdown of all registered equipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                <div className="flex flex-col items-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mb-2" />
                  <p>Asset usage statistics chart will appear here</p>
                </div>
              </div>
              
              {/* Status Summary */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <CircleCheck className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
                  {isLoading ? (
                    <Skeleton className="h-6 w-8 mb-1" />
                  ) : (
                    <span className="text-xl font-bold">
                      {(data as DashboardStats | undefined)?.statusSummary?.active || 0}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">Active</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-1" />
                  {isLoading ? (
                    <Skeleton className="h-6 w-8 mb-1" />
                  ) : (
                    <span className="text-xl font-bold">
                      {(data as DashboardStats | undefined)?.statusSummary?.warning || 0}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">Warning</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <CircleX className="h-5 w-5 text-red-600 dark:text-red-400 mb-1" />
                  {isLoading ? (
                    <Skeleton className="h-6 w-8 mb-1" />
                  ) : (
                    <span className="text-xl font-bold">
                      {(data as DashboardStats | undefined)?.statusSummary?.critical || 0}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">Critical</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Latest activities and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-2 w-2 rounded-full mt-2" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-5 w-[250px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (data as DashboardStats | undefined)?.recentEvents && (data as DashboardStats | undefined)?.recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {(data as DashboardStats | undefined)?.recentEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        event.type === 'register' ? 'bg-green-500' : 
                        event.type === 'link' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.description}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(event.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-muted-foreground">
                  <p>No recent events found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right sidebar (30%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Recently Registered Assets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recently Registered</CardTitle>
              <CardDescription>
                Latest assets added to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div>
                        <Skeleton className="h-5 w-[120px] mb-1" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (data as DashboardStats | undefined)?.recentAssets && (data as DashboardStats | undefined)?.recentAssets.length > 0 ? (
                <div className="space-y-3">
                  {(data as DashboardStats | undefined)?.recentAssets.map(asset => (
                    <div key={asset.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.type}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        asset.status.toLowerCase().includes('active') || asset.status.toLowerCase().includes('disponível') ? 
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        asset.status.toLowerCase().includes('warning') || asset.status.toLowerCase().includes('aviso') ? 
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        asset.status.toLowerCase().includes('critical') || asset.status.toLowerCase().includes('crítico') ? 
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 text-muted-foreground">
                  <p>No recent assets found</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common operations and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/inventory/tools/register-asset')}
              >
                <PackageSearch className="mr-2 h-4 w-4" />
                Register New Asset
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/inventory/tools/associate-assets')} 
              >
                <Link className="mr-2 h-4 w-4" />
                Link Asset to Client
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/inventory/assets')}
              >
                <Users className="mr-2 h-4 w-4" />
                View Full Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
