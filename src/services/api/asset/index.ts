
import { assetQueries } from './queries';
import { assetMutations } from './mutations';

// Create the asset service object
const assetService = {
  ...assetQueries,
  ...assetMutations,
  assetQueries  // Explicitly add the assetQueries object for direct access
};

// Export the main assetService object as both default and named export
export { assetService };
export { assetQueries };
export { assetMutations };
export default assetService;
