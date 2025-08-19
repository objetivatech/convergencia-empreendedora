import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { BookOpen, UserCog } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isAdmin, canEditBlog, loading: profileLoading } = useUserRoles();

  if (profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vinda, {profile?.full_name || user?.email}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blog */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Blog Convergindo
              </CardTitle>
              <CardDescription>
                Acompanhe nossas publicações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate("/convergindo")}
              >
                Ver Blog
              </Button>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          {(isAdmin() || canEditBlog()) && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-primary" />
                  Painel Administrativo
                </CardTitle>
                <CardDescription>
                  Gerenciar conteúdo e usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/admin")}
                >
                  Acessar Admin
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Seu Perfil</CardTitle>
              <CardDescription>
                Informações da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {profile?.full_name || "Não informado"}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Telefone:</strong> {profile?.phone || "Não informado"}</p>
                {profile?.is_admin && (
                  <p><strong>Permissão:</strong> Administrador</p>
                )}
                {profile?.can_edit_blog && (
                  <p><strong>Permissão:</strong> Editor do Blog</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}