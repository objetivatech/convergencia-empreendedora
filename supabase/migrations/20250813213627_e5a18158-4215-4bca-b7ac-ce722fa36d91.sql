-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '{}',
  limits jsonb NOT NULL DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default plans
INSERT INTO subscription_plans (name, display_name, price_monthly, price_yearly, features, limits, is_featured, sort_order) VALUES
('basic', 'Básico', 0, 0, 
 '{"gallery_images": 3, "featured_listing": false, "analytics": "basic", "support": "community"}',
 '{"gallery_images": 3, "monthly_views": 1000}',
 false, 1),
('pro', 'Profissional', 29.90, 299.00,
 '{"gallery_images": 10, "featured_listing": true, "analytics": "advanced", "support": "priority", "custom_domain": false}',
 '{"gallery_images": 10, "monthly_views": 10000}',
 true, 2),
('premium', 'Premium', 49.90, 499.00,
 '{"gallery_images": 20, "featured_listing": true, "analytics": "advanced", "support": "priority", "custom_domain": true, "api_access": true}',
 '{"gallery_images": 20, "monthly_views": -1}',
 false, 3);

-- Update businesses table with plan features
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS plan_features jsonb DEFAULT '{}';

-- Create business subscriptions table for tracking
CREATE TABLE IF NOT EXISTS business_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  auto_renew boolean DEFAULT true,
  payment_provider text,
  external_subscription_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Everyone can view active plans" 
ON subscription_plans 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Business owners can view their subscriptions" 
ON business_subscriptions 
FOR SELECT 
TO authenticated 
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

-- Indexes
CREATE INDEX idx_business_subscriptions_business_id ON business_subscriptions(business_id);
CREATE INDEX idx_business_subscriptions_status ON business_subscriptions(status);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_business_subscriptions_updated_at
  BEFORE UPDATE ON business_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();