import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import Layout from "@/components/Layout";
import { Mail, Users, TrendingUp, RefreshCw, Search, Download, AlertTriangle } from "lucide-react";

interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string;
  active: boolean;
  subscribed_at: string;
  source: string;
  origin: string;
  user_type: string;
  mailrelay_id?: string;
  synced_at?: string;
  last_sync_error?: string;
}

interface SyncLog {
  id: string;
  operation_type: string;
  operation: string;
  status: string;
  error_message?: string;
  created_at: string;
  processed_at?: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    synced: 0,
    errors: 0
  });

  const { isAdmin, loading } = useUserRoles();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && isAdmin()) {
      loadData();
    }
  }, [loading, isAdmin]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar assinantes
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (subscribersError) throw subscribersError;

      setSubscribers(subscribersData || []);

      // Calcular estatísticas
      const total = subscribersData?.length || 0;
      const active = subscribersData?.filter(s => s.active).length || 0;
      const synced = subscribersData?.filter(s => s.mailrelay_id).length || 0;
      const errors = subscribersData?.filter(s => s.last_sync_error).length || 0;

      setStats({ total, active, synced, errors });

      // Carregar logs de sincronização
      const { data: logsData, error: logsError } = await supabase
        .from('mailrelay_sync_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setSyncLogs(logsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da newsletter.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncWithMailRelay = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('mailrelay-sync', {
        body: { batch_sync: true }
      });
      
      if (error) throw error;

      toast({
        title: "Sincronização iniciada",
        description: `Processando ${data?.processed || 0} operações pendentes.`,
      });

      // Recarregar dados após sincronização
      setTimeout(() => {
        loadData();
      }, 2000);

    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: error?.message || "Erro ao sincronizar com MailRelay.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const exportSubscribers = () => {
    const csvContent = [
      ['Nome', 'Email', 'Status', 'Data de Inscrição', 'Origem', 'Tipo de Usuário'].join(','),
      ...subscribers
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   s.email.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(s => [
          s.name,
          s.email,
          s.active ? 'Ativo' : 'Inativo',
          new Date(s.subscribed_at).toLocaleDateString('pt-BR'),
          s.origin,
          s.user_type
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Layout><div>Carregando...</div></Layout>;
  }

  if (!isAdmin()) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Newsletter</h1>
            <p className="text-muted-foreground">
              Administre assinantes e sincronização com MailRelay
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleSyncWithMailRelay} 
              disabled={isSyncing}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar MailRelay
            </Button>
            <Button onClick={exportSubscribers} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Assinantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.active / stats.total) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.synced}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.synced / stats.total) * 100).toFixed(1)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erros de Sync</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.errors}</div>
              <p className="text-xs text-muted-foreground">
                Requerem atenção
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Assinantes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assinantes da Newsletter</CardTitle>
                <CardDescription>
                  Lista completa de assinantes e status de sincronização
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data Inscrição</TableHead>
                  <TableHead>MailRelay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      {subscriber.name}
                    </TableCell>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>
                      <Badge variant={subscriber.active ? "default" : "secondary"}>
                        {subscriber.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscriber.user_type}</Badge>
                    </TableCell>
                    <TableCell>{subscriber.origin}</TableCell>
                    <TableCell>
                      {new Date(subscriber.subscribed_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {subscriber.mailrelay_id ? (
                        <Badge variant="default">Sincronizado</Badge>
                      ) : subscriber.last_sync_error ? (
                        <Badge variant="destructive">Erro</Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Logs de Sincronização */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Sincronização MailRelay</CardTitle>
            <CardDescription>
              Últimas operações de sincronização com MailRelay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.operation_type}</Badge>
                    </TableCell>
                    <TableCell>{log.operation}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          log.status === 'success' ? 'default' : 
                          log.status === 'error' ? 'destructive' : 'secondary'
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.error_message || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}