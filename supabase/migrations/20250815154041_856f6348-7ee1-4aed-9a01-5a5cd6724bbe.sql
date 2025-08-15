-- Update public business functions to include non-sensitive public links
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
  website text,
  instagram text,
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
    b.website,
    b.instagram,
    b.views_count,
    b.clicks_count,
    b.contacts_count,
    b.featured,
    b.created_at
  FROM public.businesses b
  WHERE b.subscription_active = true;
$$;

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
  website text,
  instagram text,
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
    b.website,
    b.instagram,
    b.views_count,
    b.clicks_count,
    b.contacts_count,
    b.featured,
    b.created_at
  FROM public.businesses b
  WHERE b.id = p_business_id AND b.subscription_active = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_businesses() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_business_by_id(uuid) TO anon, authenticated;
