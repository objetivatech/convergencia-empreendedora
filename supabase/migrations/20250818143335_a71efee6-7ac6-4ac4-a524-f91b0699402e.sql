-- Harden RLS on profiles: remove broad admin table access and expose safe admin stats via RPC

-- 1) Remove broad admin policies from profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Keep existing self-access policies intact (not recreated here)
--   "Users can insert their own profile"
--   "Users can update their own profile"
--   "Users can view their own profile"

-- 2) Provide a secure, minimal admin stats function (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
  total_users integer,
  total_businesses integer,
  total_subscriptions integer,
  new_users_this_month integer,
  active_subscriptions integer
) AS $$
BEGIN
  -- Ensure only admins can use this function
  IF NOT get_current_user_admin_status() THEN
    RAISE EXCEPTION 'Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.profiles)::int AS total_users,
    (SELECT COUNT(*) FROM public.businesses)::int AS total_businesses,
    (SELECT COUNT(*) FROM public.user_subscriptions)::int AS total_subscriptions,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= date_trunc('month', now()))::int AS new_users_this_month,
    (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'active')::int AS active_subscriptions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';