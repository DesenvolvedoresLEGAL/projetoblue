
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/auth';
import { getRoleLabel, getRoleColors } from '@/utils/roleUtils';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
  showDescription?: boolean;
}

export const RoleBadge = ({ role, className, showDescription = false }: RoleBadgeProps) => {
  const label = getRoleLabel(role);
  const colors = getRoleColors(role);

  return (
    <Badge 
      variant="secondary" 
      className={cn(colors, className)}
      title={showDescription ? `Role: ${label}` : undefined}
    >
      {label}
    </Badge>
  );
};
