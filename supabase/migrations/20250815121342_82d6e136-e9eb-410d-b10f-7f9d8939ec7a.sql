-- Passo 1: Corrigir RLS recursivo criando funções SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_blog_edit_status()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(can_edit_blog, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Remover policies recursivas e criar novas usando funções seguras
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can manage tags" ON blog_tags;

-- Recriar policies não-recursivas
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (auth.uid() IS NOT NULL AND get_current_user_admin_status());

CREATE POLICY "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING (auth.uid() IS NOT NULL AND get_current_user_admin_status());

CREATE POLICY "Admins can manage all posts" 
ON blog_posts FOR ALL
USING (auth.uid() IS NOT NULL AND (get_current_user_admin_status() OR get_current_user_blog_edit_status()));

CREATE POLICY "Admins can manage categories" 
ON blog_categories FOR ALL
USING (auth.uid() IS NOT NULL AND (get_current_user_admin_status() OR get_current_user_blog_edit_status()));

CREATE POLICY "Admins can manage tags" 
ON blog_tags FOR ALL
USING (auth.uid() IS NOT NULL AND (get_current_user_admin_status() OR get_current_user_blog_edit_status()));

-- Passo 2: Adicionar campo CPF à tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cpf ON profiles(cpf) WHERE cpf IS NOT NULL;

-- Passo 3: Atualizar tabela newsletter_subscribers para integração MailRelay
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS mailrelay_id TEXT;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'newsletter';
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS origin TEXT DEFAULT 'website';
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS last_sync_error TEXT;

-- Criar índice para MailRelay ID
CREATE INDEX IF NOT EXISTS idx_newsletter_mailrelay_id ON newsletter_subscribers(mailrelay_id);

-- Passo 4: Criar tabela de auditoria de sincronização MailRelay
CREATE TABLE IF NOT EXISTS mailrelay_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL, -- 'sync_to_mailrelay', 'sync_from_mailrelay', 'webhook'
  entity_type TEXT NOT NULL, -- 'subscriber', 'profile'
  entity_id UUID,
  mailrelay_id TEXT,
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
  error_message TEXT,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Passo 5: Função para unificação de usuários baseada em email
CREATE OR REPLACE FUNCTION public.evolve_newsletter_to_profile(
  user_email TEXT,
  user_cpf TEXT,
  full_name TEXT DEFAULT NULL,
  phone TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  existing_profile_id UUID;
  newsletter_record RECORD;
  new_profile_id UUID;
BEGIN
  -- Verificar se já existe perfil com este email
  SELECT id INTO existing_profile_id 
  FROM profiles 
  WHERE email = user_email;
  
  IF existing_profile_id IS NOT NULL THEN
    -- Atualizar perfil existente com CPF e outros dados
    UPDATE profiles 
    SET 
      cpf = user_cpf,
      full_name = COALESCE(full_name, profiles.full_name),
      phone = COALESCE(phone, profiles.phone),
      updated_at = now()
    WHERE id = existing_profile_id;
    
    -- Atualizar newsletter_subscribers para indicar evolução
    UPDATE newsletter_subscribers
    SET user_type = 'evolved_to_profile'
    WHERE email = user_email;
    
    RETURN existing_profile_id;
  ELSE
    -- Buscar dados da newsletter
    SELECT * INTO newsletter_record
    FROM newsletter_subscribers
    WHERE email = user_email;
    
    -- Criar novo perfil
    INSERT INTO profiles (
      email, 
      cpf, 
      full_name, 
      phone,
      newsletter_subscribed
    ) VALUES (
      user_email,
      user_cpf,
      COALESCE(full_name, newsletter_record.name),
      phone,
      true
    ) RETURNING id INTO new_profile_id;
    
    -- Atualizar newsletter_subscribers
    UPDATE newsletter_subscribers
    SET user_type = 'evolved_to_profile'
    WHERE email = user_email;
    
    RETURN new_profile_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Passo 6: Trigger para sincronização automática com MailRelay
CREATE OR REPLACE FUNCTION public.sync_newsletter_with_mailrelay()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar operação para sincronização posterior
  INSERT INTO mailrelay_sync_log (
    operation_type,
    entity_type,
    entity_id,
    operation,
    status,
    request_data
  ) VALUES (
    'sync_to_mailrelay',
    'subscriber',
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      WHEN TG_OP = 'DELETE' THEN 'delete'
    END,
    'pending',
    jsonb_build_object(
      'email', COALESCE(NEW.email, OLD.email),
      'name', COALESCE(NEW.name, OLD.name),
      'user_type', COALESCE(NEW.user_type, OLD.user_type),
      'origin', COALESCE(NEW.origin, OLD.origin)
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers para newsletter_subscribers
DROP TRIGGER IF EXISTS trigger_sync_newsletter_mailrelay ON newsletter_subscribers;
CREATE TRIGGER trigger_sync_newsletter_mailrelay
  AFTER INSERT OR UPDATE OR DELETE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION sync_newsletter_with_mailrelay();

-- Trigger similar para profiles (newsletter_subscribed)
CREATE OR REPLACE FUNCTION public.sync_profile_newsletter_with_mailrelay()
RETURNS TRIGGER AS $$
BEGIN
  -- Só sincronizar se newsletter_subscribed mudou
  IF (TG_OP = 'UPDATE' AND OLD.newsletter_subscribed = NEW.newsletter_subscribed) THEN
    RETURN NEW;
  END IF;
  
  INSERT INTO mailrelay_sync_log (
    operation_type,
    entity_type,
    entity_id,
    operation,
    status,
    request_data
  ) VALUES (
    'sync_to_mailrelay',
    'profile',
    NEW.id,
    CASE WHEN NEW.newsletter_subscribed THEN 'create' ELSE 'delete' END,
    'pending',
    jsonb_build_object(
      'email', NEW.email,
      'name', NEW.full_name,
      'cpf', NEW.cpf,
      'user_type', 'profile'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_profile_newsletter_mailrelay ON profiles;
CREATE TRIGGER trigger_sync_profile_newsletter_mailrelay
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_newsletter_with_mailrelay();

-- Passo 7: Políticas RLS para novas tabelas
ALTER TABLE mailrelay_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs" 
ON mailrelay_sync_log FOR SELECT 
USING (get_current_user_admin_status());

-- Permitir inserção pública na newsletter (sem autenticação)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON newsletter_subscribers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscribers" 
ON newsletter_subscribers FOR ALL
USING (get_current_user_admin_status());