-- Criação das tabelas para o portal Mulheres em Convergência

-- Enum para tipos de usuário
CREATE TYPE public.user_type AS ENUM ('admin', 'member', 'business_owner', 'ambassador', 'customer');

-- Enum para tipos de assinatura
CREATE TYPE public.subscription_type AS ENUM ('newsletter', 'community', 'business_basic', 'business_premium');

-- Enum para status de transações
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');

-- Enum para tipos de transação
CREATE TYPE public.transaction_type AS ENUM ('product', 'subscription', 'donation');

-- Enum para categorias de negócio
CREATE TYPE public.business_category AS ENUM (
  'alimentacao', 'moda', 'beleza', 'servicos', 'tecnologia', 'educacao', 
  'saude', 'consultoria', 'artesanato', 'eventos', 'marketing', 'outros'
);

-- Enum para status de posts
CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'archived');

-- Tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  bio TEXT,
  avatar_url TEXT,
  user_types user_type[] DEFAULT '{}',
  subscription_types subscription_type[] DEFAULT '{}',
  newsletter_subscribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de negócios
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category business_category NOT NULL,
  subcategory TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  whatsapp TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[],
  opening_hours JSONB,
  subscription_plan TEXT DEFAULT 'basic',
  subscription_active BOOLEAN DEFAULT FALSE,
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  contacts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias do blog
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tags do blog
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de posts do blog
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  category_id UUID REFERENCES public.blog_categories(id),
  status post_status DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relação entre posts e tags
CREATE TABLE public.blog_post_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Tabela de produtos/serviços
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'BRL',
  type transaction_type NOT NULL,
  digital BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  gallery_images TEXT[],
  active BOOLEAN DEFAULT TRUE,
  commission_rate DECIMAL(5, 2) DEFAULT 15.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de embaixadoras (afiliadas)
CREATE TABLE public.ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5, 2) DEFAULT 15.0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  asaas_split_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id),
  ambassador_id UUID REFERENCES public.ambassadors(id),
  product_id UUID REFERENCES public.products(id),
  business_id UUID REFERENCES public.businesses(id),
  amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  type transaction_type NOT NULL,
  status transaction_status DEFAULT 'pending',
  asaas_payment_id TEXT,
  asaas_webhook_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de newsletter
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  source TEXT -- De onde veio a inscrição
);

-- Tabela de comunidade - grupos
CREATE TABLE public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  private BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de membros dos grupos da comunidade
CREATE TABLE public.community_group_members (
  group_id UUID REFERENCES public.community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

-- Tabela de cursos online
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.profiles(id),
  image_url TEXT,
  price DECIMAL(10, 2),
  duration_minutes INTEGER,
  level TEXT, -- 'beginner', 'intermediate', 'advanced'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para businesses
CREATE POLICY "Business owners can manage their businesses" ON public.businesses FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "Everyone can view active businesses" ON public.businesses FOR SELECT USING (subscription_active = true);

-- Políticas RLS para blog (público para leitura)
CREATE POLICY "Everyone can view published posts" ON public.blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can manage their posts" ON public.blog_posts FOR ALL USING (author_id = auth.uid());
CREATE POLICY "Everyone can view categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Everyone can view tags" ON public.blog_tags FOR SELECT USING (true);

-- Políticas RLS para products (público para leitura)
CREATE POLICY "Everyone can view active products" ON public.products FOR SELECT USING (active = true);

-- Políticas RLS para ambassadors
CREATE POLICY "Ambassadors can view their own data" ON public.ambassadors FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Ambassadors can update their own data" ON public.ambassadors FOR UPDATE USING (user_id = auth.uid());

-- Políticas RLS para transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (customer_id = auth.uid());

-- Políticas RLS para community
CREATE POLICY "Everyone can view public groups" ON public.community_groups FOR SELECT USING (private = false OR created_by = auth.uid());
CREATE POLICY "Group members can view group membership" ON public.community_group_members FOR SELECT USING (user_id = auth.uid());

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_ambassadors_updated_at BEFORE UPDATE ON public.ambassadors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir categorias iniciais do blog
INSERT INTO public.blog_categories (name, slug, description) VALUES
('Empreendedorismo', 'empreendedorismo', 'Conteúdos sobre empreendedorismo feminino'),
('Networking', 'networking', 'Dicas e estratégias de networking'),
('Desenvolvimento Pessoal', 'desenvolvimento-pessoal', 'Crescimento pessoal e profissional'),
('Finanças', 'financas', 'Educação financeira e gestão de negócios'),
('Tecnologia', 'tecnologia', 'Inovação e tecnologia para mulheres'),
('Liderança', 'lideranca', 'Liderança feminina e gestão de equipes');

-- Inserir tags iniciais
INSERT INTO public.blog_tags (name, slug) VALUES
('Mulheres', 'mulheres'),
('Negócios', 'negocios'),
('Inovação', 'inovacao'),
('Mentoria', 'mentoria'),
('Sucesso', 'sucesso'),
('Inspiração', 'inspiracao');

-- Criar índices para performance
CREATE INDEX idx_businesses_category ON public.businesses(category);
CREATE INDEX idx_businesses_city ON public.businesses(city);
CREATE INDEX idx_businesses_subscription_active ON public.businesses(subscription_active);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_transactions_customer ON public.transactions(customer_id);
CREATE INDEX idx_transactions_ambassador ON public.transactions(ambassador_id);
CREATE INDEX idx_profiles_user_types ON public.profiles USING GIN(user_types);
CREATE INDEX idx_profiles_subscription_types ON public.profiles USING GIN(subscription_types);