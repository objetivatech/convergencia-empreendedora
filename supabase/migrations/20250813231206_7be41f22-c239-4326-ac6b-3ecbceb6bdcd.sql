-- Adicionar política para edge functions poderem inserir assinaturas de usuário
CREATE POLICY "Edge functions can insert user subscriptions" ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Política para edge functions poderem atualizar assinaturas
CREATE POLICY "Edge functions can update user subscriptions" ON public.user_subscriptions
  FOR UPDATE
  USING (true);