
import React from "react";
import { Asset, StatusRecord } from "@/types/asset";
import AssetRow from "./asset-row";

interface AssetRowProps {
  asset: Asset;
  statusRecords: StatusRecord[];
  onEdit: (asset: Asset) => void;
  onViewDetails: (asset: Asset) => void;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
}

// This is now just a re-export of the refactored component
export default function AssetRowWrapper(props: AssetRowProps) {
  return <AssetRow {...props} />;
}
