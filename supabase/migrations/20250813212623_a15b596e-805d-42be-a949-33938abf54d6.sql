-- Update the business_category enum to match the Portuguese categories
ALTER TYPE business_category RENAME TO business_category_old;

CREATE TYPE business_category AS ENUM (
  'alimentacao',
  'beleza',
  'educacao',
  'saude',
  'moda',
  'casa_decoracao',
  'tecnologia',
  'servicos',
  'artesanato',
  'consultoria',
  'eventos',
  'marketing'
);

-- Update the businesses table to use the new enum
ALTER TABLE businesses 
ALTER COLUMN category TYPE business_category 
USING category::text::business_category;

-- Drop the old enum
DROP TYPE business_category_old;