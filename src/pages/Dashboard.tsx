import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, ShoppingCart, TrendingUp, Crown, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, hasRole, addRole, loading: profileLoading } = useUserRoles();
  const [loading, setLoading] = useState(false);

  const becomeAmbassador = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      await addRole('ambassador');
      toast.success("Você agora é uma embaixadora! Acesse seu dashboard.");
    } catch (error) {
      console.error("Error becoming ambassador:", error);
      toast.error("Erro ao se tornar embaixadora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const becomeBusinessOwner = async () => {
    if (!user || !profile) return;
    
    setLoading(true);
    try {
      await addRole('business_owner');
      toast.success("Agora você pode gerenciar negócios! Acesse seu dashboard.");
    } catch (error) {
      console.error("Error becoming business owner:", error);
      toast.error("Erro ao se tornar dono de negócio. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-primary">Meus Dashboards</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vinda, {profile?.full_name || user?.email}! Escolha o dashboard que deseja acessar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Business Dashboard */}
          {hasRole('business_owner') ? (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Dashboard Negócio
                </CardTitle>
                <CardDescription>
                  Gerencie seu negócio no diretório
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/dashboard-negocio")}
                >
                  Acessar Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  Dashboard Negócio
                </CardTitle>
                <CardDescription>
                  Cadastre seu negócio e apareça no diretório
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate("/planos")}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Negócio
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Ambassador Dashboard */}
          {hasRole('ambassador') ? (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Dashboard Embaixadora
                </CardTitle>
                <CardDescription>
                  Acompanhe suas vendas e comissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/dashboard-embaixadora")}
                >
                  Acessar Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  Dashboard Embaixadora
                </CardTitle>
                <CardDescription>
                  Torne-se embaixadora e ganhe comissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={becomeAmbassador}
                  disabled={loading}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {loading ? "Processando..." : "Tornar-se Embaixadora"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Shop/Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Minhas Compras
              </CardTitle>
              <CardDescription>
                Histórico de pedidos e compras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => navigate("/loja")}
              >
                Ver Compras
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Seu Perfil</CardTitle>
              <CardDescription>
                Informações da sua conta e permissões ativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informações Pessoais</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nome:</strong> {profile?.full_name || "Não informado"}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Telefone:</strong> {profile?.phone || "Não informado"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Permissões Ativas</h3>
                  <div className="space-y-1 text-sm">
                    {profile?.roles?.map((role) => (
                      <span key={role} className="inline-block bg-primary/10 text-primary px-2 py-1 rounded mr-2 mb-1">
                        {role === 'customer' ? 'Cliente' : 
                         role === 'business_owner' ? 'Dono de Negócio' :
                         role === 'ambassador' ? 'Embaixadora' :
                         role === 'admin' ? 'Administrador' : role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}