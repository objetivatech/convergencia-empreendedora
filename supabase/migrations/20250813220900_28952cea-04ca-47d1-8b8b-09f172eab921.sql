-- Create user roles enum
CREATE TYPE user_role AS ENUM (
  'admin',
  'business_owner', 
  'ambassador',
  'community_member',
  'blog_editor',
  'customer'
);

-- Create subscription types enum  
CREATE TYPE subscription_type AS ENUM (
  'newsletter',
  'business_basic',
  'business_premium', 
  'business_pro',
  'community_basic',
  'community_premium'
);

-- Update profiles table to support modular roles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS roles user_role[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS active_subscriptions subscription_type[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_edit_blog BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Create user permissions table for fine-grained control
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  UNIQUE(user_id, permission_name)
);

-- Enable RLS on user_permissions
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_permissions
CREATE POLICY "Users can view their own permissions"
ON user_permissions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all permissions"
ON user_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name user_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid 
    AND role_name = ANY(roles)
  );
END;
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN  
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_permissions
    WHERE user_id = user_uuid 
    AND permission_name = $2
    AND active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

-- Function to add role to user
CREATE OR REPLACE FUNCTION add_user_role(user_uuid UUID, new_role user_role)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET roles = array_append(roles, new_role)
  WHERE id = user_uuid 
  AND NOT (new_role = ANY(roles));
END;
$$;

-- Function to remove role from user
CREATE OR REPLACE FUNCTION remove_user_role(user_uuid UUID, old_role user_role)
RETURNS VOID
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles 
  SET roles = array_remove(roles, old_role)
  WHERE id = user_uuid;
END;
$$;

-- Update businesses table to link with new role system
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS requires_subscription BOOLEAN DEFAULT true;