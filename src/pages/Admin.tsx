import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  UserPlus, 
  CheckCircle, 
  Settings,
  FileText,
  UserCog,
  Store,
  Crown,
  BarChart3
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserRoles();
  const { stats, loading: statsLoading, isAdmin } = useAdminPermissions();

  useEffect(() => {
    if (!profileLoading && !isAdmin) {
      navigate("/");
    }
  }, [profileLoading, isAdmin, navigate]);

  if (profileLoading || statsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando painel administrativo...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const quickActions = [
    {
      title: "Gerenciar Usuários",
      description: "Controle de permissões e roles",
      icon: Users,
      href: "/admin/usuarios",
      color: "bg-blue-500"
    },
    {
      title: "Editor de Blog",
      description: "Criar e publicar posts",
      icon: FileText,
      href: "/admin/blog",
      color: "bg-green-500"
    },
    {
      title: "Negócios",
      description: "Gestão do diretório",
      icon: Building2,
      href: "/admin/negocios",
      color: "bg-purple-500"
    },
    {
      title: "Embaixadoras",
      description: "Controle de comissões",
      icon: Crown,
      href: "/admin/embaixadoras",
      color: "bg-amber-500"
    },
    {
      title: "Comunidade",
      description: "Gestão de grupos",
      icon: UserCog,
      href: "/admin/comunidade",
      color: "bg-pink-500"
    },
    {
      title: "Configurações",
      description: "Configurações do sistema",
      icon: Settings,
      href: "/admin/configuracoes",
      color: "bg-gray-500"
    }
  ];

  return (
    <Layout>
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo(a), {profile?.full_name || profile?.email}
              </p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Settings className="w-4 h-4 mr-1" />
              Administrador
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <UserPlus className="inline w-3 h-3 mr-1" />
                +{stats?.newUsersThisMonth || 0} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negócios Ativos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBusinesses || 0}</div>
              <p className="text-xs text-muted-foreground">
                No diretório
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                <CheckCircle className="inline w-3 h-3 mr-1 text-green-500" />
                Ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats?.totalRevenue?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                <BarChart3 className="inline w-3 h-3 mr-1" />
                Processados
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Ações Rápidas */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.href} className="group cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <CardDescription>{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate(action.href)}
                      className="w-full group-hover:bg-primary/90"
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas ações administrativas realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Implementação de log de atividades em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}