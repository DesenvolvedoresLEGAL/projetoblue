
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminUser } from '@/services/adminService';
import { UserRole } from '@/types/auth';
import { useUpdateUserRole } from '../hooks/useAdminUsers';
import { ROLE_LABELS } from '@/constants/auth';

interface EditUserRoleDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const USER_ROLES: UserRole[] = ['admin', 'suporte', 'cliente', 'user'];

export const EditUserRoleDialog: React.FC<EditUserRoleDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const updateRoleMutation = useUpdateUserRole();

  // Atualizar role selecionado quando o usuário mudar
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || selectedRole === user.role) {
      onOpenChange(false);
      return;
    }
    
    try {
      await updateRoleMutation.mutateAsync({
        userId: user.id,
        role: selectedRole,
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError
      console.error('Erro ao atualizar role:', error);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Cargo do Usuário</DialogTitle>
          <DialogDescription>
            Altere o cargo de <strong>{user.email}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Cargo
            </Label>
            <div className="col-span-3">
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={updateRoleMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateRoleMutation.isPending || selectedRole === user.role}
          >
            {updateRoleMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
