import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { 
  Search,
  Filter, 
  User, 
  Crown, 
  Edit, 
  Shield, 
  Mail, 
  Calendar,
  ChevronLeft,
  Plus,
  Trash2
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  roles: Database["public"]["Enums"]["user_role"][] | null;
  subscription_types: Database["public"]["Enums"]["subscription_type"][] | null;
  is_admin: boolean;
  can_edit_blog: boolean;
  onboarding_completed: boolean;
  newsletter_subscribed: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useUserRoles();
  const { isAdmin, updateUserRole, toggleAdminStatus, toggleBlogEditor } = useAdminPermissions();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!profileLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [profileLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por role
    if (roleFilter !== "all") {
      if (roleFilter === "admin") {
        filtered = filtered.filter(user => user.is_admin);
      } else if (roleFilter === "blog_editor") {
        filtered = filtered.filter(user => user.can_edit_blog);
      } else if (roleFilter === "no_roles") {
        filtered = filtered.filter(user => !user.roles || user.roles.length === 0);
      } else {
        filtered = filtered.filter(user => 
          user.roles?.includes(roleFilter as Database["public"]["Enums"]["user_role"])
        );
      }
    }

    setFilteredUsers(filtered);
  };

  const handleRoleToggle = async (userId: string, role: Database["public"]["Enums"]["user_role"], hasRole: boolean) => {
    const success = await updateUserRole(userId, role, hasRole ? 'remove' : 'add');
    if (success) {
      toast({
        title: "Sucesso",
        description: `Role ${hasRole ? 'removida' : 'adicionada'} com sucesso.`,
      });
      loadUsers();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a role do usuário.",
        variant: "destructive"
      });
    }
  };

  const handleAdminToggle = async (userId: string, isCurrentlyAdmin: boolean) => {
    const success = await toggleAdminStatus(userId, !isCurrentlyAdmin);
    if (success) {
      toast({
        title: "Sucesso",
        description: `Status de administrador ${isCurrentlyAdmin ? 'removido' : 'concedido'} com sucesso.`,
      });
      loadUsers();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de administrador.",
        variant: "destructive"
      });
    }
  };

  const handleBlogEditorToggle = async (userId: string, canCurrentlyEdit: boolean) => {
    const success = await toggleBlogEditor(userId, !canCurrentlyEdit);
    if (success) {
      toast({
        title: "Sucesso",
        description: `Permissão de editor ${canCurrentlyEdit ? 'removida' : 'concedida'} com sucesso.`,
      });
      loadUsers();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a permissão de editor.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'customer': 'bg-blue-100 text-blue-800',
      'business_owner': 'bg-green-100 text-green-800',
      'ambassador': 'bg-purple-100 text-purple-800',
      'community_member': 'bg-pink-100 text-pink-800',
      'instructor': 'bg-orange-100 text-orange-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (profileLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando usuários...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin")}
              className="p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie permissões e roles dos usuários do sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar usuários</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por email ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <Label htmlFor="role-filter">Filtrar por role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as roles</SelectItem>
                    <SelectItem value="admin">Administradores</SelectItem>
                    <SelectItem value="blog_editor">Editores de Blog</SelectItem>
                    <SelectItem value="customer">Clientes</SelectItem>
                    <SelectItem value="business_owner">Donos de Negócio</SelectItem>
                    <SelectItem value="ambassador">Embaixadoras</SelectItem>
                    <SelectItem value="community_member">Membros da Comunidade</SelectItem>
                    <SelectItem value="instructor">Instrutores</SelectItem>
                    <SelectItem value="no_roles">Sem roles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-sm text-muted-foreground">Total de usuários</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{users.filter(u => u.is_admin).length}</div>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{users.filter(u => u.can_edit_blog).length}</div>
              <p className="text-sm text-muted-foreground">Editores de Blog</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredUsers.length}</div>
              <p className="text-sm text-muted-foreground">Resultados filtrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Permissões</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name || 'Nome não informado'}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <Badge key={role} className={getRoleBadgeColor(role)}>
                              {role}
                            </Badge>
                          )) || <span className="text-muted-foreground text-sm">Nenhuma role</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {user.is_admin && (
                            <Badge variant="destructive">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {user.can_edit_blog && (
                            <Badge variant="secondary">
                              <Edit className="w-3 h-3 mr-1" />
                              Editor
                            </Badge>
                          )}
                          {user.newsletter_subscribed && (
                            <Badge variant="outline">
                              <Mail className="w-3 h-3 mr-1" />
                              Newsletter
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Gerenciar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Gerenciar Usuário: {selectedUser?.email}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedUser && (
                              <div className="space-y-6">
                                {/* Informações Básicas */}
                                <div>
                                  <h3 className="text-lg font-medium mb-3">Informações Básicas</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Nome:</span>
                                      <p>{selectedUser.full_name || 'Não informado'}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Email:</span>
                                      <p>{selectedUser.email}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Telefone:</span>
                                      <p>{selectedUser.phone || 'Não informado'}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Cadastro:</span>
                                      <p>{new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Permissões Administrativas */}
                                <div>
                                  <h3 className="text-lg font-medium mb-3">Permissões Administrativas</h3>
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <Label htmlFor="admin-toggle">Administrador</Label>
                                        <p className="text-sm text-muted-foreground">
                                          Acesso completo ao painel administrativo
                                        </p>
                                      </div>
                                      <Switch
                                        id="admin-toggle"
                                        checked={selectedUser.is_admin}
                                        onCheckedChange={(checked) => 
                                          handleAdminToggle(selectedUser.id, selectedUser.is_admin)
                                        }
                                      />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <Label htmlFor="blog-editor-toggle">Editor de Blog</Label>
                                        <p className="text-sm text-muted-foreground">
                                          Pode criar e editar posts do blog
                                        </p>
                                      </div>
                                      <Switch
                                        id="blog-editor-toggle"
                                        checked={selectedUser.can_edit_blog}
                                        onCheckedChange={(checked) => 
                                          handleBlogEditorToggle(selectedUser.id, selectedUser.can_edit_blog)
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Roles do Sistema */}
                                <div>
                                  <h3 className="text-lg font-medium mb-3">Roles do Sistema</h3>
                                  <div className="space-y-3">
                                    {(['customer', 'business_owner', 'ambassador', 'community_member'] as const).map((role) => {
                                      const hasRole = selectedUser.roles?.includes(role) || false;
                                      return (
                                        <div key={role} className="flex items-center justify-between">
                                          <div>
                                            <Label htmlFor={`role-${role}`}>
                                              {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                                            </Label>
                                          </div>
                                          <Switch
                                            id={`role-${role}`}
                                            checked={hasRole}
                                            onCheckedChange={() => handleRoleToggle(selectedUser.id, role, hasRole)}
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}