
import React, { useState, useEffect } from "react";
import { useAssets } from "@/context/useAssets";
import { Asset } from "@/types/asset";
import { Card, CardContent } from "@/components/ui/card";
import { format, addMonths, addYears, addDays, isAfter, isBefore } from "date-fns";
import {
  SubscriptionsHeader,
  SubscriptionTabs,
  SubscriptionTable,
  ExtendSubscriptionDialog
} from "@/components/subscriptions";

export default function Subscriptions() {
  const { 
    assets, 
    clients, 
    getClientById, 
    updateAsset, 
    getExpiredSubscriptions,
    returnAssetsToStock,
    extendSubscription,
  } = useAssets();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [assetToExtend, setAssetToExtend] = useState<Asset | null>(null);
  const [newEndDate, setNewEndDate] = useState("");
  
  // Get all assets with subscriptions
  const subscriptionAssets = assets.filter(asset => asset.subscription);
  
  // Get assets with active subscriptions
  const activeSubscriptions = subscriptionAssets.filter(
    asset => !asset.subscription?.isExpired
  );
  
  // Get assets with expired subscriptions
  const expiredSubscriptions = getExpiredSubscriptions();
  
  // Assets to display based on active tab and search term
  const [displayedAssets, setDisplayedAssets] = useState<Asset[]>([]);
  
  // Update displayed assets when tab or search term changes
  useEffect(() => {
    let filtered: Asset[] = [];
    
    if (activeTab === "all") {
      filtered = subscriptionAssets;
    } else if (activeTab === "active") {
      filtered = activeSubscriptions;
    } else if (activeTab === "expired") {
      filtered = expiredSubscriptions;
    } else if (activeTab === "ending-soon") {
      // Assets expiring in the next 30 days
      const thirtyDaysFromNow = addDays(new Date(), 30).toISOString();
      
      filtered = activeSubscriptions.filter(asset => {
        const endDate = new Date(asset.subscription?.endDate || "");
        const now = new Date();
        return isBefore(endDate, new Date(thirtyDaysFromNow)) && isAfter(endDate, now);
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(asset => {
        const client = asset.clientId ? getClientById(asset.clientId) : null;
        const searchFields = [
          asset.id,
          asset.type,
          client?.name || "",
          client?.document || "",
          asset.subscription?.event || "",
          asset.type === "CHIP" 
            ? `${(asset as any).iccid} ${(asset as any).phoneNumber} ${(asset as any).carrier}`
            : `${(asset as any).uniqueId} ${(asset as any).brand} ${(asset as any).model}`
        ];
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    setDisplayedAssets(filtered);
  }, [activeTab, searchTerm, subscriptionAssets, activeSubscriptions, expiredSubscriptions]);
  
  // Toggle select all assets
  const toggleSelectAll = () => {
    if (selectedAssets.length === displayedAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(displayedAssets.map(asset => asset.id));
    }
  };
  
  // Toggle select single asset
  const toggleSelectAsset = (assetId: string) => {
    if (selectedAssets.includes(assetId)) {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    } else {
      setSelectedAssets([...selectedAssets, assetId]);
    }
  };
  
  // Handle return to stock action
  const handleReturnToStock = () => {
    if (selectedAssets.length > 0) {
      returnAssetsToStock(selectedAssets);
      setSelectedAssets([]);
    }
  };
  
  // Handle extend subscription
  const handleExtendSubscription = () => {
    if (assetToExtend && newEndDate) {
      extendSubscription(assetToExtend.id, newEndDate);
      setShowExtendDialog(false);
      setAssetToExtend(null);
      setNewEndDate("");
    }
  };
  
  // Open extend dialog for an asset
  const openExtendDialog = (asset: Asset) => {
    setAssetToExtend(asset);
    
    // Default to extending by the original duration
    if (asset.subscription) {
      const startDate = new Date(asset.subscription.startDate);
      const currentEndDate = new Date(asset.subscription.endDate);
      let newEnd;
      
      if (asset.subscription.type === "MENSAL") {
        newEnd = addMonths(currentEndDate, 1);
      } else if (asset.subscription.type === "ANUAL") {
        newEnd = addYears(currentEndDate, 1);
      } else {
        // For custom, extend by the same duration as original
        const originalDuration = currentEndDate.getTime() - startDate.getTime();
        newEnd = new Date(currentEndDate.getTime() + originalDuration);
      }
      
      setNewEndDate(format(newEnd, "yyyy-MM-dd"));
    }
    
    setShowExtendDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <SubscriptionsHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedAssets={selectedAssets}
        handleReturnToStock={handleReturnToStock}
      />
      
      <Card>
        <SubscriptionTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          subscriptionCount={subscriptionAssets.length}
          activeCount={activeSubscriptions.length}
          expiredCount={expiredSubscriptions.length}
        />
        
        <CardContent className="p-0">
          <SubscriptionTable 
            displayedAssets={displayedAssets}
            selectedAssets={selectedAssets}
            toggleSelectAll={toggleSelectAll}
            toggleSelectAsset={toggleSelectAsset}
            getClientById={getClientById}
            openExtendDialog={openExtendDialog}
          />
        </CardContent>
      </Card>
      
      <ExtendSubscriptionDialog 
        open={showExtendDialog}
        setOpen={setShowExtendDialog}
        asset={assetToExtend}
        newEndDate={newEndDate}
        setNewEndDate={setNewEndDate}
        handleExtendSubscription={handleExtendSubscription}
        getClientById={getClientById}
      />
    </div>
  );
}
