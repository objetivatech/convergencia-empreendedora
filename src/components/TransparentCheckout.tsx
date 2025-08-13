import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CreditCard, QrCode, FileText, Smartphone } from 'lucide-react';

interface TransparentCheckoutProps {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  planName: string;
  price: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TransparentCheckout = ({ 
  planId, 
  billingCycle, 
  planName, 
  price, 
  onSuccess, 
  onCancel 
}: TransparentCheckoutProps) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'DEBIT_CARD'>('PIX');
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: user?.email || '',
    cpfCnpj: '',
    phone: '',
    address: '',
    addressNumber: '',
    complement: '',
    province: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Faça login para continuar com a compra");
      return;
    }

    if (!customerData.name || !customerData.email || !customerData.cpfCnpj || !customerData.phone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planId,
          billingCycle,
          paymentMethod,
          customerData: {
            name: customerData.name,
            email: customerData.email,
            cpfCnpj: customerData.cpfCnpj,
            phone: customerData.phone,
            address: customerData.address,
            addressNumber: customerData.addressNumber,
            complement: customerData.complement,
            province: customerData.province,
            city: customerData.city,
            state: customerData.state,
            postalCode: customerData.postalCode
          }
        }
      });

      if (error) {
        console.error('Subscription error:', error);
        toast.error("Erro ao processar pagamento. Tente novamente.");
        return;
      }

      if (data?.success) {
        toast.success("Assinatura criada com sucesso!");
        
        if (paymentMethod === 'PIX' && data.pixQrCode) {
          // Mostrar QR code do PIX
          toast.info("Use o QR Code PIX para completar o pagamento");
        } else if (data.paymentUrl) {
          // Para cartão ou boleto, redirecionar para finalização
          window.open(data.paymentUrl, '_blank');
        }
        
        onSuccess?.();
      } else {
        toast.error("Erro ao processar pagamento");
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro interno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'PIX': return <QrCode className="h-5 w-5" />;
      case 'CREDIT_CARD': return <CreditCard className="h-5 w-5" />;
      case 'DEBIT_CARD': return <Smartphone className="h-5 w-5" />;
      case 'BOLETO': return <FileText className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Dados */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
            <CardDescription>Preencha suas informações para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
                <Input
                  id="cpfCnpj"
                  value={customerData.cpfCnpj}
                  onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={customerData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, Avenida..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="addressNumber">Número</Label>
                <Input
                  id="addressNumber"
                  value={customerData.addressNumber}
                  onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                  placeholder="123"
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={customerData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={customerData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo e Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
            <CardDescription>Confirme os detalhes da sua assinatura</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumo do Plano */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold text-lg">{planName}</h3>
              <p className="text-sm text-muted-foreground capitalize">
                Cobrança {billingCycle === 'monthly' ? 'mensal' : 'anual'}
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatPrice(price)}
              </p>
            </div>

            <Separator />

            {/* Método de Pagamento */}
            <div>
              <Label className="text-base font-semibold">Método de Pagamento</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="PIX" id="pix" />
                  <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                    {getPaymentIcon('PIX')}
                    PIX (Aprovação instantânea)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="CREDIT_CARD" id="credit" />
                  <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer flex-1">
                    {getPaymentIcon('CREDIT_CARD')}
                    Cartão de Crédito
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="DEBIT_CARD" id="debit" />
                  <Label htmlFor="debit" className="flex items-center gap-2 cursor-pointer flex-1">
                    {getPaymentIcon('DEBIT_CARD')}
                    Cartão de Débito
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="BOLETO" id="boleto" />
                  <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer flex-1">
                    {getPaymentIcon('BOLETO')}
                    Boleto Bancário
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* Botões */}
            <div className="space-y-3">
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Processando..." : `Finalizar Pagamento - ${formatPrice(price)}`}
              </Button>
              {onCancel && (
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};