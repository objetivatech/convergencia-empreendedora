-- Corrigir os dados do usuário admin principal
UPDATE profiles 
SET 
  roles = ARRAY['admin', 'customer']::user_role[],
  is_admin = true,
  can_edit_blog = true
WHERE email = 'mulheresemconvergencia@gmail.com';

-- Garantir que o usuario tenha os tipos de usuario corretos tambem
UPDATE profiles 
SET 
  user_types = ARRAY['admin']::user_type[]
WHERE email = 'mulheresemconvergencia@gmail.com';

-- Adicionar meta tag RSS no header (criar tabela de configuracoes se nao existir)
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela site_config
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Politica para admins gerenciarem configuracoes
CREATE POLICY "Admins can manage site config" 
ON site_config 
FOR ALL 
USING (get_current_user_admin_status());

-- Politica para visualizacao publica de certas configuracoes
CREATE POLICY "Public can view public configs" 
ON site_config 
FOR SELECT 
USING (key IN ('rss_enabled', 'site_title', 'site_description'));

-- Inserir configuracao do RSS
INSERT INTO site_config (key, value) 
VALUES ('rss_config', '{
  "enabled": true,
  "title": "Convergência Empreendedora - Blog",
  "description": "Blog sobre empreendedorismo feminino, economia solidária e transformação social",
  "feed_url": "/rss",
  "items_limit": 50
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();