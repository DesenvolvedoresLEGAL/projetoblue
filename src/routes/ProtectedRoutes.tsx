
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { lazy, Suspense } from "react";
import { AuthRoute } from "@/components/auth/AuthRoute";

// Lazy loaded components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Home = lazy(() => import("@/pages/Home"));
const AssetsInventory = lazy(() => import("@/pages/AssetsInventory"));
const AssetsDashboard = lazy(() => import("@/pages/AssetsDashboard"));
const RegisterAsset = lazy(() => import("@/pages/RegisterAsset"));
const Clients = lazy(() => import("@/pages/Clients"));
const Suppliers = lazy(() => import("@/pages/Suppliers"));
const Association = lazy(() => import("@/pages/Association"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));
const Monitoring = lazy(() => import("@/pages/Monitoring"));
const History = lazy(() => import("@/pages/History"));
const DataUsage = lazy(() => import("@/pages/DataUsage"));
const WifiAnalyzer = lazy(() => import("@/pages/WifiAnalyzer"));
const Topology = lazy(() => import("@/pages/Topology"));
const Discovery = lazy(() => import("@/pages/Discovery"));
const BitsDashboard = lazy(() => import("@/pages/bits/BitsDashboard"));
const BitsIndicateNow = lazy(() => import("@/pages/bits/BitsIndicateNow"));
const BitsMyReferrals = lazy(() => import("@/pages/bits/BitsMyReferrals"));
const BitsPointsAndRewards = lazy(() => import("@/pages/bits/BitsPointsAndRewards"));
const BitsSettings = lazy(() => import("@/pages/bits/BitsSettings"));
const BitsHelpAndSupport = lazy(() => import("@/pages/bits/BitsHelpAndSupport"));

// Loading component
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[200px]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

export const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/*" 
        element={
          <AuthRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Dashboard routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Assets module routes */}
                  <Route path="/assets">
                    <Route index element={<Navigate to="/assets/dashboard" replace />} />
                    <Route path="dashboard" element={<AssetsDashboard />} />
                    <Route path="inventory" element={<AssetsInventory />} />
                    <Route path="register" element={<RegisterAsset />} />
                  </Route>
                  
                  {/* Clients module */}
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  
                  {/* Operations module */}
                  <Route path="/association" element={<Association />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/monitoring" element={<Monitoring />} />
                  
                  {/* Analytics module */}
                  <Route path="/data-usage" element={<DataUsage />} />
                  <Route path="/wifi-analyzer" element={<WifiAnalyzer />} />
                  
                  {/* Topology module */}
                  <Route path="/topology">
                    <Route index element={<Navigate to="/topology/view" replace />} />
                    <Route path="view" element={<Topology />} />
                  </Route>
                  
                  {/* Tools module */}
                  <Route path="/tools">
                    <Route index element={<Navigate to="/tools/discovery" replace />} />
                    <Route path="discovery" element={<Discovery />} />
                  </Route>
                  
                  {/* BITS™ module */}
                  <Route path="/bits">
                    <Route index element={<BitsDashboard />} />
                    <Route path="indicate" element={<BitsIndicateNow />} />
                    <Route path="my-referrals" element={<BitsMyReferrals />} />
                    <Route path="rewards" element={<BitsPointsAndRewards />} />
                    <Route path="settings" element={<BitsSettings />} />
                    <Route path="help" element={<BitsHelpAndSupport />} />
                  </Route>
                  
                  {/* Legacy redirects for backward compatibility */}
                  <Route path="/register-asset" element={<Navigate to="/assets/register" replace />} />
                  <Route path="/link-asset" element={<Navigate to="/association" replace />} />
                  <Route path="/inventory" element={<Navigate to="/assets/inventory" replace />} />
                  
                  {/* Catch-all route for protected area */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </AuthRoute>
        } 
      />
    </Routes>
  );
};
