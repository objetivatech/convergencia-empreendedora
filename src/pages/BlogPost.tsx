import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Eye, ArrowLeft, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Layout from "@/components/Layout";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published_at: string;
  featured_image_url?: string;
  views_count: number;
  seo_title?: string;
  seo_description?: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
  blog_categories?: {
    id: string;
    name: string;
    slug: string;
  };
  blog_post_tags?: Array<{
    blog_tags: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface RelatedPost {
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

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    if (!slug) return;

    try {
      // Carregar post
      const { data: postData, error: postError } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          content,
          excerpt,
          slug,
          published_at,
          featured_image_url,
          views_count,
          seo_title,
          seo_description,
          profiles!blog_posts_author_id_fkey (
            full_name,
            avatar_url
          ),
          blog_categories!blog_posts_category_id_fkey (
            id,
            name,
            slug
          ),
          blog_post_tags (
            blog_tags (
              id,
              name,
              slug
            )
          )
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (postError) throw postError;

      setPost(postData);

      // Atualizar contador de visualizações
      await supabase
        .from('blog_posts')
        .update({ views_count: (postData.views_count || 0) + 1 })
        .eq('id', postData.id);

      // Carregar posts relacionados (mesma categoria)
      if (postData.blog_categories?.id) {
        const { data: relatedData } = await supabase
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
          .eq('category_id', postData.blog_categories.id)
          .neq('id', postData.id)
          .limit(3)
          .order('published_at', { ascending: false });

        setRelatedPosts(relatedData || []);
      }

      // Atualizar meta tags para SEO
      document.title = postData.seo_title || postData.title;
      
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', postData.seo_description || postData.excerpt || '');
      }

    } catch (error) {
      console.error('Erro ao carregar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = post?.title || '';
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      // Fallback: copiar para clipboard
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link do post foi copiado para a área de transferência",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded" />
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O post que você está procurando não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/convergindo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Link>
          </Button>
        </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navegação */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/convergindo">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Blog
            </Link>
          </Button>
        </div>

        {/* Header do Post */}
        <header className="mb-8">
          {post.blog_categories && (
            <Badge variant="secondary" className="mb-4">
              {post.blog_categories.name}
            </Badge>
          )}
          
          <h1 className="text-4xl font-bold text-primary mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.published_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.profiles?.full_name || "Convergência Empreendedora"}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {post.views_count + 1} visualizações
            </div>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
          </div>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Imagem em destaque */}
        {post.featured_image_url && (
          <div className="mb-8">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-[400px] object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Conteúdo */}
        <article className="prose prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }} 
            className="leading-relaxed text-foreground"
          />
        </article>

        {/* Tags */}
        {post.blog_post_tags && post.blog_post_tags.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.blog_post_tags.map((tag) => (
                <Badge key={tag.blog_tags.id} variant="outline">
                  {tag.blog_tags.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Posts Relacionados */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <Separator className="mb-8" />
            <h2 className="text-2xl font-bold mb-6">Posts Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/convergindo/${relatedPost.slug}`}
                  className="group block"
                >
                  <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {relatedPost.featured_image_url && (
                      <img
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}