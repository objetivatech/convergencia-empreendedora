import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Star, Zap, Crown, ArrowLeft } from "lucide-react";
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export default function PlanSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'iniciante':
        return <Star className="h-5 w-5" />;
      case 'intermediario':
        return <Zap className="h-5 w-5" />;
      case 'master':
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const formatPrice = (monthlyPrice: number, yearlyPrice: number, features: any) => {
    if (isYearly) {
      return `R$ ${yearlyPrice.toFixed(2)}/ano`;
    } else {
      return `R$ ${monthlyPrice.toFixed(2)}/mês`;
    }
  };

  const getSemestralPrice = (features: any) => {
    return features?.semestral_price || 0;
  };

  const getFeaturesList = (features: any) => {
    const featureList = [];
    
    if (features.business_profiles) {
      featureList.push(`${features.business_profiles} ${features.business_profiles === 1 ? 'Perfil de Negócio exclusivo' : 'Perfis de Negócios exclusivos'} no site`);
    }
    
    if (features.priority_display) {
      featureList.push('Perfil com prioridade de exibição');
    }
    
    if (features.featured_display) {
      featureList.push('Perfil com exibição em destaque');
    }
    
    if (features.whatsapp_community) {
      featureList.push('Fazer parte da comunidade no WhatsApp');
    }
    
    if (features.recorded_content) {
      featureList.push('Acesso aos conteúdos gravados');
    }
    
    if (features.event_discount_percent) {
      featureList.push(`${features.event_discount_percent}% de Desconto em eventos Presenciais`);
    }
    
    if (features.course_info) {
      featureList.push('Informações sobre cursos e eventos na comunidade');
    }
    
    if (features.social_visibility) {
      featureList.push('Visibilidade e divulgação nas redes sociais');
    }
    
    if (features.mentoring_hours && features.mentoring_hours > 0) {
      featureList.push(`+${features.mentoring_hours}h de mentoria por mês`);
    }
    
    return featureList;
  };

  const handlePlanSelect = async (planId: string, billingCycle: 'monthly' | 'yearly' | 'semestral') => {
    try {
      console.log('Starting plan selection:', { planId, billingCycle });
      
      toast({
        title: "Processando...",
        description: "Criando sua assinatura...",
      });

      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          planId,
          billingCycle
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Erro na função do servidor');
      }

      if (data?.success && data?.paymentUrl) {
        toast({
          title: "Assinatura Criada!",
          description: "Redirecionando para o pagamento...",
        });
        
        // Abrir URL de pagamento em nova aba
        const paymentWindow = window.open(data.paymentUrl, '_blank');
        
        if (paymentWindow) {
          // Redirecionar para dashboard após um tempo
          setTimeout(() => {
            navigate('/dashboard-negocio');
          }, 2000);
        } else {
          // Se não conseguiu abrir a janela, redirecionar para o URL de pagamento
          window.location.href = data.paymentUrl;
        }
      } else {
        console.error('Invalid response data:', data);
        throw new Error(data?.error || 'Resposta inválida do servidor');
      }
      
    } catch (error: any) {
      console.error('Error selecting plan:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a assinatura. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="relative">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full mt-6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto p-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Escolha Seu Plano de Negócios</h1>
            <p className="text-muted-foreground mb-6">
              Selecione o plano que melhor atende às suas necessidades empresariais
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Label htmlFor="billing-toggle" className={!isYearly ? "font-semibold" : ""}>
                Mensal
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label htmlFor="billing-toggle" className={isYearly ? "font-semibold" : ""}>
                Anual
                <Badge variant="secondary" className="ml-2">Economize!</Badge>
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.is_featured ? 'border-primary shadow-md scale-105' : ''
              }`}
            >
              {plan.is_featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Mais Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  {getPlanIcon(plan.name)}
                  {plan.display_name}
                </CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">
                  {formatPrice(plan.price_monthly, plan.price_yearly, plan.features)}
                </CardDescription>
                {!isYearly && (
                  <p className="text-sm text-muted-foreground">
                    Semestral: R$ {getSemestralPrice(plan.features).toFixed(2)}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-6">
                  {getFeaturesList(plan.features).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Button
                    variant={plan.is_featured ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handlePlanSelect(plan.id, 'monthly')}
                  >
                    {plan.name === 'iniciante' ? 'Começar Agora' : 'Assinar Mensal'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handlePlanSelect(plan.id, 'semestral')}
                  >
                    Assinar Semestral (R$ {getSemestralPrice(plan.features).toFixed(2)})
                  </Button>
                  
                  {isYearly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handlePlanSelect(plan.id, 'yearly')}
                    >
                      Assinar Anual (Melhor Valor!)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem suporte completo e atualizações gratuitas
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Pagamentos processados com segurança via ASAAS
          </p>
        </div>
      </div>
    </div>
  );
}