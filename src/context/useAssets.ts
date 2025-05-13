
import { useContext } from "react";
import { AssetContext } from "./AssetContext";

export const useAssets = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error("useAssets must be used within an AssetProvider");
  }
  return context;
};
