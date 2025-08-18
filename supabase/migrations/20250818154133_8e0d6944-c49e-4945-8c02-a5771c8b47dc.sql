-- Corrigir role admin para usuários com is_admin=true
UPDATE profiles 
SET roles = array_append(roles, 'admin'::user_role)
WHERE is_admin = true 
AND NOT ('admin'::user_role = ANY(roles));

-- Verificação de segurança
SELECT email, is_admin, roles 
FROM profiles 
WHERE is_admin = true;