-- Create function to track referral clicks
CREATE OR REPLACE FUNCTION track_referral_click(referral_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ambassadors 
  SET link_clicks = link_clicks + 1,
      updated_at = now()
  WHERE referral_code = $1;
END;
$$;

-- Create function to get ambassador by referral code
CREATE OR REPLACE FUNCTION get_ambassador_by_referral(referral_code text)
RETURNS TABLE(id uuid, user_id uuid, commission_rate numeric, asaas_split_config jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.user_id, a.commission_rate, a.asaas_split_config
  FROM ambassadors a
  WHERE a.referral_code = $1 AND a.active = true;
END;
$$;

-- Create trigger to update ambassador stats when transaction is paid
CREATE OR REPLACE FUNCTION update_ambassador_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only update when transaction becomes paid
  IF NEW.status = 'paid' AND OLD.status != 'paid' AND NEW.ambassador_id IS NOT NULL THEN
    UPDATE ambassadors
    SET total_sales = total_sales + 1,
        total_earnings = total_earnings + NEW.commission_amount,
        updated_at = now()
    WHERE id = NEW.ambassador_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS update_ambassador_stats_trigger ON transactions;
CREATE TRIGGER update_ambassador_stats_trigger
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_ambassador_stats();