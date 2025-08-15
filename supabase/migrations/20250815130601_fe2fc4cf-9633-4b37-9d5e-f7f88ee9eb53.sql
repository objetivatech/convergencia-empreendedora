-- Configurar SMTP do MailRelay para envio de emails de autenticação
-- Primeiro vamos verificar se a configuração de SMTP personalizada está correta

-- Atualizar o usuário admin principal
UPDATE profiles 
SET 
  is_admin = true,
  can_edit_blog = true,
  roles = CASE 
    WHEN roles IS NULL THEN ARRAY['customer', 'admin']::user_role[]
    WHEN NOT ('admin' = ANY(roles)) THEN array_append(roles, 'admin'::user_role)
    ELSE roles
  END
WHERE email = 'mulheresemconvergencia@gmail.com';

-- Criar uma função para configurar SMTP personalizado via MailRelay
CREATE OR REPLACE FUNCTION public.setup_mailrelay_smtp()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Criar edge function para integração completa com MailRelay para emails
CREATE OR REPLACE FUNCTION public.send_auth_email_via_mailrelay(
  recipient_email text,
  email_type text,
  user_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;