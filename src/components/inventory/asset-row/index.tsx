
import React, { useState } from "react";
import { Asset, StatusRecord } from "@/types/asset";
import { TableRow } from "@/components/ui/table";
import AssetTypeCell from "./AssetTypeCell";
import AssetIdentifierCell from "./AssetIdentifierCell";
import AssetDetailsCell from "./AssetDetailsCell";
import AssetDateCell from "./AssetDateCell";
import AssetStatusCell from "./AssetStatusCell";
import AssetActionsCell from "./AssetActionsCell";

interface AssetRowProps {
  asset: Asset;
  statusRecords: StatusRecord[];
  onEdit: (asset: Asset) => void;
  onViewDetails: (asset: Asset) => void;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
}

const AssetRow = ({
  asset,
  statusRecords,
  onEdit,
  onViewDetails,
  updateAsset,
  deleteAsset,
}: AssetRowProps) => {
  return (
    <TableRow 
      key={asset.id}
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => onViewDetails(asset)}
    >
      <AssetTypeCell type={asset.type} />
      <AssetIdentifierCell asset={asset} />
      <AssetDetailsCell asset={asset} />
      <AssetDateCell date={asset.registrationDate} />
      <AssetStatusCell status={asset.status} />
      <AssetActionsCell
        asset={asset}
        onEdit={onEdit}
        updateAsset={updateAsset}
        deleteAsset={deleteAsset}
      />
    </TableRow>
  );
};

export default AssetRow;
