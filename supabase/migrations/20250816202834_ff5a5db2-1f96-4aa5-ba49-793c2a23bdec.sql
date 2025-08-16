-- Permitir que a migração de posts funcione corretamente
-- Garantir que possamos inserir posts sem autor específico
UPDATE blog_posts SET author_id = NULL WHERE author_id IS NOT NULL AND author_id NOT IN (SELECT id FROM profiles);

-- Permitir inserção na tabela blog_post_tags
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true) ON CONFLICT (id) DO NOTHING;

-- Criar política para permitir inserção de tags nos posts
CREATE POLICY "Allow blog post tag insertion" 
ON blog_post_tags 
FOR INSERT 
WITH CHECK (true);

-- Criar política para permitir atualização de tags nos posts
CREATE POLICY "Allow blog post tag management" 
ON blog_post_tags 
FOR ALL 
USING (true);