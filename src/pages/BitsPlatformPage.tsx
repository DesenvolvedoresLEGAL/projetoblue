
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";

// Import existing BITS pages/components - these are full pages, so we'll render them directly
import BitsDashboard from "./bits/BitsDashboard";
import BitsIndicateNow from "./bits/BitsIndicateNow";
import BitsMyReferrals from "./bits/BitsMyReferrals";
import BitsPointsAndRewards from "./bits/BitsPointsAndRewards";
import BitsSettings from "./bits/BitsSettings";
import BitsHelpAndSupport from "./bits/BitsHelpAndSupport";

// Import the new component
import RankingAndBadgesDisplay from "@/components/bits/RankingAndBadgesDisplay";

const BitsPlatformPage: React.FC = () => {
  return (
    <div className="space-y-4 p-4 md:p-6">
      <PageBreadcrumbs />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary">BITS LEGAL™ Platform</h1>
        {/* Potentially add some global actions or stats here later */}
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="indicate">Indicate Now</TabsTrigger>
          <TabsTrigger value="referrals">My Referrals</TabsTrigger>
          <TabsTrigger value="points">Points & Rewards</TabsTrigger>
          <TabsTrigger value="ranking">Ranking & Badges</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="help">Help & Support</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <BitsDashboard />
        </TabsContent>
        <TabsContent value="indicate" className="mt-4">
          <BitsIndicateNow />
        </TabsContent>
        <TabsContent value="referrals" className="mt-4">
          <BitsMyReferrals />
        </TabsContent>
        <TabsContent value="points" className="mt-4">
          <BitsPointsAndRewards />
        </TabsContent>
        <TabsContent value="ranking" className="mt-4">
          <RankingAndBadgesDisplay />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <BitsSettings />
        </TabsContent>
        <TabsContent value="help" className="mt-4">
          <BitsHelpAndSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BitsPlatformPage;
