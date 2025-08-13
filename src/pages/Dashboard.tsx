import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            Escolha o dashboard que deseja acessar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dashboard-negocio")}>
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
              <Button className="w-full">
                Acessar Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dashboard-embaixadora")}>
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
              <Button className="w-full">
                Acessar Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/loja")}>
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
              <Button className="w-full">
                Ver Compras
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vinda de volta!</CardTitle>
              <CardDescription>
                Você está logada como: {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <h3 className="font-semibold">Negócios</h3>
                  <p className="text-sm text-muted-foreground">Gerencie sua presença no diretório</p>
                </div>
                <div>
                  <h3 className="font-semibold">Embaixadora</h3>
                  <p className="text-sm text-muted-foreground">Ganhe comissões com vendas</p>
                </div>
                <div>
                  <h3 className="font-semibold">Compras</h3>
                  <p className="text-sm text-muted-foreground">Produtos e serviços adquiridos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}