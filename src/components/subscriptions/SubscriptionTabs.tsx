
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarClock, CheckCircle2, Calendar, AlertTriangle } from "lucide-react";
import { CardHeader } from "@/components/ui/card";

interface SubscriptionTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subscriptionCount: number;
  activeCount: number;
  expiredCount: number;
}

export const SubscriptionTabs: React.FC<SubscriptionTabsProps> = ({
  activeTab,
  setActiveTab,
  subscriptionCount,
  activeCount,
  expiredCount,
}) => {
  return (
    <CardHeader className="pb-3">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all" className="flex items-center">
            <CalendarClock className="h-4 w-4 mr-2" />
            Todas ({subscriptionCount})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Ativas ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="ending-soon" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            A Vencer
          </TabsTrigger>
          <TabsTrigger value="expired" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Expiradas ({expiredCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </CardHeader>
  );
};
