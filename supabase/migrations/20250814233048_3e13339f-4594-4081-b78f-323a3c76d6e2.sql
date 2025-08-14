-- Adiciona policies administrativas para todas as tabelas necessárias
-- Para profiles - permite admins verem todos os perfis
DO $$ 
BEGIN
  -- Verifica se a policy já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" 
    ON profiles FOR SELECT 
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = true
      )
    );
  END IF;

  -- Verifica se a policy já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles'
  ) THEN
    CREATE POLICY "Admins can update all profiles" 
    ON profiles FOR UPDATE 
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = true
      )
    );
  END IF;
END $$;

-- Para blog_posts - permite admins e editores verem todos os posts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' AND policyname = 'Admins can manage all posts'
  ) THEN
    CREATE POLICY "Admins can manage all posts" 
    ON blog_posts FOR ALL
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND (is_admin = true OR can_edit_blog = true)
      )
    );
  END IF;
END $$;

-- Para blog_categories - permite admins criarem/editarem categorias
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_categories' AND policyname = 'Admins can manage categories'
  ) THEN
    CREATE POLICY "Admins can manage categories" 
    ON blog_categories FOR ALL
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND (is_admin = true OR can_edit_blog = true)
      )
    );
  END IF;
END $$;

-- Para blog_tags - permite admins criarem/editarem tags
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_tags' AND policyname = 'Admins can manage tags'
  ) THEN
    CREATE POLICY "Admins can manage tags" 
    ON blog_tags FOR ALL
    USING (
      auth.uid() IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND (is_admin = true OR can_edit_blog = true)
      )
    );
  END IF;
END $$;