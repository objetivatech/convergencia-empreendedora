import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, CreditCard, Smartphone, FileText, QrCode, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface TransparentCheckoutProps {
  // Tipo de transação
  type: 'subscription' | 'product' | 'donation' | 'community';
  
  // Para assinaturas
  planId?: string;
  planName?: string;
  billingCycle?: 'monthly' | 'yearly';
  
  // Para produtos
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  
  // Para doações
  donationAmount?: number;
  
  // Valor total (calculado automaticamente ou fornecido)
  totalValue?: number;
  
  // Callbacks
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

interface CustomerData {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

interface CardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export function TransparentCheckout({
  type,
  planId,
  planName,
  billingCycle = 'monthly',
  items = [],
  donationAmount,
  totalValue,
  onSuccess,
  onCancel,
  onError,
}: TransparentCheckoutProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO'>('PIX');
  const [step, setStep] = useState<'customer-data' | 'payment-method' | 'card-data' | 'processing' | 'result'>('customer-data');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: user?.email || '',
    cpfCnpj: '',
    phone: '',
    address: {
      street: '',
      number: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });

  const [cardData, setCardData] = useState<CardData>({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });

  // Calcular valor total
  const calculateTotalValue = (): number => {
    if (totalValue) return totalValue;
    if (donationAmount) return donationAmount;
    if (items.length > 0) {
      return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    return 0;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handleCustomerDataSubmit = () => {
    // Validar dados básicos
    if (!customerData.name || !customerData.email || !customerData.cpfCnpj) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setStep('payment-method');
  };

  const handlePaymentMethodSubmit = () => {
    if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
      setStep('card-data');
    } else {
      processPayment();
    }
  };

  const handleCardDataSubmit = () => {
    // Validar dados do cartão
    if (!cardData.holderName || !cardData.number || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
      toast.error('Por favor, preencha todos os dados do cartão');
      return;
    }

    processPayment();
  };

  const processPayment = async () => {
    setLoading(true);
    setStep('processing');

    try {
      const paymentData: any = {
        type,
        paymentMethod,
        customerData,
      };

      // Adicionar dados específicos do tipo
      switch (type) {
        case 'subscription':
          paymentData.planId = planId;
          paymentData.billingCycle = billingCycle;
          break;
        case 'product':
          paymentData.items = items;
          break;
        case 'donation':
          paymentData.amount = donationAmount;
          break;
        case 'community':
          paymentData.amount = calculateTotalValue();
          break;
      }

      // Adicionar dados do cartão se necessário
      if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
        paymentData.cardData = cardData;
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: paymentData,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      setPaymentResult(data);
      setStep('result');

      if (onSuccess) {
        onSuccess(data);
      }

    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(`Erro ao processar pagamento: ${error.message}`);
      
      if (onError) {
        onError(error.message);
      }
      
      setStep('payment-method'); // Voltar para seleção de método
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'PIX':
        return <QrCode className="h-5 w-5" />;
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCard className="h-5 w-5" />;
      case 'BOLETO':
        return <FileText className="h-5 w-5" />;
      default:
        return <Smartphone className="h-5 w-5" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'customer-data':
        return 'Dados do Cliente';
      case 'payment-method':
        return 'Método de Pagamento';
      case 'card-data':
        return 'Dados do Cartão';
      case 'processing':
        return 'Processando Pagamento';
      case 'result':
        return 'Pagamento Iniciado';
      default:
        return 'Checkout';
    }
  };

  const renderCustomerDataStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            value={customerData.name}
            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={customerData.email}
            onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
            placeholder="seu@email.com"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
          <Input
            id="cpfCnpj"
            value={customerData.cpfCnpj}
            onChange={(e) => setCustomerData({ ...customerData, cpfCnpj: e.target.value })}
            placeholder="000.000.000-00"
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={customerData.phone}
            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <Separator />
      
      <h3 className="font-medium">Endereço (Opcional)</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Label htmlFor="street">Rua</Label>
          <Input
            id="street"
            value={customerData.address.street}
            onChange={(e) => setCustomerData({
              ...customerData,
              address: { ...customerData.address, street: e.target.value }
            })}
            placeholder="Nome da rua"
          />
        </div>
        <div>
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            value={customerData.address.number}
            onChange={(e) => setCustomerData({
              ...customerData,
              address: { ...customerData.address, number: e.target.value }
            })}
            placeholder="123"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={customerData.address.city}
            onChange={(e) => setCustomerData({
              ...customerData,
              address: { ...customerData.address, city: e.target.value }
            })}
            placeholder="Sua cidade"
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={customerData.address.state}
            onChange={(e) => setCustomerData({
              ...customerData,
              address: { ...customerData.address, state: e.target.value }
            })}
            placeholder="SP"
          />
        </div>
        <div>
          <Label htmlFor="postalCode">CEP</Label>
          <Input
            id="postalCode"
            value={customerData.address.postalCode}
            onChange={(e) => setCustomerData({
              ...customerData,
              address: { ...customerData.address, postalCode: e.target.value }
            })}
            placeholder="00000-000"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentMethodStep = () => (
    <div className="space-y-6">
      <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
        <div className="grid grid-cols-2 gap-4">
          <Label htmlFor="pix" className="cursor-pointer">
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
              <RadioGroupItem value="PIX" id="pix" />
              <QrCode className="h-5 w-5" />
              <div>
                <div className="font-medium">PIX</div>
                <div className="text-sm text-muted-foreground">Aprovação instantânea</div>
              </div>
            </div>
          </Label>
          
          <Label htmlFor="credit" className="cursor-pointer">
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
              <RadioGroupItem value="CREDIT_CARD" id="credit" />
              <CreditCard className="h-5 w-5" />
              <div>
                <div className="font-medium">Cartão de Crédito</div>
                <div className="text-sm text-muted-foreground">À vista ou parcelado</div>
              </div>
            </div>
          </Label>
          
          <Label htmlFor="debit" className="cursor-pointer">
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
              <RadioGroupItem value="DEBIT_CARD" id="debit" />
              <CreditCard className="h-5 w-5" />
              <div>
                <div className="font-medium">Cartão de Débito</div>
                <div className="text-sm text-muted-foreground">Desconto direto da conta</div>
              </div>
            </div>
          </Label>
          
          <Label htmlFor="boleto" className="cursor-pointer">
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
              <RadioGroupItem value="BOLETO" id="boleto" />
              <FileText className="h-5 w-5" />
              <div>
                <div className="font-medium">Boleto</div>
                <div className="text-sm text-muted-foreground">Vence em 3 dias</div>
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  const renderCardDataStep = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="holderName">Nome no Cartão *</Label>
        <Input
          id="holderName"
          value={cardData.holderName}
          onChange={(e) => setCardData({ ...cardData, holderName: e.target.value })}
          placeholder="Nome como está no cartão"
        />
      </div>
      
      <div>
        <Label htmlFor="cardNumber">Número do Cartão *</Label>
        <Input
          id="cardNumber"
          value={cardData.number}
          onChange={(e) => setCardData({ ...cardData, number: e.target.value.replace(/\D/g, '') })}
          placeholder="0000 0000 0000 0000"
          maxLength={16}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="expiryMonth">Mês *</Label>
          <Input
            id="expiryMonth"
            value={cardData.expiryMonth}
            onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value })}
            placeholder="MM"
            maxLength={2}
          />
        </div>
        <div>
          <Label htmlFor="expiryYear">Ano *</Label>
          <Input
            id="expiryYear"
            value={cardData.expiryYear}
            onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value })}
            placeholder="AAAA"
            maxLength={4}
          />
        </div>
        <div>
          <Label htmlFor="ccv">CCV *</Label>
          <Input
            id="ccv"
            value={cardData.ccv}
            onChange={(e) => setCardData({ ...cardData, ccv: e.target.value })}
            placeholder="123"
            maxLength={4}
          />
        </div>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Processando Pagamento</h3>
      <p className="text-muted-foreground">Aguarde enquanto processamos seu pagamento...</p>
    </div>
  );

  const renderResultStep = () => {
    if (!paymentResult) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-green-600 mb-2">Pagamento Iniciado!</h3>
          <p className="text-muted-foreground">
            {paymentMethod === 'PIX' && 'Escaneie o QR Code ou copie o código PIX para finalizar o pagamento.'}
            {paymentMethod === 'BOLETO' && 'O boleto foi gerado. Clique no link abaixo para visualizar.'}
            {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && 'Seu pagamento está sendo processado.'}
          </p>
        </div>

        {paymentMethod === 'PIX' && paymentResult.pixQrCode && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-accent">
              <Label className="text-sm font-medium">Código PIX:</Label>
              <div className="mt-2 p-2 bg-background rounded text-xs font-mono break-all">
                {paymentResult.pixCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(paymentResult.pixCode);
                  toast.success('Código PIX copiado!');
                }}
              >
                Copiar Código PIX
              </Button>
            </div>
          </div>
        )}

        {paymentMethod === 'BOLETO' && paymentResult.boletoUrl && (
          <div className="text-center">
            <Button asChild>
              <a href={paymentResult.boletoUrl} target="_blank" rel="noopener noreferrer">
                Visualizar Boleto
              </a>
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>ID do Pagamento: {paymentResult.paymentId}</p>
          <p>Valor: {formatPrice(paymentResult.value)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {step !== 'customer-data' && step !== 'result' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (step === 'payment-method') setStep('customer-data');
                      if (step === 'card-data') setStep('payment-method');
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <div>
                  <CardTitle>{getStepTitle()}</CardTitle>
                  <CardDescription>
                    {step === 'customer-data' && 'Preencha seus dados para continuar'}
                    {step === 'payment-method' && 'Escolha como deseja pagar'}
                    {step === 'card-data' && 'Informe os dados do seu cartão'}
                    {step === 'processing' && 'Aguarde o processamento'}
                    {step === 'result' && 'Pagamento iniciado com sucesso'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {step === 'customer-data' && renderCustomerDataStep()}
              {step === 'payment-method' && renderPaymentMethodStep()}
              {step === 'card-data' && renderCardDataStep()}
              {step === 'processing' && renderProcessingStep()}
              {step === 'result' && renderResultStep()}
              
              {step !== 'processing' && step !== 'result' && (
                <div className="flex justify-between mt-6">
                  {onCancel && (
                    <Button variant="outline" onClick={onCancel}>
                      Cancelar
                    </Button>
                  )}
                  
                  <div className="flex gap-2 ml-auto">
                    {step === 'customer-data' && (
                      <Button onClick={handleCustomerDataSubmit}>
                        Continuar
                      </Button>
                    )}
                    
                    {step === 'payment-method' && (
                      <Button onClick={handlePaymentMethodSubmit}>
                        {paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD' 
                          ? 'Continuar' 
                          : 'Finalizar Pagamento'
                        }
                      </Button>
                    )}
                    
                    {step === 'card-data' && (
                      <Button onClick={handleCardDataSubmit} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Processando...
                          </>
                        ) : (
                          'Finalizar Pagamento'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {type === 'subscription' && planName && (
                <div>
                  <div className="font-medium">{planName}</div>
                  <div className="text-sm text-muted-foreground">
                    {billingCycle === 'yearly' ? 'Anual' : 'Mensal'}
                  </div>
                </div>
              )}
              
              {type === 'product' && items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                  </div>
                  <div>{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
              
              {type === 'donation' && (
                <div className="font-medium">Doação</div>
              )}
              
              {type === 'community' && (
                <div className="font-medium">Assinatura da Comunidade</div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(calculateTotalValue())}</span>
              </div>
              
              {step === 'payment-method' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getPaymentIcon(paymentMethod)}
                  <span>
                    {paymentMethod === 'PIX' && 'PIX'}
                    {paymentMethod === 'CREDIT_CARD' && 'Cartão de Crédito'}
                    {paymentMethod === 'DEBIT_CARD' && 'Cartão de Débito'}
                    {paymentMethod === 'BOLETO' && 'Boleto'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}