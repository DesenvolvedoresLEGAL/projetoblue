import { InsufficientPermissions } from '@/components/auth/InsufficientPermissions';

const Unauthorized = () => (
  <InsufficientPermissions requiredRole="admin" />
);

export default Unauthorized;
