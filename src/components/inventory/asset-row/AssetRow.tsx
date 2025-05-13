
import { AssetDetails } from "./AssetDetails";
import { AssetActions } from "./AssetActions";
import { AssetTypeIndicator } from "./AssetTypeIndicator";
import { AssetStatusBadge } from "./AssetStatusBadge";
import type { Asset } from "@/types/asset";
import { memo } from "react";

interface AssetRowProps {
  asset: Asset;
  onSelect?: (asset: Asset) => void;
  selected?: boolean;
  actions?: boolean;
}

export const AssetRow = memo(function AssetRow({ 
  asset, 
  onSelect, 
  selected = false,
  actions = true
}: AssetRowProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(asset);
    }
  };

  return (
    <div 
      className={`
        flex flex-col sm:flex-row items-start sm:items-center justify-between 
        p-4 border-b border-border
        ${selected ? 'bg-accent/10' : 'hover:bg-muted/50 dark:hover:bg-muted/10'} 
        transition-colors cursor-pointer group
      `}
      onClick={handleClick}
      role="row"
      aria-selected={selected}
    >
      <div className="flex items-center space-x-3 flex-grow">
        <AssetTypeIndicator type={asset.assetType} />
        <AssetDetails asset={asset} />
      </div>
      
      <div className="flex items-center mt-3 sm:mt-0 ml-0 sm:ml-2 space-x-4 self-start sm:self-center">
        <AssetStatusBadge status={asset.status} />
        {actions && <AssetActions asset={asset} />}
      </div>
    </div>
  );
});
