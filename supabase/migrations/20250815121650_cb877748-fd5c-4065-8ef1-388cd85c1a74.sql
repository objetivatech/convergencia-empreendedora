-- Corrigir avisos de segurança: definir search_path nas funções
CREATE OR REPLACE FUNCTION public.get_current_user_admin_status()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_blog_edit_status()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(can_edit_blog, false) FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.evolve_newsletter_to_profile(
  user_email TEXT,
  user_cpf TEXT,
  full_name TEXT DEFAULT NULL,
  phone TEXT DEFAULT NULL
) RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
      full_name = COALESCE(evolve_newsletter_to_profile.full_name, profiles.full_name),
      phone = COALESCE(evolve_newsletter_to_profile.phone, profiles.phone),
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
      COALESCE(evolve_newsletter_to_profile.full_name, newsletter_record.name),
      evolve_newsletter_to_profile.phone,
      true
    ) RETURNING id INTO new_profile_id;
    
    -- Atualizar newsletter_subscribers
    UPDATE newsletter_subscribers
    SET user_type = 'evolved_to_profile'
    WHERE email = user_email;
    
    RETURN new_profile_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_newsletter_with_mailrelay()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_newsletter_with_mailrelay()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;