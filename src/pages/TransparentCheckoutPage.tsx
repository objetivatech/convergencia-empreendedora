import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { TransparentCheckout } from '@/components/TransparentCheckout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  is_featured: boolean;
}

export default function TransparentCheckoutPage() {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const billingCycle = searchParams.get('cycle') as 'monthly' | 'yearly' || 'monthly';
  
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching plan:', error);
        navigate('/planos');
        return;
      }

      setPlan(data);
    } catch (error) {
      console.error('Error in fetchPlan:', error);
      navigate('/planos');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate('/dashboard', { 
      state: { message: 'Assinatura processada com sucesso! Aguarde a confirmação do pagamento.' }
    });
  };

  const handleCancel = () => {
    navigate('/planos');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Carregando informações do plano...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!plan) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Plano não encontrado</CardTitle>
              <CardDescription>
                O plano que você está tentando assinar não foi encontrado ou não está mais disponível.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/planos')} className="w-full">
                Ver Planos Disponíveis
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/planos')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Planos
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">Finalizar Assinatura</h1>
            <p className="text-muted-foreground mt-2">
              Complete seus dados para ativar o plano {plan.display_name}
            </p>
          </div>
        </div>

        {/* Checkout Component */}
        <TransparentCheckout
          type="subscription"
          planId={plan.id}
          planName={plan.display_name}
          billingCycle={billingCycle}
          totalValue={price}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}