
import { useContext } from "react";
import { AssetProvider, useAssets as useAssetsContext } from "./AssetContext";

export const useAssets = useAssetsContext;
export { AssetProvider };
