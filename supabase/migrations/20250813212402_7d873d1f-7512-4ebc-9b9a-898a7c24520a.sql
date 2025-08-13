-- Add latitude and longitude columns to businesses table if they don't exist
DO $$ 
BEGIN
  -- Check if latitude column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'businesses' AND column_name = 'latitude') THEN
    ALTER TABLE businesses ADD COLUMN latitude NUMERIC;
  END IF;
  
  -- Check if longitude column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'businesses' AND column_name = 'longitude') THEN
    ALTER TABLE businesses ADD COLUMN longitude NUMERIC;
  END IF;
END $$;