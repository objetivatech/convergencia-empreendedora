-- Corrigir problemas de segurança detectados pelo linter

-- Corrigir funções sem search_path definido
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Adicionar políticas RLS para tabelas que estavam faltando

-- Políticas para blog_post_tags
CREATE POLICY "Everyone can view post tags" ON public.blog_post_tags FOR SELECT USING (true);

-- Políticas para newsletter_subscribers (apenas admins podem gerenciar)
CREATE POLICY "Only authenticated users can view newsletter" ON public.newsletter_subscribers FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para courses
CREATE POLICY "Everyone can view active courses" ON public.courses FOR SELECT USING (active = true);
CREATE POLICY "Instructors can manage their courses" ON public.courses FOR ALL USING (instructor_id = auth.uid());