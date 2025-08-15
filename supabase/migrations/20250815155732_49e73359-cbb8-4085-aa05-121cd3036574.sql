-- 1) Replace permissive public SELECT with restricted policies and add a safe RPC for public access
-- Drop overly permissive policy
DROP POLICY IF EXISTS "Everyone can view published reviews" ON public.business_reviews;

-- Ensure RLS is enabled (safety)
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own reviews (so they can see emails for their own reviews if needed)
CREATE POLICY "Users can view their own reviews"
ON public.business_reviews
FOR SELECT
USING (reviewer_id = auth.uid());

-- Allow admins to view all reviews
CREATE POLICY "Admins can view all reviews"
ON public.business_reviews
FOR SELECT
USING (get_current_user_admin_status());

-- 2) Create a SECURITY DEFINER function to serve public, sanitized reviews (no reviewer_email nor reviewer_id)
CREATE OR REPLACE FUNCTION public.get_public_business_reviews(
  business_uuid uuid,
  limit_count integer DEFAULT 20,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  business_id uuid,
  reviewer_name text,
  rating integer,
  title text,
  comment text,
  verified boolean,
  helpful_count integer,
  created_at timestamptz
) AS $$
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
  FROM public.business_reviews br
  WHERE br.business_id = business_uuid
  ORDER BY br.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public';

-- 3) Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_public_business_reviews(uuid, integer, integer) TO anon, authenticated;