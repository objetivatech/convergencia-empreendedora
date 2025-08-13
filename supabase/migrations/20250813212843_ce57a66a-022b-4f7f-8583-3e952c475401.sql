-- Create storage buckets for business images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('business-logos', 'business-logos', true),
  ('business-covers', 'business-covers', true),
  ('business-gallery', 'business-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for business images
CREATE POLICY "Authenticated users can upload logos" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'business-logos');

CREATE POLICY "Public can view logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-logos');

CREATE POLICY "Business owners can update their logos" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Business owners can delete their logos" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'business-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Similar policies for covers
CREATE POLICY "Authenticated users can upload covers" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'business-covers');

CREATE POLICY "Public can view covers" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-covers');

CREATE POLICY "Business owners can update their covers" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'business-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Business owners can delete their covers" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'business-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Similar policies for gallery
CREATE POLICY "Authenticated users can upload gallery images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'business-gallery');

CREATE POLICY "Public can view gallery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-gallery');

CREATE POLICY "Business owners can update their gallery images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'business-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Business owners can delete their gallery images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'business-gallery' AND auth.uid()::text = (storage.foldername(name))[1]);