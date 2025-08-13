-- Limpar dados existentes da tabela de planos
DELETE FROM public.subscription_plans;

-- Inserir os novos planos com os valores corretos
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