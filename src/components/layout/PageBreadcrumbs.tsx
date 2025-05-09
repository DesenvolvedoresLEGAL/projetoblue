
import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { generateBreadcrumbsFromPath } from "@/lib/navigation-helpers";

export function PageBreadcrumbs() {
  const location = useLocation();
  const breadcrumbs = generateBreadcrumbsFromPath(location.pathname);
  
  if (location.pathname === '/') return null;
  
  return (
    <Breadcrumb className="py-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link to="/" aria-label="Home">
            <Home className="h-4 w-4" />
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage aria-current="page">{crumb.label}</BreadcrumbPage>
              ) : (
                <Link to={crumb.path}>{crumb.label}</Link>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
