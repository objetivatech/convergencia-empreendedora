-- Create a function to get Google Places API key from secrets
CREATE OR REPLACE FUNCTION get_google_places_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN current_setting('app.settings.google_places_api_key', true);
END;
$$;