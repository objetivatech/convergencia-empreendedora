import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Eye, DollarSign, Users, TrendingUp, Settings } from "lucide-react";

interface AmbassadorData {
  id: string;
  referral_code: string;
  commission_rate: number;
  total_sales: number;
  total_earnings: number;
  link_clicks: number;
  active: boolean;
  asaas_split_config: any;
}

interface RecentSale {
  id: string;
  amount: number;
  commission_amount: number;
  created_at: string;
  product_name?: string;
}

export default function AmbassadorDashboard() {
  const navigate = useNavigate();
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [asaasWalletKey, setAsaasWalletKey] = useState("");

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      await loadAmbassadorData(user.id);
    } catch (error) {
      console.error("Error checking auth:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const loadAmbassadorData = async (userId: string) => {
    // Load ambassador data
    const { data: ambassadorData, error: ambassadorError } = await supabase
      .from("ambassadors")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (ambassadorError && ambassadorError.code !== "PGRST116") {
      throw ambassadorError;
    }

    if (!ambassadorData) {
      // Create ambassador record if doesn't exist
      const referralCode = `EMB${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      const { data: newAmbassador, error: createError } = await supabase
        .from("ambassadors")
        .insert({
          user_id: userId,
          referral_code: referralCode,
          commission_rate: 15.0
        })
        .select()
        .single();

      if (createError) throw createError;
      setAmbassador(newAmbassador);
    } else {
      setAmbassador(ambassadorData);
      if (ambassadorData.asaas_split_config && typeof ambassadorData.asaas_split_config === 'object' && 'wallet_id' in ambassadorData.asaas_split_config) {
        setAsaasWalletKey(ambassadorData.asaas_split_config.wallet_id as string);
      }
    }

    // Load recent sales
    const { data: salesData, error: salesError } = await supabase
      .from("transactions")
      .select(`
        id,
        amount,
        commission_amount,
        created_at,
        product_id,
        products (name)
      `)
      .eq("ambassador_id", ambassadorData?.id || "")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    if (salesError) throw salesError;
    setRecentSales(salesData || []);
  };

  const copyReferralLink = () => {
    if (!ambassador) return;
    
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}?ref=${ambassador.referral_code}`;
    
    navigator.clipboard.writeText(referralLink);
    toast.success("Link copiado para a área de transferência!");
  };

  const updateAsaasSplit = async () => {
    if (!ambassador || !asaasWalletKey.trim()) return;

    try {
      const { error } = await supabase
        .from("ambassadors")
        .update({
          asaas_split_config: {
            wallet_id: asaasWalletKey.trim()
          }
        })
        .eq("id", ambassador.id);

      if (error) throw error;

      toast.success("Configuração ASAAS atualizada com sucesso!");
      setAmbassador({
        ...ambassador,
        asaas_split_config: { wallet_id: asaasWalletKey.trim() }
      });
    } catch (error) {
      console.error("Error updating ASAAS config:", error);
      toast.error("Erro ao atualizar configuração ASAAS");
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

  if (!ambassador) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar dados</h1>
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const referralLink = `${window.location.origin}?ref=${ambassador.referral_code}`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard Embaixadora</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas vendas e acompanhe seu desempenho
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <Badge variant={ambassador.active ? "default" : "secondary"} className="text-sm">
            {ambassador.active ? "Ativa" : "Inativa"}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ambassador.link_clicks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ambassador.total_sales}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {ambassador.total_earnings.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Comissão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ambassador.commission_rate}%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="link">Meu Link</TabsTrigger>
            <TabsTrigger value="sales">Vendas Recentes</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Performance</CardTitle>
                <CardDescription>
                  Acompanhe seu desempenho como embaixadora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Conversão de Cliques</span>
                    <span className="font-semibold">
                      {ambassador.link_clicks > 0 
                        ? ((ambassador.total_sales / ambassador.link_clicks) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Ticket Médio</span>
                    <span className="font-semibold">
                      R$ {ambassador.total_sales > 0 
                        ? (ambassador.total_earnings / ambassador.total_sales * (100 / ambassador.commission_rate)).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="link" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seu Link de Afiliação</CardTitle>
                <CardDescription>
                  Compartilhe este link para ganhar comissões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button onClick={copyReferralLink} size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Como usar seu link:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Compartilhe nas suas redes sociais</li>
                    <li>• Envie para contatos interessados</li>
                    <li>• Use em campanhas de marketing</li>
                    <li>• Ganhe 15% de comissão em cada venda</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendas Recentes</CardTitle>
                <CardDescription>
                  Suas últimas vendas e comissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentSales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma venda registrada ainda
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {sale.product_name || "Produto"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R$ {sale.amount.toFixed(2)}</p>
                          <p className="text-sm text-green-600">
                            Comissão: R$ {sale.commission_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações ASAAS
                </CardTitle>
                <CardDescription>
                  Configure sua chave de carteira ASAAS para recebimento automático de comissões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asaas-wallet">Chave da Carteira ASAAS</Label>
                  <Input
                    id="asaas-wallet"
                    value={asaasWalletKey}
                    onChange={(e) => setAsaasWalletKey(e.target.value)}
                    placeholder="Digite sua chave de carteira ASAAS"
                  />
                  <p className="text-sm text-muted-foreground">
                    Esta chave será usada para o split automático de pagamentos
                  </p>
                </div>
                <Button onClick={updateAsaasSplit}>
                  Salvar Configuração
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Código de Afiliação:</span>
                  <span className="font-mono">{ambassador.referral_code}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de Comissão:</span>
                  <span>{ambassador.commission_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={ambassador.active ? "default" : "secondary"}>
                    {ambassador.active ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}