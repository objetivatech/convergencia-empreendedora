-- CRITICAL SECURITY FIX: Restrict newsletter subscriber access to admins only
-- This prevents any authenticated user from viewing all newsletter subscriber emails

-- Drop the overly permissive policy that allows any authenticated user to view newsletter subscribers
DROP POLICY IF EXISTS "Only authenticated users can view newsletter" ON public.newsletter_subscribers;

-- Create a new restrictive policy - only admins can view newsletter subscribers
CREATE POLICY "Only admins can view newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (get_current_user_admin_status());

-- DATABASE FUNCTION HARDENING: Add proper search_path to prevent SQL injection
-- Update functions that lack proper search_path configuration

CREATE OR REPLACE FUNCTION public.evolve_newsletter_to_profile(user_email text, user_cpf text, full_name text DEFAULT NULL::text, phone text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.setup_mailrelay_smtp()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result_message text;
BEGIN
  -- Esta função pode ser chamada para configurar o SMTP do MailRelay
  -- Para o Supabase Auth usar SMTP customizado, é necessário configurar
  -- no painel do Supabase em Auth > Settings > SMTP Settings
  
  result_message := 'Para configurar o MailRelay como SMTP:
  1. Acesse o painel do Supabase: Authentication > Settings > SMTP Settings
  2. Configure:
     - SMTP Host: smtp.mailrelay.com
     - SMTP Port: 587 (ou 465 para SSL)
     - SMTP User: seu_usuario_mailrelay
     - SMTP Pass: sua_senha_mailrelay
     - SMTP From: noreply@seudominio.com
  3. Teste o envio de email';
  
  RETURN result_message;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_auth_email_via_mailrelay(recipient_email text, email_type text, user_data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Esta função será implementada para enviar emails via MailRelay
  -- Retorna o status da operação
  
  result := jsonb_build_object(
    'success', true,
    'message', 'Email scheduled to be sent via MailRelay',
    'recipient', recipient_email,
    'type', email_type
  );
  
  -- Log da operação para sincronização posterior
  INSERT INTO mailrelay_sync_log (
    operation_type,
    entity_type,
    operation,
    status,
    request_data
  ) VALUES (
    'send_auth_email',
    'email',
    'send',
    'pending',
    jsonb_build_object(
      'recipient', recipient_email,
      'email_type', email_type,
      'user_data', user_data
    )
  );
  
  RETURN result;
END;
$function$;