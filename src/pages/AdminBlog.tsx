import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRoles } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  ChevronLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  Save,
  X
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: 'draft' | 'published' | 'archived';
  author_id: string | null;
  category_id: string | null;
  featured_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  published_at: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export default function AdminBlog() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, canEditBlog, isAdmin } = useUserRoles();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    seo_title: "",
    seo_description: "",
    seo_keywords: []
  });

  useEffect(() => {
    if (!canEditBlog() && !isAdmin()) {
      navigate("/admin");
    }
  }, [canEditBlog, isAdmin, navigate]);

  useEffect(() => {
    if (canEditBlog() || isAdmin()) {
      loadBlogData();
    }
  }, [canEditBlog, isAdmin]);

  const loadBlogData = async () => {
    try {
      const [postsResult, categoriesResult, tagsResult] = await Promise.all([
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_categories').select('*').order('name'),
        supabase.from('blog_tags').select('*').order('name')
      ]);

      if (postsResult.error) throw postsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (tagsResult.error) throw tagsResult.error;

      setPosts(postsResult.data || []);
      setCategories(categoriesResult.data || []);
      setTags(tagsResult.data || []);
    } catch (error) {
      console.error('Error loading blog data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do blog.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (post: Partial<BlogPost>, isNew: boolean = false) => {
    try {
      if (!post.title) {
        toast({
          title: "Erro",
          description: "O título é obrigatório.",
          variant: "destructive"
        });
        return;
      }

      const postData = {
        title: post.title,
        content: post.content || '',
        excerpt: post.excerpt || '',
        status: post.status || 'draft',
        author_id: profile?.id,
        slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
        seo_title: post.seo_title || '',
        seo_description: post.seo_description || '',
        seo_keywords: post.seo_keywords || [],
        updated_at: new Date().toISOString()
      };

      if (isNew) {
        const { error } = await supabase.from('blog_posts').insert(postData);
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Post criado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Post atualizado com sucesso!",
        });
      }

      loadBlogData();
      setEditDialogOpen(false);
      setNewPost({
        title: "",
        content: "",
        excerpt: "",
        status: "draft",
        seo_title: "",
        seo_description: "",
        seo_keywords: []
      });
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o post.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso!",
      });
      loadBlogData();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", label: "Rascunho" },
      published: { color: "bg-green-100 text-green-800", label: "Publicado" },
      archived: { color: "bg-red-100 text-red-800", label: "Arquivado" }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Carregando editor de blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/admin")}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Editor de Blog</h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie posts, categorias e tags do blog
                </p>
              </div>
            </div>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedPost(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedPost ? "Editar Post" : "Criar Novo Post"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={selectedPost?.title || newPost.title || ""}
                        onChange={(e) => {
                          if (selectedPost) {
                            setSelectedPost({...selectedPost, title: e.target.value});
                          } else {
                            setNewPost({...newPost, title: e.target.value});
                          }
                        }}
                        placeholder="Digite o título do post"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={selectedPost?.status || newPost.status || "draft"}
                        onValueChange={(value) => {
                          if (selectedPost) {
                            setSelectedPost({...selectedPost, status: value as any});
                          } else {
                            setNewPost({...newPost, status: value as any});
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Resumo</Label>
                    <Textarea
                      id="excerpt"
                      value={selectedPost?.excerpt || newPost.excerpt || ""}
                      onChange={(e) => {
                        if (selectedPost) {
                          setSelectedPost({...selectedPost, excerpt: e.target.value});
                        } else {
                          setNewPost({...newPost, excerpt: e.target.value});
                        }
                      }}
                      placeholder="Resumo do post para exibição em listas"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Conteúdo *</Label>
                    <Textarea
                      id="content"
                      value={selectedPost?.content || newPost.content || ""}
                      onChange={(e) => {
                        if (selectedPost) {
                          setSelectedPost({...selectedPost, content: e.target.value});
                        } else {
                          setNewPost({...newPost, content: e.target.value});
                        }
                      }}
                      placeholder="Conteúdo completo do post"
                      rows={10}
                    />
                  </div>

                  {/* SEO */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Configurações de SEO</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="seo-title">Título SEO</Label>
                        <Input
                          id="seo-title"
                          value={selectedPost?.seo_title || newPost.seo_title || ""}
                          onChange={(e) => {
                            if (selectedPost) {
                              setSelectedPost({...selectedPost, seo_title: e.target.value});
                            } else {
                              setNewPost({...newPost, seo_title: e.target.value});
                            }
                          }}
                          placeholder="Título otimizado para SEO (máx. 60 caracteres)"
                          maxLength={60}
                        />
                      </div>
                      <div>
                        <Label htmlFor="seo-description">Descrição SEO</Label>
                        <Textarea
                          id="seo-description"
                          value={selectedPost?.seo_description || newPost.seo_description || ""}
                          onChange={(e) => {
                            if (selectedPost) {
                              setSelectedPost({...selectedPost, seo_description: e.target.value});
                            } else {
                              setNewPost({...newPost, seo_description: e.target.value});
                            }
                          }}
                          placeholder="Descrição meta para motores de busca (máx. 160 caracteres)"
                          maxLength={160}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditDialogOpen(false)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => handleSavePost(selectedPost || newPost, !selectedPost)}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar posts</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por título ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <Label htmlFor="status-filter">Filtrar por status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="archived">Arquivados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{posts.length}</div>
              <p className="text-sm text-muted-foreground">Total de posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{posts.filter(p => p.status === 'published').length}</div>
              <p className="text-sm text-muted-foreground">Publicados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{posts.filter(p => p.status === 'draft').length}</div>
              <p className="text-sm text-muted-foreground">Rascunhos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.views_count, 0)}</div>
              <p className="text-sm text-muted-foreground">Total de visualizações</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Posts do Blog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visualizações</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{post.title}</div>
                          {post.excerpt && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {post.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(post.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1 text-muted-foreground" />
                          {post.views_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}