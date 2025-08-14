-- Configura o usuário diogodevitte@outlook.com como administrador
UPDATE profiles 
SET 
  is_admin = true,
  can_edit_blog = true,
  roles = CASE 
    WHEN 'admin' = ANY(roles) THEN roles 
    ELSE array_append(roles, 'admin'::user_role)
  END
WHERE email = 'diogodevitte@outlook.com';

-- Adiciona permissões administrativas completas
INSERT INTO user_permissions (user_id, permission_name, granted_by, active)
SELECT 
  id as user_id,
  'admin_panel_access' as permission_name,
  id as granted_by,
  true as active
FROM profiles 
WHERE email = 'diogodevitte@outlook.com'
ON CONFLICT DO NOTHING;