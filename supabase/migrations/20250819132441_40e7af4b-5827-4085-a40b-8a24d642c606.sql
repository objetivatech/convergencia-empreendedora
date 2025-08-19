-- Force update admin users with correct roles and ensure they can access admin panel
UPDATE profiles 
SET 
  is_admin = true,
  can_edit_blog = true,
  roles = ARRAY['customer', 'business_owner', 'ambassador']::user_role[],
  updated_at = now()
WHERE email IN ('mulheresemconvergencia@gmail.com', 'diogodevitte@outlook.com');