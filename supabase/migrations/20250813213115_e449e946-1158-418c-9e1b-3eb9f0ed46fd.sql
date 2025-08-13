-- Create business reviews table
CREATE TABLE IF NOT EXISTS business_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL,
  reviewer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  verified boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on business_reviews
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_business_reviews_business_id ON business_reviews(business_id);
CREATE INDEX idx_business_reviews_rating ON business_reviews(rating);
CREATE INDEX idx_business_reviews_created_at ON business_reviews(created_at DESC);

-- RLS policies for business_reviews
CREATE POLICY "Everyone can view published reviews" 
ON business_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create reviews" 
ON business_reviews 
FOR INSERT 
TO authenticated 
WITH CHECK (
  reviewer_id = auth.uid() OR reviewer_id IS NULL
);

CREATE POLICY "Users can update their own reviews" 
ON business_reviews 
FOR UPDATE 
TO authenticated 
USING (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews" 
ON business_reviews 
FOR DELETE 
TO authenticated 
USING (reviewer_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_business_reviews_updated_at
  BEFORE UPDATE ON business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_business_rating(business_uuid uuid)
RETURNS TABLE (
  average_rating numeric,
  total_reviews integer,
  rating_distribution jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(rating::numeric), 1), 0) as average_rating,
    COUNT(*)::integer as total_reviews,
    jsonb_build_object(
      '5', COUNT(*) FILTER (WHERE rating = 5),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '1', COUNT(*) FILTER (WHERE rating = 1)
    ) as rating_distribution
  FROM business_reviews 
  WHERE business_id = business_uuid;
END;
$$;