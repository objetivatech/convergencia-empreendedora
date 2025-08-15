import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Phone, Mail, Globe, Instagram, MessageCircle, Eye, MousePointer, Users, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import LocationSearch from "@/components/LocationSearch";
import AdvancedFiltersPanel from "@/components/AdvancedFiltersPanel";
import BusinessHoursDisplay from "@/components/BusinessHoursDisplay";
import { supabase } from "@/integrations/supabase/client";

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  logo_url: string;
  cover_image_url: string;
  gallery_images: string[];
  website?: string;
  instagram?: string;
  views_count: number;
  clicks_count: number;
  contacts_count: number;
  featured: boolean;
  created_at: string;
}

const Directory = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState([10]); // km
  const [useLocationFilter, setUseLocationFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState({
    categories: [] as string[],
    cities: [] as string[],
    rating: [0],
    priceRange: 'all',
    features: [] as string[],
    openNow: false,
    verified: false,
    distance: [10],
    sortBy: 'relevance',
    searchTags: [] as string[]
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchTerm, selectedCategory, selectedCity, userLocation, searchRadius, useLocationFilter]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_public_businesses');

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Erro ao buscar negócios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    let filtered = businesses;

    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(business => business.category === selectedCategory);
    }

    if (selectedCity && selectedCity !== "all") {
      filtered = filtered.filter(business => business.city === selectedCity);
    }

    // Filter by location and radius
    if (useLocationFilter && userLocation) {
      filtered = filtered.filter(business => {
        if (!business.latitude || !business.longitude) return false;
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          business.latitude,
          business.longitude
        );
        
        return distance <= searchRadius[0];
      });

      // Sort by distance when using location filter
      filtered.sort((a, b) => {
        if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
        
        const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        
        return distanceA - distanceB;
      });
    }

    setFilteredBusinesses(filtered);
  };

  const handleLocationSelect = (location: { address: string; lat: number; lng: number; city: string; state: string }) => {
    setUserLocation({ lat: location.lat, lng: location.lng });
    setUseLocationFilter(true);
  };

  const updateBusinessMetrics = async (businessId: string, metricType: 'view' | 'click' | 'contact') => {
    try {
      const business = businesses.find(b => b.id === businessId);
      if (!business) return;

      const updates: any = {};
      
      switch (metricType) {
        case 'view':
          updates.views_count = business.views_count + 1;
          break;
        case 'click':
          updates.clicks_count = business.clicks_count + 1;
          break;
        case 'contact':
          updates.contacts_count = business.contacts_count + 1;
          break;
      }

      await supabase
        .from('businesses')
        .update(updates)
        .eq('id', businessId);

      // Update local state
      setBusinesses(prev => 
        prev.map(b => 
          b.id === businessId 
            ? { ...b, ...updates }
            : b
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    }
  };

  const handleBusinessClick = (businessId: string) => {
    updateBusinessMetrics(businessId, 'view');
  };

  const handleContactClick = async (businessId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateBusinessMetrics(businessId, 'contact');
  };

  const handleWebsiteClick = (businessId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateBusinessMetrics(businessId, 'click');
  };

  const getUniqueCategories = () => {
    return [...new Set(businesses.map(b => b.category))];
  };

  const getUniqueCities = () => {
    return [...new Set(businesses.map(b => b.city))];
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto section-padding">
          <div className="text-center">
            <h1 className="font-bold mb-4">Carregando convergentes...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white section-padding">
        <div className="container mx-auto text-center">
          <h1 className="font-bold mb-4">Convergentes</h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Descubra negócios incríveis de mulheres empreendedoras em todo o Brasil
          </p>
        </div>
      </section>

      {/* Location Search */}
      <section className="bg-gradient-to-b from-muted/30 to-white border-b">
        <div className="container mx-auto py-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold mb-2">Buscar por Localização</h2>
              <p className="text-sm text-muted-foreground">
                Encontre negócios próximos a você ou a um endereço específico
              </p>
            </div>
            
            <div className="space-y-4">
              <LocationSearch 
                onLocationSelect={handleLocationSelect}
                placeholder="Digite um endereço ou use sua localização atual..."
              />
              
              {useLocationFilter && userLocation && (
                <div className="bg-white rounded-lg p-4 border space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="radius" className="text-sm font-medium">
                      Raio de busca: {searchRadius[0]} km
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUseLocationFilter(false);
                        setUserLocation(null);
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  </div>
                  <Slider
                    id="radius"
                    min={1}
                    max={50}
                    step={1}
                    value={searchRadius}
                    onValueChange={setSearchRadius}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white shadow-sm border-b">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar negócios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {getUniqueCities().map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedCity("all");
                setUseLocationFilter(false);
                setUserLocation(null);
              }}
              variant="outline"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="section-padding bg-muted/30">
        <div className="container mx-auto">
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {filteredBusinesses.length} negócio(s) encontrado(s)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-all cursor-pointer group">
                <Link 
                  to={`/diretorio/${business.id}`}
                  onClick={() => handleBusinessClick(business.id)}
                >
                  {/* Cover Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    {business.cover_image_url ? (
                      <img 
                        src={business.cover_image_url} 
                        alt={business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <div className="text-muted-foreground text-4xl font-bold">
                          {business.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    
                    {business.featured && (
                      <Badge className="absolute top-2 right-2 bg-primary text-white">
                        Destaque
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="card-padding">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                          {business.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mb-2">
                          {business.subcategory || business.category}
                        </Badge>
                      </div>
                      {business.logo_url && (
                        <img 
                          src={business.logo_url} 
                          alt={`${business.name} logo`}
                          className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm"
                        />
                      )}
                    </div>
                    
                    <CardDescription className="text-sm line-clamp-2">
                      {business.description}
                    </CardDescription>

                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{business.city}, {business.state}</span>
                      
                      {/* Show distance when using location filter */}
                      {useLocationFilter && userLocation && business.latitude && business.longitude && (
                        <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            business.latitude,
                            business.longitude
                          ).toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </CardHeader>

                   <CardContent className="card-padding pt-0">
                     {/* Contact Buttons */}
                     <div className="flex flex-wrap gap-2 mb-4">
                       <Button 
                         size="sm" 
                         variant="outline"
                         onClick={(e) => {
                           handleContactClick(business.id, e);
                         }}
                       >
                         <Phone className="h-3 w-3 mr-1" />
                         Ligar
                       </Button>
                       
                       <Button 
                         size="sm" 
                         variant="outline"
                         onClick={(e) => {
                           handleContactClick(business.id, e);
                         }}
                       >
                         <MessageCircle className="h-3 w-3 mr-1" />
                         WhatsApp
                       </Button>
                       
                       {business.website && (
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={(e) => {
                             handleWebsiteClick(business.id, e);
                             window.open(business.website, '_blank');
                           }}
                         >
                           <Globe className="h-3 w-3 mr-1" />
                           Site
                         </Button>
                       )}
                     </div>

                    {/* Metrics */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {business.views_count}
                        </span>
                        <span className="flex items-center">
                          <MousePointer className="h-3 w-3 mr-1" />
                          {business.clicks_count}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {business.contacts_count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum negócio encontrado</h3>
                <p>Tente ajustar os filtros de busca para encontrar o que você procura.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Directory;