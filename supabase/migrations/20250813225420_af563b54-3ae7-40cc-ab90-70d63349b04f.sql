-- Criar tabela de planos de assinatura
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_quarterly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Política para todos verem os planos ativos
CREATE POLICY "Everyone can view active plans" ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Inserir os planos específicos
INSERT INTO public.subscription_plans (name, display_name, price_monthly, price_quarterly, price_yearly, features, limits, sort_order, is_featured) VALUES
(
  'iniciante',
  'Plano Iniciante',
  35.00,
  176.50,
  336.00,
  '{
    "business_profiles": 1,
    "whatsapp_community": true,
    "recorded_content": true,
    "event_discount_percent": 10,
    "course_info": true,
    "social_visibility": true,
    "mentoring_hours": 0
  }',
  '{
    "max_businesses": 1,
    "priority_display": false,
    "featured_display": false
  }',
  1,
  false
),
(
  'intermediario',
  'Plano Intermediário',
  75.00,
  378.00,
  720.00,
  '{
    "business_profiles": 1,
    "whatsapp_community": true,
    "recorded_content": true,
    "event_discount_percent": 15,
    "course_info": true,
    "social_visibility": true,
    "mentoring_hours": 1,
    "priority_display": true
  }',
  '{
    "max_businesses": 1,
    "priority_display": true,
    "featured_display": false
  }',
  2,
  true
),
(
  'master',
  'Plano Master',
  150.00,
  756.00,
  1440.00,
  '{
    "business_profiles": 2,
    "whatsapp_community": true,
    "recorded_content": true,
    "event_discount_percent": 20,
    "course_info": true,
    "social_visibility": true,
    "mentoring_hours": 2,
    "featured_display": true
  }',
  '{
    "max_businesses": 2,
    "priority_display": true,
    "featured_display": true
  }',
  3,
  false
);

-- Criar tabela de assinaturas de negócios
CREATE TABLE public.business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  payment_provider TEXT DEFAULT 'asaas',
  external_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para donos de negócios verem suas assinaturas
CREATE POLICY "Business owners can view their subscriptions" ON public.business_subscriptions
  FOR SELECT
  USING (business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  ));

-- Adicionar trigger para updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_business_subscriptions_updated_at
  BEFORE UPDATE ON public.business_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Atualizar tabela de businesses para incluir informações do plano
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS requires_subscription BOOLEAN DEFAULT true;