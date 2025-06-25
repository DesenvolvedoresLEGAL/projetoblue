import React, { useState, useEffect } from "react";
import { useAssets } from "@/context/AssetContext";
import { Asset } from "@/types/asset";
import { 
  Dialog,
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AssetDialogHeader from "./parts/AssetDialogHeader";
import ChipForm from "./forms/ChipForm";
import RouterForm from "./forms/RouterForm";
import { useAssetFormValidation } from "../../hooks/useAssetFormValidation";

interface EditAssetDialogProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditAssetDialog = ({ asset, isOpen, onClose }: EditAssetDialogProps) => {
  const { updateAsset } = useAssets();
  const { errors, validateChipData, validateRouterData } = useAssetFormValidation();
  
  const [chipData, setChipData] = useState({
    iccid: "",
    phoneNumber: "",
    carrier: "",
  });
  
  const [routerData, setRouterData] = useState({
    uniqueId: "",
    brand: "",
    model: "",
    ssid: "",
    password: "",
    ipAddress: "",
    adminUser: "",
    adminPassword: "",
    imei: "",
    serialNumber: "",
  });
  
  // Reset form data when the asset changes
  useEffect(() => {
    if (!asset) return;
    
    if (asset.type === "CHIP") {
      const chipAsset = asset;
      setChipData({
        iccid: chipAsset.iccid,
        phoneNumber: chipAsset.phoneNumber,
        carrier: chipAsset.carrier,
      });
    } else {
      const routerAsset = asset;
      setRouterData({
        uniqueId: routerAsset.uniqueId,
        brand: routerAsset.brand,
        model: routerAsset.model,
        ssid: routerAsset.ssid,
        password: routerAsset.password,
        ipAddress: routerAsset.ipAddress || "",
        adminUser: routerAsset.adminUser || "",
        adminPassword: routerAsset.adminPassword || "",
        imei: routerAsset.imei || "",
        serialNumber: routerAsset.serialNumber || "",
      });
    }
  }, [asset]);
  
  if (!asset) return null;
  
  const handleSave = () => {
    if (asset.type === "CHIP") {
      if (validateChipData(chipData)) {
        updateAsset(asset.id, chipData);
        onClose();
      }
    } else {
      if (validateRouterData(routerData)) {
        updateAsset(asset.id, routerData);
        onClose();
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <AssetDialogHeader asset={asset} />
        
        {asset.type === "CHIP" ? (
          <ChipForm 
            chipData={chipData} 
            setChipData={setChipData}
            errors={errors}
          />
        ) : (
          <RouterForm 
            routerData={routerData}
            setRouterData={setRouterData}
            errors={errors}
          />
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssetDialog;
