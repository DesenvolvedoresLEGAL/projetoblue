
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRole } from '@/types/auth';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { getRoleLabel } from '@/utils/roleUtils';

interface RoleSelectorProps {
  value?: UserRole;
  onValueChange: (value: UserRole) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione um role",
  disabled = false,
  className
}) => {
  const { assignableRoles } = useRolePermissions();

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {assignableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {getRoleLabel(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
