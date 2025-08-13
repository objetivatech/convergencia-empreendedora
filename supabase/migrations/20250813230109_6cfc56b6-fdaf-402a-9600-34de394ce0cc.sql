-- Inserir os planos corretos usando price_monthly e price_yearly (que já existem)
DELETE FROM public.subscription_plans;

INSERT INTO public.subscription_plans (name, display_name, price_monthly, price_yearly, features, limits, sort_order, is_featured) VALUES
(
  'iniciante',
  'Plano Iniciante',
  35.00,
  336.00,
  '{
    "business_profiles": 1,
    "whatsapp_community": true,
    "recorded_content": true,
    "event_discount_percent": 10,
    "course_info": true,
    "social_visibility": true,
    "mentoring_hours": 0,
    "semestral_price": 176.50
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
  720.00,
  '{
    "business_profiles": 1,
    "whatsapp_community": true,
    "recorded_content": true,
    "event_discount_percent": 15,
    "course_info": true,
    "social_visibility": true,
    "mentoring_hours": 1,
    "priority_display": true,
    "semestral_price": 378.00
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
  1440.00,
  '{
    "business_profiles": 2,
    "whatsapp_community": true,
    "recorded_content": true,
    "event_discount_percent": 20,
    "course_info": true,
    "social_visibility": true,
    "mentoring_hours": 2,
    "featured_display": true,
    "semestral_price": 756.00
  }',
  '{
    "max_businesses": 2,
    "priority_display": true,
    "featured_display": true
  }',
  3,
  false
);