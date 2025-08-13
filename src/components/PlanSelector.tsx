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
      case 'basic':
        return <Star className="h-5 w-5" />;
      case 'pro':
        return <Zap className="h-5 w-5" />;
      case 'premium':
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const formatPrice = (monthly: number, yearly: number) => {
    if (monthly === 0) return "Grátis";
    
    const price = isYearly ? yearly / 12 : monthly;
    const fullPrice = isYearly ? yearly : monthly;
    
    return (
      <div>
        <span className="text-3xl font-bold">R$ {price.toFixed(2)}</span>
        <span className="text-muted-foreground">/mês</span>
        {isYearly && (
          <div className="text-sm text-muted-foreground">
            R$ {fullPrice.toFixed(2)} cobrado anualmente
          </div>
        )}
      </div>
    );
  };

  const getFeaturesList = (features: Record<string, any>) => {
    const featureMap: Record<string, string> = {
      gallery_images: `${features.gallery_images} imagens na galeria`,
      featured_listing: features.featured_listing ? 'Listagem em destaque' : null,
      analytics: features.analytics === 'advanced' ? 'Analytics avançado' : 'Analytics básico',
      support: features.support === 'priority' ? 'Suporte prioritário' : 'Suporte da comunidade',
      custom_domain: features.custom_domain ? 'Domínio personalizado' : null,
      api_access: features.api_access ? 'Acesso à API' : null
    };

    return Object.entries(featureMap)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => ({ key, value: value as string }));
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
              className={`relative transition-all hover:shadow-lg ${
                plan.is_featured 
                  ? 'border-primary ring-2 ring-primary ring-opacity-50' 
                  : ''
              } ${
                isCurrentPlan 
                  ? 'border-primary bg-primary/5' 
                  : ''
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
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  {getPlanIcon(plan.name)}
                </div>
                
                <CardTitle className="flex items-center justify-center gap-2">
                  {plan.display_name}
                  {isCurrentPlan && (
                    <Badge variant="secondary" className="text-xs">
                      Atual
                    </Badge>
                  )}
                </CardTitle>
                
                <div className="py-4">
                  {formatPrice(plan.price_monthly, plan.price_yearly)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature.key} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature.value}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : plan.is_featured ? "default" : "outline"}
                  disabled={isCurrentPlan}
                  onClick={() => onPlanSelect(plan.id)}
                >
                  {isCurrentPlan 
                    ? 'Plano Atual' 
                    : plan.price_monthly === 0 
                      ? 'Começar Grátis' 
                      : 'Assinar Agora'
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