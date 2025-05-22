
import { assetQueries } from './queries';
import { assetMutations } from './mutations';

// Combine queries and mutations into a single service object
const assetService = {
  ...assetQueries,
  ...assetMutations,
  assetQueries  // Explicitly add the assetQueries object for direct access
};

export { assetQueries };
export { assetMutations };
export default assetService;
