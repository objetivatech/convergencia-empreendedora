import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  MessageCircle, 
  Clock,
  ArrowLeft,
  Eye,
  MousePointer,
  Users,
  Calendar
} from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

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
  latitude: number;
  longitude: number;
  logo_url: string;
  cover_image_url: string;
  gallery_images: string[];
  opening_hours: any;
  views_count: number;
  clicks_count: number;
  contacts_count: number;
  featured: boolean;
  subscription_active: boolean;
  created_at: string;
}

const BusinessProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    if (id) {
      fetchBusiness();
      updateViewCount();
    }
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .eq('subscription_active', true)
        .single();

      if (error) throw error;
      setBusiness(data);
      setSelectedImage(data.cover_image_url || "");
    } catch (error) {
      console.error('Erro ao buscar negócio:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateViewCount = async () => {
    try {
      if (business) {
        await supabase
          .from('businesses')
          .update({ views_count: business.views_count + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Erro ao atualizar visualizações:', error);
    }
  };

  const updateContactMetrics = async (metricType: 'click' | 'contact') => {
    try {
      if (business) {
        if (metricType === 'click') {
          await supabase
            .from('businesses')
            .update({ clicks_count: business.clicks_count + 1 })
            .eq('id', id);
        } else {
          await supabase
            .from('businesses')
            .update({ contacts_count: business.contacts_count + 1 })
            .eq('id', id);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    }
  };

  const handleContactClick = (type: 'phone' | 'whatsapp' | 'email' | 'website' | 'instagram') => {
    updateContactMetrics('contact');
    
    if (!business) return;

    switch (type) {
      case 'phone':
        window.open(`tel:${business.phone}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${business.email}`, '_blank');
        break;
      case 'website':
        updateContactMetrics('click');
        window.open(business.website, '_blank');
        break;
      case 'instagram':
        updateContactMetrics('click');
        window.open(`https://instagram.com/${business.instagram.replace('@', '')}`, '_blank');
        break;
    }
  };

  const formatOpeningHours = (hours: any) => {
    if (!hours) return "Horário não informado";
    
    const daysOfWeek = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    
    return Object.entries(hours).map(([day, time]: [string, any]) => (
      <div key={day} className="flex justify-between text-sm">
        <span className="capitalize font-medium">{daysOfWeek[parseInt(day)] || day}:</span>
        <span>{time?.open && time?.close ? `${time.open} - ${time.close}` : 'Fechado'}</span>
      </div>
    ));
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto section-padding">
          <div className="text-center">
            <h1 className="font-bold mb-4">Carregando...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <div className="container mx-auto section-padding text-center">
          <h1 className="font-bold mb-4">Negócio não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O negócio que você está procurando não foi encontrado ou não está mais ativo.
          </p>
          <Button asChild>
            <Link to="/diretorio">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Diretório
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto py-4">
          <Button variant="ghost" asChild>
            <Link to="/diretorio">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Diretório
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card>
              <div className="relative">
                {selectedImage && (
                  <img 
                    src={selectedImage} 
                    alt={business.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                )}
                
                {business.featured && (
                  <Badge className="absolute top-4 right-4 bg-primary text-white">
                    Destaque
                  </Badge>
                )}
              </div>

              <CardHeader className="card-padding">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{business.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary">{business.category}</Badge>
                      {business.subcategory && (
                        <Badge variant="outline">{business.subcategory}</Badge>
                      )}
                    </div>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{business.address}, {business.city}, {business.state}</span>
                      {business.postal_code && <span> - {business.postal_code}</span>}
                    </div>
                  </div>
                  
                  {business.logo_url && (
                    <img 
                      src={business.logo_url} 
                      alt={`${business.name} logo`}
                      className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-lg"
                    />
                  )}
                </div>

                <CardDescription className="text-base leading-relaxed">
                  {business.description}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Gallery */}
            {business.gallery_images && business.gallery_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Galeria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {business.gallery_images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${business.name} - Imagem ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedImage(image)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Entre em Contato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.phone && (
                    <Button 
                      onClick={() => handleContactClick('phone')}
                      className="justify-start"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {business.phone}
                    </Button>
                  )}
                  
                  {business.whatsapp && (
                    <Button 
                      onClick={() => handleContactClick('whatsapp')}
                      variant="outline"
                      className="justify-start"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {business.email && (
                    <Button 
                      onClick={() => handleContactClick('email')}
                      variant="outline"
                      className="justify-start"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {business.email}
                    </Button>
                  )}
                  
                  {business.website && (
                    <Button 
                      onClick={() => handleContactClick('website')}
                      variant="outline"
                      className="justify-start"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Site
                    </Button>
                  )}
                  
                  {business.instagram && (
                    <Button 
                      onClick={() => handleContactClick('instagram')}
                      variant="outline"
                      className="justify-start md:col-span-2"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      {business.instagram}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Horário de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatOpeningHours(business.opening_hours)}
                </div>
              </CardContent>
            </Card>

            {/* Business Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                      Visualizações
                    </span>
                    <Badge variant="secondary">{business.views_count}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <MousePointer className="h-4 w-4 mr-2 text-muted-foreground" />
                      Cliques
                    </span>
                    <Badge variant="secondary">{business.clicks_count}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      Contatos
                    </span>
                    <Badge variant="secondary">{business.contacts_count}</Badge>
                  </div>

                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      Membro desde
                    </span>
                    <span className="text-sm">
                      {new Date(business.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            {business.latitude && business.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Localização</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Mapa interativo</p>
                      <p className="text-xs">Em breve</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BusinessProfile;