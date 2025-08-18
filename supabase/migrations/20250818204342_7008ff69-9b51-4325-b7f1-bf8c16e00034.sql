-- Criar os usuários de teste conforme especificado pelo cliente
-- IMPORTANTE: Estes inserts só funcionarão se os usuários já existirem na tabela auth.users
-- O cliente precisará criar manualmente os usuários no Supabase Auth primeiro

-- Atualizar usuários existentes como administradores
UPDATE profiles 
SET is_admin = true, 
    roles = array_append(COALESCE(roles, '{}'), 'admin'::user_role),
    updated_at = now()
WHERE email IN ('diogodevitte@outlook.com', 'mulheresemconvergencia@gmail.com');

-- Inserir/Atualizar perfis dos usuários de teste
INSERT INTO profiles (
  id, email, cpf, full_name, roles, is_admin, can_edit_blog, 
  newsletter_subscribed, onboarding_completed, created_at, updated_at
) VALUES 
(
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
),
(
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
),
(
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
),
(
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
),
(
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
)
ON CONFLICT (email) 
DO UPDATE SET
  cpf = EXCLUDED.cpf,
  full_name = EXCLUDED.full_name,
  roles = EXCLUDED.roles,
  is_admin = EXCLUDED.is_admin,
  can_edit_blog = EXCLUDED.can_edit_blog,
  newsletter_subscribed = EXCLUDED.newsletter_subscribed,
  onboarding_completed = EXCLUDED.onboarding_completed,
  updated_at = now();

-- Criar registros na tabela ambassadors para usuários com role ambassador
INSERT INTO ambassadors (user_id, referral_code, commission_rate, active, created_at, updated_at)
SELECT 
  p.id,
  'AMB' || UPPER(SUBSTRING(MD5(p.email) FROM 1 FOR 6)) as referral_code,
  15.0,
  true,
  now(),
  now()
FROM profiles p
WHERE 'ambassador'::user_role = ANY(p.roles)
  AND NOT EXISTS (
    SELECT 1 FROM ambassadors a WHERE a.user_id = p.id
  );

-- Inserir usuários na newsletter_subscribers
INSERT INTO newsletter_subscribers (email, name, user_type, origin, active, subscribed_at)
SELECT 
  email,
  full_name,
  CASE 
    WHEN 'ambassador'::user_role = ANY(roles) THEN 'ambassador'
    WHEN 'business_owner'::user_role = ANY(roles) THEN 'business'
    WHEN 'customer'::user_role = ANY(roles) THEN 'profile'
    WHEN 'community_member'::user_role = ANY(roles) THEN 'profile'
    WHEN 'blog_editor'::user_role = ANY(roles) THEN 'profile'
    ELSE 'newsletter'
  END as user_type,
  'website',
  true,
  now()
FROM profiles 
WHERE email IN (
  'aconfrarianetworing@gmail.com',
  'objetivatech@gmail.com', 
  'ddevitte@gmail.com',
  'objetivatech@outlook.com',
  'ddevitte@hotmail.com'
)
ON CONFLICT (email) 
DO UPDATE SET
  name = EXCLUDED.name,
  user_type = EXCLUDED.user_type,
  active = EXCLUDED.active;