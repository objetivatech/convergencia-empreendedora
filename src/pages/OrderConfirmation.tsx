import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Copy, ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const OrderConfirmation = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const orderData = location.state;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Código PIX copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!orderData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Pedido não encontrado</h1>
            <p className="text-muted-foreground mb-8">
              Não foi possível localizar os dados do seu pedido.
            </p>
            <Link to="/loja">
              <Button>
                Voltar para a Loja
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Pedido Confirmado!</h1>
            <p className="text-muted-foreground">
              Seu pedido foi criado com sucesso. Siga as instruções abaixo para finalizar o pagamento.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Detalhes do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID do Pedido</p>
                  <p className="font-mono">{orderData.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline">Aguardando Pagamento</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(orderData.totalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vencimento</p>
                  <p className="font-medium">{orderData.dueDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          {orderData.pixQrCode && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pagamento via PIX</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <img 
                    src={`data:image/png;base64,${orderData.pixQrCode}`}
                    alt="QR Code PIX"
                    className="mx-auto mb-4 border rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground mb-4">
                    Escaneie o QR Code com o app do seu banco ou copie o código abaixo:
                  </p>
                </div>
                
                {orderData.pixCopiaECola && (
                  <div className="relative">
                    <div className="bg-muted p-4 rounded-lg break-all text-sm">
                      {orderData.pixCopiaECola}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(orderData.pixCopiaECola)}
                      className="absolute top-2 right-2"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {orderData.bankSlipUrl && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pagamento via Boleto</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Clique no botão abaixo para baixar seu boleto bancário:
                </p>
                <a href={orderData.bankSlipUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Baixar Boleto
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {orderData.invoiceUrl && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Fatura Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Acesse sua fatura completa com todas as opções de pagamento:
                </p>
                <a href={orderData.invoiceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    Ver Fatura Completa
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• O pagamento será confirmado automaticamente após o processamento.</p>
              <p>• Você receberá um e-mail de confirmação quando o pagamento for aprovado.</p>
              <p>• Para produtos digitais, o acesso será liberado imediatamente após a confirmação.</p>
              <p>• Em caso de dúvidas, entre em contato conosco através do e-mail de suporte.</p>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4">
            <Link to="/loja" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continuar Comprando
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;