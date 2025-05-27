
interface Breadcrumb {
  label: string;
  path: string;
}

const pathLabels: Record<string, string> = {
  'inventory': 'Inventory',
  'dashboard': 'Dashboard',
  'assets': 'Assets',
  'customers': 'Customers',
  'suppliers': 'Suppliers',
  'subscriptions': 'Subscriptions',
  'monitoring': 'Monitoring',
  'active': 'Active',
  'history': 'History',
  'tools': 'Tools',
  'register-asset': 'Register Asset',
  'associate-assets': 'Associate Assets',
  'data-usage': 'Data Usage',
  'wifi-analyzer': 'WiFi Analyzer'
};

export function generateBreadcrumbsFromPath(path: string): Breadcrumb[] {
  // Skip for the homepage
  if (path === '/') return [];

  // Split the path by "/"
  const segments = path.split('/').filter(segment => segment);
  const breadcrumbs: Breadcrumb[] = [];
  let currentPath = '';

  // Build breadcrumbs for each path segment
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Use predefined label if available, otherwise capitalize
    const label = pathLabels[segment] || 
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    breadcrumbs.push({
      label,
      path: currentPath
    });
  });

  return breadcrumbs;
}
