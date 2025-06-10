
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, UserCog, Trash2, Edit } from 'lucide-react';
import { AdminUser } from '@/services/adminService';
import { UserRole } from '@/types/auth';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/auth';
import { formatDate } from '@/utils/formatDate';
import { DeleteUserDialog } from './DeleteUserDialog';
import { EditUserRoleDialog } from './EditUserRoleDialog';
import { EditUserProfileDialog } from './EditUserProfileDialog';

interface UsersListProps {
  users: AdminUser[];
  isLoading: boolean;
}

export const UsersList: React.FC<UsersListProps> = ({ users, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleEditRole = (user: AdminUser) => {
    setSelectedUser(user);
    setEditRoleDialogOpen(true);
  };

  const handleEditProfile = (user: AdminUser) => {
    setSelectedUser(user);
    setEditProfileDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os cargos</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="gestor">Gestor</SelectItem>
            <SelectItem value="consultor">Consultor</SelectItem>
            <SelectItem value="suporte">Suporte</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Último Login</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {user.is_approved && (
                        <Badge variant="outline">Aprovado</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProfile(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRole(user)}
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resultado da busca */}
      {filteredUsers.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredUsers.length} de {users.length} usuários
        </div>
      )}

      {/* Diálogos */}
      <DeleteUserDialog
        user={selectedUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
      
      <EditUserRoleDialog
        user={selectedUser}
        open={editRoleDialogOpen}
        onOpenChange={setEditRoleDialogOpen}
      />
      
      <EditUserProfileDialog
        user={selectedUser}
        open={editProfileDialogOpen}
        onOpenChange={setEditProfileDialogOpen}
      />
    </div>
  );
};
