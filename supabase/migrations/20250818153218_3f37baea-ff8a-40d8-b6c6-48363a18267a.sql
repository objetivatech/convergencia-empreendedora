-- Atualizar o usuário para ter role de admin também
UPDATE profiles 
SET roles = CASE 
  WHEN is_admin = true AND NOT ('admin' = ANY(roles)) THEN array_append(roles, 'admin')
  ELSE roles
END
WHERE email = 'mulheresemconvergencia@gmail.com';