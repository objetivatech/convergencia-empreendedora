-- Strengthen data protection for businesses table: hide contact info from public
-- 1) Drop overly-permissive public SELECT policy
DROP POLICY IF EXISTS "Everyone can view active businesses" ON public.businesses;

-- 2) Create public function to list businesses with safe columns only
CREATE OR REPLACE FUNCTION public.get_public_businesses()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  subcategory text,
  city text,
  state text,
  latitude numeric,
  longitude numeric,
  logo_url text,
  cover_image_url text,
  gallery_images text[],
  views_count integer,
  clicks_count integer,
  contacts_count integer,
  featured boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT 
    b.id,
    b.name,
    b.description,
    b.category::text AS category,
    b.subcategory,
    b.city,
    b.state,
    b.latitude,
    b.longitude,
    b.logo_url,
    b.cover_image_url,
    b.gallery_images,
    b.views_count,
    b.clicks_count,
    b.contacts_count,
    b.featured,
    b.created_at
  FROM public.businesses b
  WHERE b.subscription_active = true;
$$;

-- 3) Create function to get a single business (safe columns)
CREATE OR REPLACE FUNCTION public.get_public_business_by_id(p_business_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  category text,
  subcategory text,
  city text,
  state text,
  latitude numeric,
  longitude numeric,
  logo_url text,
  cover_image_url text,
  gallery_images text[],
  opening_hours jsonb,
  views_count integer,
  clicks_count integer,
  contacts_count integer,
  featured boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT 
    b.id,
    b.name,
    b.description,
    b.category::text AS category,
    b.subcategory,
    b.city,
    b.state,
    b.latitude,
    b.longitude,
    b.logo_url,
    b.cover_image_url,
    b.gallery_images,
    b.opening_hours,
    b.views_count,
    b.clicks_count,
    b.contacts_count,
    b.featured,
    b.created_at
  FROM public.businesses b
  WHERE b.id = p_business_id AND b.subscription_active = true
  LIMIT 1;
$$;

-- 4) Create function to fetch sensitive contacts; only returns data for authenticated users
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
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
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
    AND auth.uid() IS NOT NULL;
$$;

-- 5) Restrict direct SELECT on businesses: allow only owners (already covered by existing policy) and admins if applicable
-- Leave existing "Business owners can manage their businesses" (ALL) policy intact.
-- No general SELECT policy is re-created; public must use the safe RPCs above.

-- 6) Grant execution rights on the new functions to both roles
GRANT EXECUTE ON FUNCTION public.get_public_businesses() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_business_by_id(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_business_contacts(uuid) TO authenticated;
