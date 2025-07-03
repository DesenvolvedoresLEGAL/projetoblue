
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { toast } from '@/utils/toast';
import { UserRole } from '@/types/auth';
import { formatDateForDisplay, formatDateTimeForDisplay } from '@/utils/dateUtils';
import { getRoleLabel } from '@/utils/roleUtils';

interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_login: string;
  is_active: boolean;
  is_approved: boolean;
  deleted_at?: string;
}

const roles: UserRole[] = ['user', 'cliente', 'suporte', 'admin'];

const AdminConfig = () => {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formState, setFormState] = useState({ email: '', role: 'user' as UserRole });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role, created_at, last_login, is_active, is_approved, deleted_at')
        .is('deleted_at', null); // Só mostra usuários não excluídos
      if (error) throw error;
      return data as Profile[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (user: Profile) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          email: user.email, 
          role: user.role,
          is_active: user.is_active,
          is_approved: user.is_approved
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Falha ao atualizar usuário')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Usar a função admin_delete_user que faz soft delete e desativa o usuário
      const { data, error } = await supabase.rpc('admin_delete_user', {
        user_id: id
      });
      
      if (error) {
        if (import.meta.env.DEV) console.error('Erro ao excluir usuário:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success('Usuário excluído com sucesso');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: unknown) => {
      if (import.meta.env.DEV) console.error('Erro na mutation de exclusão:', error);
      const errorMessage = error?.message || 'Erro ao excluir usuário';
      toast.error(errorMessage);
    }
  });

  const openEdit = (user: Profile) => {
    setFormState({ 
      email: user.email, 
      role: user.role
    });
    setEditingUser(user);
  };

  const handleSave = () => {
    if (!editingUser) return;
    
    const updatedUser = { 
      ...editingUser, 
      ...formState,
      // Manter valores atuais de is_active e is_approved se não foram alterados
      is_active: editingUser.is_active,
      is_approved: editingUser.is_approved
    };
    
    updateMutation.mutate(updatedUser);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (import.meta.env.DEV) console.log(`Excluindo usuário: ${user.email} (ID: ${userId})`);
    deleteMutation.mutate(userId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações de Administrador</h1>
        <p className="text-muted-foreground">Gerencie contas de usuários</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{getRoleLabel(u.role)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      u.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                    {!u.is_approved && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pendente
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDateForDisplay(u.created_at)}</TableCell>
                <TableCell>{u.last_login ? formatDateTimeForDisplay(u.last_login) : 'Nunca'}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(u)} disabled={updateMutation.isPending}>
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o usuário "{u.email}"? 
                          Esta ação irá desativar a conta e impedir o acesso do usuário ao sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isLoading && <p className="p-4">Carregando usuários...</p>}
      </div>

      <Dialog open={!!editingUser} onOpenChange={val => !val && setEditingUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Email"
              value={formState.email}
              onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
            />
            <Select value={formState.role} onValueChange={v => setFormState(s => ({ ...s, role: v as UserRole }))}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r} value={r}>{getRoleLabel(r)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={updateMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminConfig;
