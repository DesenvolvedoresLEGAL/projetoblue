// Minimal asset utilities to replace deleted file
export const getAssetTypeString = (asset: any): string => {
  return String(asset?.solution || asset?.type || 'Unknown');
};

export const getAssetStatusString = (asset: any): string => {
  return String(asset?.status || 'Unknown');
};

export const getManufacturerName = (asset: any): string => {
  return String(asset?.manufacturer?.name || 'Unknown');
};

export const isSameStatus = (status1: any, status2: any): boolean => {
  return String(status1) === String(status2);
};

export const SOLUTION_IDS = {
  CHIP: 11,
  SPEEDY: 1
};

export const normalizeAsset = (asset: any) => asset;

export const getAssetIdentifier = (asset: any): string => {
  return asset?.uuid || asset?.id || '';
};