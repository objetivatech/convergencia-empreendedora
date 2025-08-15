-- Harden access to sensitive business contacts: allow only admins, business owners, or users with an active subscription
CREATE OR REPLACE FUNCTION public.get_business_contacts(p_business_id uuid)
RETURNS TABLE(
  phone text,
  email text,
  whatsapp text,
  website text,
  instagram text,
  address text,
  postal_code text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    b.phone,
    b.email,
    b.whatsapp,
    b.website,
    b.instagram,
    b.address,
    b.postal_code
  FROM public.businesses b
  WHERE b.id = p_business_id 
    AND b.subscription_active = true
    AND (
      public.get_current_user_admin_status() 
      OR b.owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 
        FROM public.user_subscriptions us
        WHERE us.user_id = auth.uid()
          AND us.status = 'active'
          AND (us.expires_at IS NULL OR us.expires_at > now())
      )
    );
$function$;