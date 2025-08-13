import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, Building2 } from "lucide-react";
import { useCartStore } from "@/hooks/useCartStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    cpfCnpj: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    observations: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create payment via ASAAS Edge Function
      const { data, error } = await supabase.functions.invoke('create-asaas-payment', {
        body: {
          customer: customerData,
          items: items,
          paymentMethod: paymentMethod,
          totalValue: getTotalPrice(),
        }
      });

      if (error) throw error;

      if (data.success) {
        // Clear cart after successful payment creation
        clearCart();
        
        // Show success message
        toast({
          title: "Pedido criado com sucesso!",
          description: "Você será redirecionado para completar o pagamento.",
        });

        // Redirect to payment page or success page
        if (data.invoiceUrl) {
          window.open(data.invoiceUrl, '_blank');
        }
        
        navigate('/pedido-confirmado', { 
          state: { 
            orderId: data.orderId,
            paymentId: data.paymentId 
          } 
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Carrinho vazio</h1>
            <p className="text-muted-foreground mb-8">
              Adicione produtos ao carrinho antes de finalizar a compra.
            </p>
            <Button onClick={() => navigate('/loja')}>
              Ir para a Loja
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        required
                        value={customerData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={customerData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
                      <Input
                        id="cpfCnpj"
                        required
                        value={customerData.cpfCnpj}
                        onChange={(e) => handleInputChange("cpfCnpj", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        required
                        value={customerData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Endereço Completo</Label>
                    <Input
                      id="address"
                      value={customerData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={customerData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={customerData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">CEP</Label>
                      <Input
                        id="postalCode"
                        value={customerData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      type="button"
                      variant={paymentMethod === "pix" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("pix")}
                      className="h-16 flex-col gap-2"
                    >
                      <Banknote className="h-6 w-6" />
                      PIX
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "credit_card" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("credit_card")}
                      className="h-16 flex-col gap-2"
                    >
                      <CreditCard className="h-6 w-6" />
                      Cartão
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "boleto" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("boleto")}
                      className="h-16 flex-col gap-2"
                    >
                      <Building2 className="h-6 w-6" />
                      Boleto
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Observações sobre o pedido..."
                    value={customerData.observations}
                    onChange={(e) => handleInputChange("observations", e.target.value)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando..." : "Finalizar Pedido"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Pagamento seguro processado via ASAAS
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;