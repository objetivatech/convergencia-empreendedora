import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Eye, 
  MousePointer, 
  Users, 
  Calendar,
  Clock,
  Phone,
  Mail,
  Globe,
  Instagram,
  MessageCircle,
  MapPin,
  Plus,
  Trash2,
  Save,
  BarChart3
} from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  logo_url: string;
  cover_image_url: string;
  gallery_images: string[];
  opening_hours: any;
  views_count: number;
  clicks_count: number;
  contacts_count: number;
  subscription_active: boolean;
  subscription_expires_at: string;
  subscription_plan: string;
  created_at: string;
}

const BusinessDashboard = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Business>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchUserBusiness();
  }, []);

  const fetchUserBusiness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para acessar esta página",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setBusiness(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar negócio:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do negócio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      if (business) {
        // Update existing business
        const { error } = await supabase
          .from('businesses')
          .update(formData)
          .eq('id', business.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Negócio atualizado com sucesso!",
        });
      } else {
        // Create new business
        const { error } = await supabase
          .from('businesses')
          .insert([{
            ...formData,
            owner_id: user.id,
            subscription_active: true,
            subscription_plan: 'basic'
          }]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Negócio criado com sucesso!",
        });
      }

      await fetchUserBusiness();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o negócio",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addGalleryImage = () => {
    const url = prompt("URL da imagem:");
    if (url) {
      const currentImages = formData.gallery_images || [];
      updateFormData('gallery_images', [...currentImages, url]);
    }
  };

  const removeGalleryImage = (index: number) => {
    const currentImages = formData.gallery_images || [];
    updateFormData('gallery_images', currentImages.filter((_, i) => i !== index));
  };

  const categories = [
    'Alimentação',
    'Beleza e Estética',
    'Educação',
    'Saúde e Bem-estar',
    'Moda e Acessórios',
    'Casa e Decoração',
    'Tecnologia',
    'Serviços',
    'Arte e Artesanato',
    'Consultoria'
  ];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto section-padding">
          <div className="text-center">
            <h1 className="font-bold mb-4">Carregando dashboard...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto section-padding">
        <div className="mb-8">
          <h1 className="font-bold mb-2">Dashboard do Negócio</h1>
          <p className="text-muted-foreground">
            Gerencie seu perfil no diretório de negócios
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome do Negócio *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="Nome do seu negócio"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Descreva seu negócio..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <Select 
                          value={formData.category || ''} 
                          onValueChange={(value) => updateFormData('category', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="subcategory">Subcategoria</Label>
                        <Input
                          id="subcategory"
                          value={formData.subcategory || ''}
                          onChange={(e) => updateFormData('subcategory', e.target.value)}
                          placeholder="Ex: Doces artesanais"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => updateFormData('phone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div>
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          value={formData.whatsapp || ''}
                          onChange={(e) => updateFormData('whatsapp', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="contato@negocio.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website || ''}
                        onChange={(e) => updateFormData('website', e.target.value)}
                        placeholder="https://www.seusite.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram || ''}
                        onChange={(e) => updateFormData('instagram', e.target.value)}
                        placeholder="@seuinstagram"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Localização</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={formData.address || ''}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        placeholder="Rua, número, bairro"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={formData.city || ''}
                          onChange={(e) => updateFormData('city', e.target.value)}
                          placeholder="São Paulo"
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={formData.state || ''}
                          onChange={(e) => updateFormData('state', e.target.value)}
                          placeholder="SP"
                        />
                      </div>

                      <div>
                        <Label htmlFor="postal_code">CEP</Label>
                        <Input
                          id="postal_code"
                          value={formData.postal_code || ''}
                          onChange={(e) => updateFormData('postal_code', e.target.value)}
                          placeholder="01234-567"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Imagens</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="logo_url">Logo (URL)</Label>
                      <Input
                        id="logo_url"
                        value={formData.logo_url || ''}
                        onChange={(e) => updateFormData('logo_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="cover_image_url">Imagem de Capa (URL)</Label>
                      <Input
                        id="cover_image_url"
                        value={formData.cover_image_url || ''}
                        onChange={(e) => updateFormData('cover_image_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Galeria de Imagens</Label>
                        <Button type="button" size="sm" onClick={addGalleryImage}>
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                      {formData.gallery_images && formData.gallery_images.length > 0 && (
                        <div className="space-y-2">
                          {formData.gallery_images.map((url, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input value={url} readOnly />
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => removeGalleryImage(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 space-y-3">
                      {formData.cover_image_url && (
                        <img 
                          src={formData.cover_image_url} 
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{formData.name || 'Nome do Negócio'}</h3>
                          {formData.category && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {formData.subcategory || formData.category}
                            </Badge>
                          )}
                        </div>
                        {formData.logo_url && (
                          <img 
                            src={formData.logo_url} 
                            alt="Logo"
                            className="w-10 h-10 object-cover rounded-full"
                          />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {formData.description || 'Descrição do negócio aparecerá aqui...'}
                      </p>
                      
                      {formData.city && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {formData.city}, {formData.state}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {business ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{business.views_count}</p>
                        <p className="text-xs text-muted-foreground">Visualizações</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <MousePointer className="h-8 w-8 text-secondary" />
                      <div>
                        <p className="text-2xl font-bold">{business.clicks_count}</p>
                        <p className="text-xs text-muted-foreground">Cliques</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-accent" />
                      <div>
                        <p className="text-2xl font-bold">{business.contacts_count}</p>
                        <p className="text-xs text-muted-foreground">Contatos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Análise de Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Gráficos detalhados em breve</p>
                      <p className="text-sm">Acompanhe o crescimento do seu negócio</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Cadastre seu negócio para ver as análises
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status da Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                {business ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Plano Atual:</span>
                      <Badge variant={business.subscription_active ? "default" : "destructive"}>
                        {business.subscription_plan || 'Básico'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge variant={business.subscription_active ? "default" : "destructive"}>
                        {business.subscription_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    {business.subscription_expires_at && (
                      <div className="flex items-center justify-between">
                        <span>Expira em:</span>
                        <span className="text-sm">
                          {new Date(business.subscription_expires_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span>Membro desde:</span>
                      <span className="text-sm">
                        {new Date(business.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Cadastre seu negócio para ver informações da assinatura
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BusinessDashboard;