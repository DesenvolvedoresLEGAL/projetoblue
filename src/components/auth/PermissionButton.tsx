
import { ButtonProps, Button } from '@/components/ui/button';
import { RoleGuard } from './RoleGuard';
import { UserRole } from '@/types/auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PermissionButtonProps extends ButtonProps {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  tooltip?: string;
}

export const PermissionButton = ({ 
  children, 
  requiredRole,
  allowedRoles,
  tooltip,
  ...buttonProps 
}: PermissionButtonProps) => {
  const buttonElement = (
    <RoleGuard 
      requiredRole={requiredRole} 
      allowedRoles={allowedRoles}
      fallback={
        tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button {...buttonProps} disabled className="opacity-50 cursor-not-allowed">
                  {children}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null
      }
    >
      <Button {...buttonProps}>
        {children}
      </Button>
    </RoleGuard>
  );

  return buttonElement;
};
