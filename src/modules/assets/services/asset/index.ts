
import {
  getAssets,
  getAssetLogs,
  getStatus,
  getManufacturerById,
  getAssetById,
  getAssetsByStatus,
  getAssetsByType,
  getAssetsByMultipleStatus,
  listProblemAssets,
  statusByType
} from './queries';
import { createAsset, updateAsset, deleteAsset } from './mutations';
import { associationQueries } from './associationQueries';
import { AssetListParams, AssetCreateParams, AssetUpdateParams, AssetStatusByType, ProblemAsset } from './types';
import { PROBLEM_STATUS_IDS } from './constants';

// Export all types
export type {
  AssetListParams,
  AssetCreateParams,
  AssetUpdateParams,
  AssetStatusByType,
  ProblemAsset
};

// Export constants
export { PROBLEM_STATUS_IDS };

// Combine all asset service functionality
export const assetService = {
  // Queries
  getAssets,
  getAssetLogs,
  getStatus,
  getManufacturerById,
  getAssetById,
  getAssetsByStatus,
  getAssetsByType,
  getAssetsByMultipleStatus,
  listProblemAssets,
  statusByType,

  // Association queries
  checkActiveAssociations: associationQueries.checkActiveAssociations,

  // Mutations
  createAsset,
  updateAsset,
  deleteAsset
};

// Export as default and named export for backward compatibility
export default assetService;
