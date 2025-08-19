-- Limpar base de usuários mantendo apenas os dois administradores especificados
DELETE FROM profiles 
WHERE email NOT IN ('diogodevitte@outlook.com', 'mulheresemconvergencia@gmail.com');

-- Garantir que os usuários mantidos sejam administradores e editores do blog
UPDATE profiles 
SET is_admin = true, can_edit_blog = true
WHERE email IN ('diogodevitte@outlook.com', 'mulheresemconvergencia@gmail.com');

-- Limpar dados relacionados que não serão mais usados
DELETE FROM businesses;
DELETE FROM business_reviews;
DELETE FROM business_subscriptions;
DELETE FROM user_subscriptions;
DELETE FROM ambassadors;
DELETE FROM transactions;
DELETE FROM products;
DELETE FROM courses;
DELETE FROM community_groups;
DELETE FROM community_group_members;
DELETE FROM testimonials;
DELETE FROM user_permissions;