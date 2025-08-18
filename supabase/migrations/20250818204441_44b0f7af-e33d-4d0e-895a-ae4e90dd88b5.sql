-- Primeiro, vamos adicionar constraint unique no email da tabela profiles se não existir
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Agora vamos inserir/atualizar os usuários de teste
-- Atualizar usuários existentes como administradores
UPDATE profiles 
SET is_admin = true, 
    roles = CASE 
      WHEN 'admin'::user_role = ANY(roles) THEN roles
      ELSE array_append(COALESCE(roles, '{}'), 'admin'::user_role)
    END,
    updated_at = now()
WHERE email IN ('diogodevitte@outlook.com', 'mulheresemconvergencia@gmail.com');

-- Inserir perfil para Dona de Perfil de Negócios
INSERT INTO profiles (
  id, email, cpf, full_name, roles, is_admin, can_edit_blog, 
  newsletter_subscribed, onboarding_completed, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'aconfrarianetworing@gmail.com',
  '08889191155',
  'Elisângela Aranda',
  ARRAY['business_owner'::user_role],
  false,
  false,
  true,
  true,
  now(),
  now()
) ON CONFLICT (email) 
DO UPDATE SET
  cpf = EXCLUDED.cpf,
  full_name = EXCLUDED.full_name,
  roles = CASE 
    WHEN 'business_owner'::user_role = ANY(profiles.roles) THEN profiles.roles
    ELSE array_append(COALESCE(profiles.roles, '{}'), 'business_owner'::user_role)
  END,
  updated_at = now();

-- Inserir perfil para Cliente da Loja  
INSERT INTO profiles (
  id, email, cpf, full_name, roles, is_admin, can_edit_blog, 
  newsletter_subscribed, onboarding_completed, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'objetivatech@gmail.com', 
  '22211139000',
  'Raquel de Melo',
  ARRAY['customer'::user_role],
  false,
  false,
  true,
  true,
  now(),
  now()
) ON CONFLICT (email) 
DO UPDATE SET
  cpf = EXCLUDED.cpf,
  full_name = EXCLUDED.full_name,
  roles = CASE 
    WHEN 'customer'::user_role = ANY(profiles.roles) THEN profiles.roles
    ELSE array_append(COALESCE(profiles.roles, '{}'), 'customer'::user_role)
  END,
  updated_at = now();

-- Inserir perfil para Embaixadora
INSERT INTO profiles (
  id, email, cpf, full_name, roles, is_admin, can_edit_blog, 
  newsletter_subscribed, onboarding_completed, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ddevitte@gmail.com',
  '73242091655', 
  'Elisangela Martins',
  ARRAY['ambassador'::user_role],
  false,
  false,
  true,
  true,
  now(),
  now()
) ON CONFLICT (email) 
DO UPDATE SET
  cpf = EXCLUDED.cpf,
  full_name = EXCLUDED.full_name,
  roles = CASE 
    WHEN 'ambassador'::user_role = ANY(profiles.roles) THEN profiles.roles
    ELSE array_append(COALESCE(profiles.roles, '{}'), 'ambassador'::user_role)
  END,
  updated_at = now();

-- Inserir perfil para Membro da Comunidade
INSERT INTO profiles (
  id, email, cpf, full_name, roles, is_admin, can_edit_blog, 
  newsletter_subscribed, onboarding_completed, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'objetivatech@outlook.com',
  '91898164479',
  'Rafael Nunes', 
  ARRAY['community_member'::user_role],
  false,
  false,
  true,
  true,
  now(),
  now()
) ON CONFLICT (email) 
DO UPDATE SET
  cpf = EXCLUDED.cpf,
  full_name = EXCLUDED.full_name,
  roles = CASE 
    WHEN 'community_member'::user_role = ANY(profiles.roles) THEN profiles.roles
    ELSE array_append(COALESCE(profiles.roles, '{}'), 'community_member'::user_role)
  END,
  updated_at = now();

-- Inserir perfil para Editora do Blog
INSERT INTO profiles (
  id, email, cpf, full_name, roles, is_admin, can_edit_blog, 
  newsletter_subscribed, onboarding_completed, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ddevitte@hotmail.com',
  '26211750900',
  'Diogo Nunes',
  ARRAY['blog_editor'::user_role],
  false,
  true,
  true,
  true,
  now(),
  now()
) ON CONFLICT (email) 
DO UPDATE SET
  cpf = EXCLUDED.cpf,
  full_name = EXCLUDED.full_name,
  roles = CASE 
    WHEN 'blog_editor'::user_role = ANY(profiles.roles) THEN profiles.roles
    ELSE array_append(COALESCE(profiles.roles, '{}'), 'blog_editor'::user_role)
  END,
  can_edit_blog = true,
  updated_at = now();