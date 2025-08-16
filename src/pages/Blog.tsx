import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, User, Eye } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  featured_image_url?: string;
  views_count: number;
  profiles?: {
    full_name: string;
  };
  blog_categories?: {
    name: string;
    slug: string;
  };
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const categoryParam = searchParams.get("categoria");

  useEffect(() => {
    loadBlogData();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const loadBlogData = async () => {
    try {
      // Carregar posts publicados
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          excerpt,
          slug,
          published_at,
          featured_image_url,
          views_count,
          profiles!blog_posts_author_id_fkey (
            full_name
          ),
          blog_categories!blog_posts_category_id_fkey (
            name,
            slug
          )
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (postsError) throw postsError;

      // Carregar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('blog_categories')
        .select('id, name, slug')
        .order('name');

      if (categoriesError) throw categoriesError;

      setPosts(postsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados do blog:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts do blog",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || 
                           post.blog_categories?.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    if (categorySlug) {
      setSearchParams({ categoria: categorySlug });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Convergindo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Compartilhando conhecimento sobre empreendedorismo feminino, 
          networking e transformação social através do trabalho de mulheres
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              onClick={() => handleCategoryChange("")}
              size="sm"
            >
              Todas
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                onClick={() => handleCategoryChange(category.slug)}
                size="sm"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchTerm || selectedCategory 
              ? "Nenhum post encontrado com os filtros aplicados"
              : "Nenhum post publicado ainda"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300">
              <Link to={`/convergindo/${post.slug}`}>
                {post.featured_image_url && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(post.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  {post.blog_categories && (
                    <Badge variant="secondary" className="w-fit">
                      {post.blog_categories.name}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.profiles?.full_name || "Convergência Empreendedora"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views_count}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}