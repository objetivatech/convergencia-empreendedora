-- Fix security issue: set search_path for the function
CREATE OR REPLACE FUNCTION get_google_places_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN current_setting('app.settings.google_places_api_key', true);
END;
$$;