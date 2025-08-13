-- Tornar business_id nullable na tabela business_subscriptions
ALTER TABLE public.business_subscriptions 
ALTER COLUMN business_id DROP NOT NULL;

-- Criar tabela de assinaturas de usuário (separada dos negócios)
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  payment_provider TEXT DEFAULT 'asaas',
  external_subscription_id TEXT,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly, semestral
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias assinaturas
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();