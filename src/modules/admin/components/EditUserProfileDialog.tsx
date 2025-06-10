
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminUser, ProfileUpdateData } from '@/services/adminService';
import { useUpdateUserProfile } from '../hooks/useAdminUsers';

interface EditUserProfileDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditUserProfileDialog: React.FC<EditUserProfileDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState<ProfileUpdateData>({});
  const updateProfileMutation = useUpdateUserProfile();

  // Inicializar form quando o usuário mudar
  React.useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        is_active: user.is_active,
        is_approved: user.is_approved,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    // Verificar se houve mudanças
    const hasChanges = 
      formData.email !== user.email ||
      formData.is_active !== user.is_active ||
      formData.is_approved !== user.is_approved;
    
    if (!hasChanges) {
      onOpenChange(false);
      return;
    }
    
    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        profileData: formData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil do Usuário</DialogTitle>
          <DialogDescription>
            Altere os dados de <strong>{user.email}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="col-span-3"
              type="email"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_active" className="text-right">
              Usuário Ativo
            </Label>
            <div className="col-span-3">
              <Switch
                id="is_active"
                checked={formData.is_active || false}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="is_approved" className="text-right">
              Usuário Aprovado
            </Label>
            <div className="col-span-3">
              <Switch
                id="is_approved"
                checked={formData.is_approved || false}
                onCheckedChange={(checked) => handleInputChange('is_approved', checked)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={updateProfileMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
