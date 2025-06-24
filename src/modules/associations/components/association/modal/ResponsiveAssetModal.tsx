
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MobileAssetModal } from './MobileAssetModal';
import { DesktopAssetModal } from './DesktopAssetModal';
import { SelectedAsset } from '@modules/associations/types';

interface ResponsiveAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  selectedAssets: SelectedAsset[];
  onAssetSelected: (asset: SelectedAsset) => void;
  onAssetRemoved?: (assetId: string) => void;
  excludeAssociatedToClient?: string;
  multipleSelection?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const ResponsiveAssetModal: React.FC<ResponsiveAssetModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileAssetModal {...props} />;
  }

  return <DesktopAssetModal {...props} />;
};
