-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION track_referral_click(referral_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE ambassadors 
  SET link_clicks = link_clicks + 1,
      updated_at = now()
  WHERE referral_code = $1;
END;
$$;

CREATE OR REPLACE FUNCTION get_ambassador_by_referral(referral_code text)
RETURNS TABLE(id uuid, user_id uuid, commission_rate numeric, asaas_split_config jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.user_id, a.commission_rate, a.asaas_split_config
  FROM ambassadors a
  WHERE a.referral_code = $1 AND a.active = true;
END;
$$;

CREATE OR REPLACE FUNCTION update_ambassador_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update when transaction becomes paid/completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.ambassador_id IS NOT NULL THEN
    UPDATE ambassadors
    SET total_sales = total_sales + 1,
        total_earnings = total_earnings + NEW.commission_amount,
        updated_at = now()
    WHERE id = NEW.ambassador_id;
  END IF;
  
  RETURN NEW;
END;
$$;