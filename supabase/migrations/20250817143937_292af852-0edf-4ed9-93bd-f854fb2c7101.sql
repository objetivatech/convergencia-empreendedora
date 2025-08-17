-- Create audit logging table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_table TEXT,
  old_values JSONB,
  new_values JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
USING (get_current_user_admin_status());

-- Create secure RPC function for toggling admin status
CREATE OR REPLACE FUNCTION public.secure_toggle_admin_status(
  target_user_id UUID,
  new_admin_status BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_admin_id UUID;
  old_status BOOLEAN;
  result BOOLEAN := false;
BEGIN
  -- Get current user ID and verify admin status
  current_admin_id := auth.uid();
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF NOT get_current_user_admin_status() THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;
  
  -- Prevent users from removing their own admin status
  IF current_admin_id = target_user_id AND new_admin_status = false THEN
    RAISE EXCEPTION 'Cannot remove your own admin privileges';
  END IF;
  
  -- Get old status for audit log
  SELECT is_admin INTO old_status 
  FROM profiles 
  WHERE id = target_user_id;
  
  IF old_status IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Only proceed if status is actually changing
  IF old_status != new_admin_status THEN
    -- Update admin status
    UPDATE profiles 
    SET is_admin = new_admin_status,
        updated_at = now()
    WHERE id = target_user_id;
    
    -- Log the action
    INSERT INTO admin_audit_log (
      admin_id,
      action,
      target_user_id,
      target_table,
      old_values,
      new_values,
      success
    ) VALUES (
      current_admin_id,
      CASE WHEN new_admin_status THEN 'grant_admin' ELSE 'revoke_admin' END,
      target_user_id,
      'profiles',
      jsonb_build_object('is_admin', old_status),
      jsonb_build_object('is_admin', new_admin_status),
      true
    );
    
    result := true;
  END IF;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Log the failed attempt
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    target_user_id,
    target_table,
    success,
    error_message
  ) VALUES (
    current_admin_id,
    CASE WHEN new_admin_status THEN 'grant_admin' ELSE 'revoke_admin' END,
    target_user_id,
    'profiles',
    false,
    SQLERRM
  );
  
  RAISE;
END;
$$;

-- Create secure RPC function for toggling blog editor status
CREATE OR REPLACE FUNCTION public.secure_toggle_blog_editor(
  target_user_id UUID,
  new_editor_status BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_admin_id UUID;
  old_status BOOLEAN;
  result BOOLEAN := false;
BEGIN
  -- Get current user ID and verify admin status
  current_admin_id := auth.uid();
  
  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF NOT get_current_user_admin_status() THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;
  
  -- Get old status for audit log
  SELECT can_edit_blog INTO old_status 
  FROM profiles 
  WHERE id = target_user_id;
  
  IF old_status IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Only proceed if status is actually changing
  IF old_status != new_editor_status THEN
    -- Update blog editor status
    UPDATE profiles 
    SET can_edit_blog = new_editor_status,
        updated_at = now()
    WHERE id = target_user_id;
    
    -- Log the action
    INSERT INTO admin_audit_log (
      admin_id,
      action,
      target_user_id,
      target_table,
      old_values,
      new_values,
      success
    ) VALUES (
      current_admin_id,
      CASE WHEN new_editor_status THEN 'grant_blog_editor' ELSE 'revoke_blog_editor' END,
      target_user_id,
      'profiles',
      jsonb_build_object('can_edit_blog', old_status),
      jsonb_build_object('can_edit_blog', new_editor_status),
      true
    );
    
    result := true;
  END IF;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Log the failed attempt
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    target_user_id,
    target_table,
    success,
    error_message
  ) VALUES (
    current_admin_id,
    CASE WHEN new_editor_status THEN 'grant_blog_editor' ELSE 'revoke_blog_editor' END,
    target_user_id,
    'profiles',
    false,
    SQLERRM
  );
  
  RAISE;
END;
$$;

-- Fix business reviews public access - add policy for public viewing of reviews
CREATE POLICY "Public can view business reviews"
ON public.business_reviews
FOR SELECT
USING (true);

-- Create function to get business reviews with safe customer data
CREATE OR REPLACE FUNCTION public.get_safe_business_reviews(
  p_business_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  business_id UUID,
  reviewer_name TEXT,
  rating INTEGER,
  title TEXT,
  comment TEXT,
  verified BOOLEAN,
  helpful_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    br.id,
    br.business_id,
    br.reviewer_name,
    br.rating,
    br.title,
    br.comment,
    br.verified,
    br.helpful_count,
    br.created_at
  FROM business_reviews br
  WHERE br.business_id = p_business_id
  ORDER BY br.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- Create index for better audit log performance
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_user ON public.admin_audit_log(target_user_id);