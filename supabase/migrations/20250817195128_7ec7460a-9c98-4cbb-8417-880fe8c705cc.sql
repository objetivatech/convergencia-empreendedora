-- Create a secure function to return admin-safe profile data without sensitive fields
CREATE OR REPLACE FUNCTION public.get_profiles_admin_safe(p_limit integer DEFAULT 500, p_offset integer DEFAULT 0)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  roles user_role[],
  subscription_types subscription_type[],
  is_admin boolean,
  can_edit_blog boolean,
  newsletter_subscribed boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admins to use this function
  IF NOT get_current_user_admin_status() THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.roles,
    p.subscription_types,
    p.is_admin,
    p.can_edit_blog,
    p.newsletter_subscribed,
    p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$function$;