import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_featured: boolean;
  is_active: boolean;
}

interface PlanSelectorProps {
  currentPlan?: string;
  onPlanSelect: (planId: string) => void;
  businessId?: string;
}

const PlanSelector = ({ currentPlan, onPlanSelect, businessId }: PlanSelectorProps) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPlans((data || []).map(plan => ({
        ...plan,
        features: plan.features as Record<string, any>,
        limits: plan.limits as Record<string, any>
      })));
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar planos de assinatura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center bg-muted rounded-lg p-1">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !isYearly 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isYearly 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Anual
            <Badge variant="secondary" className="ml-2 text-xs">
              2 meses grátis
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name;
          const features = getFeaturesList(plan.features);
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.is_featured ? 'border-primary shadow-md scale-105' : ''
              } ${
                isCurrentPlan ? 'border-primary bg-primary/5' : ''
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
                  {isCurrentPlan && (
                    <Badge variant="secondary" className="ml-2">
                      Atual
                    </Badge>
                  )}
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
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={isCurrentPlan ? "secondary" : plan.is_featured ? "default" : "outline"}
                  className="w-full"
                  disabled={isCurrentPlan}
                  onClick={() => onPlanSelect(plan.id)}
                >
                  {isCurrentPlan 
                    ? 'Plano Atual' 
                    : plan.name === 'iniciante' 
                      ? 'Escolher Plano' 
                      : 'Escolher Plano'
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Todos os planos incluem suporte técnico e atualizações automáticas.</p>
        <p>Cancele a qualquer momento sem taxas de cancelamento.</p>
      </div>
    </div>
  );
};

export default PlanSelector;