-- Adicionar role admin para usuários que são administradores
UPDATE profiles 
SET roles = array_append(roles, 'admin'::user_role)
WHERE email = 'mulheresemconvergencia@gmail.com' 
AND is_admin = true 
AND NOT ('admin'::user_role = ANY(roles));