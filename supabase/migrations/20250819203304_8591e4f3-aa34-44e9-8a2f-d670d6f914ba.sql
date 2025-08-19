-- Ensure admins can view all transactions without exposing data publicly
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.get_current_user_admin_status());