import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { 
  RefreshCw, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronLeft,
  Play,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SyncOperation {
  id: string;
  operation_type: string;
  entity_type: string;
  operation: string;
  status: string;
  request_data: any;
  response_data: any;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export default function AdminMailRelay() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [operations, setOperations] = useState<SyncOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    try {
      const { data, error } = await supabase
        .from('mailrelay_sync_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Error loading operations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as operações do MailRelay.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testMailRelay = async () => {
    setSyncLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-mailrelay');
      
      if (error) throw error;
      
      toast({
        title: "Teste do MailRelay",
        description: data.message || "Teste executado com sucesso.",
      });
      
      console.log('MailRelay test result:', data);
    } catch (error) {
      console.error('Error testing MailRelay:', error);
      toast({
        title: "Erro no Teste",
        description: "Falha ao testar a conexão com MailRelay.",
        variant: "destructive"
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const forceSyncPending = async () => {
    setSyncLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mailrelay-force-sync');
      
      if (error) throw error;
      
      toast({
        title: "Sincronização Forçada",
        description: data.message || "Sincronização executada com sucesso.",
      });
      
      // Recarregar operações após sincronização
      setTimeout(() => {
        loadOperations();
      }, 2000);
      
      console.log('Force sync result:', data);
    } catch (error) {
      console.error('Error force syncing:', error);
      toast({
        title: "Erro na Sincronização",
        description: "Falha ao executar sincronização forçada.",
        variant: "destructive"
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const pendingCount = operations.filter(op => op.status === 'pending').length;
  const completedCount = operations.filter(op => op.status === 'completed').length;
  const failedCount = operations.filter(op => op.status === 'failed').length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando dados do MailRelay...</p>
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
              <h1 className="text-3xl font-bold text-foreground">MailRelay Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Monitore e gerencie a sincronização com o MailRelay
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Ações rápidas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Ações Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={testMailRelay}
                disabled={syncLoading}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                Testar Conexão
              </Button>
              <Button 
                onClick={forceSyncPending}
                disabled={syncLoading || pendingCount === 0}
                variant="default"
              >
                <Play className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                Sincronizar Pendentes ({pendingCount})
              </Button>
              <Button 
                onClick={loadOperations}
                disabled={loading}
                variant="ghost"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{operations.length}</div>
              <p className="text-sm text-muted-foreground">Total de Operações</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <p className="text-sm text-muted-foreground">Falhas</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de operações */}
        <Card>
          <CardHeader>
            <CardTitle>Log de Sincronização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Operação</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Processado em</TableHead>
                    <TableHead>Erro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operations.map((operation) => (
                    <TableRow key={operation.id}>
                      <TableCell>
                        <div className={`flex items-center space-x-2 ${getStatusColor(operation.status)}`}>
                          {getStatusIcon(operation.status)}
                          <Badge 
                            variant={operation.status === 'completed' ? 'default' : 
                                   operation.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {operation.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {operation.operation} {operation.entity_type}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {operation.operation_type}
                        </div>
                      </TableCell>
                      <TableCell>
                        {operation.request_data?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(operation.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {operation.processed_at ? 
                          new Date(operation.processed_at).toLocaleString('pt-BR') : 
                          'Não processado'
                        }
                      </TableCell>
                      <TableCell>
                        {operation.error_message && (
                          <div className="text-sm text-red-600 max-w-xs truncate" title={operation.error_message}>
                            {operation.error_message}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {operations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhuma operação encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}