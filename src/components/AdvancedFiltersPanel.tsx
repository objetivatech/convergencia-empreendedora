import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, ChevronDown, X, Star, Clock, MapPin } from "lucide-react";

interface AdvancedFilters {
  categories: string[];
  cities: string[];
  rating: number[];
  priceRange: string;
  features: string[];
  openNow: boolean;
  verified: boolean;
  distance: number[];
  sortBy: string;
  searchTags: string[];
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
  availableCategories: string[];
  availableCities: string[];
  showLocationFilters: boolean;
}

const AdvancedFiltersPanel = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  availableCategories,
  availableCities,
  showLocationFilters
}: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const updateFilters = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: keyof AdvancedFilters, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const addSearchTag = () => {
    if (tagInput.trim() && !filters.searchTags.includes(tagInput.trim())) {
      updateFilters('searchTags', [...filters.searchTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeSearchTag = (tag: string) => {
    updateFilters('searchTags', filters.searchTags.filter(t => t !== tag));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.cities.length > 0) count++;
    if (filters.rating[0] > 0) count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.features.length > 0) count++;
    if (filters.openNow) count++;
    if (filters.verified) count++;
    if (filters.searchTags.length > 0) count++;
    return count;
  };

  const availableFeatures = [
    'delivery', 'takeaway', 'wifi', 'parking', 'accessible', 
    'pet_friendly', 'outdoor_seating', 'card_payment', 'pix'
  ];

  const featureLabels: Record<string, string> = {
    delivery: 'Entrega',
    takeaway: 'Retirada',
    wifi: 'Wi-Fi',
    parking: 'Estacionamento',
    accessible: 'Acessível',
    pet_friendly: 'Pet Friendly',
    outdoor_seating: 'Área Externa',
    card_payment: 'Cartão',
    pix: 'PIX'
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Tags de Busca */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Tags de Busca</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Adicionar tag (ex: vegetariano, 24h...)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSearchTag()}
                  className="flex-1"
                />
                <Button onClick={addSearchTag} size="sm">
                  Adicionar
                </Button>
              </div>
              {filters.searchTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.searchTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X 
                        className="h-3 w-3 ml-1" 
                        onClick={() => removeSearchTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Categorias */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Categorias</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleArrayValue('categories', category)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Cidades */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Cidades</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {availableCities.map((city) => (
                  <div key={city} className="flex items-center space-x-2">
                    <Checkbox
                      id={`city-${city}`}
                      checked={filters.cities.includes(city)}
                      onCheckedChange={() => toggleArrayValue('cities', city)}
                    />
                    <Label htmlFor={`city-${city}`} className="text-sm">
                      {city}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Avaliação Mínima */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Avaliação Mínima: {filters.rating[0]} estrelas
              </Label>
              <Slider
                value={filters.rating}
                onValueChange={(value) => updateFilters('rating', value)}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 ★</span>
                <span>5 ★</span>
              </div>
            </div>

            {/* Faixa de Preço */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Faixa de Preço</Label>
              <Select value={filters.priceRange} onValueChange={(value) => updateFilters('priceRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a faixa de preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as faixas</SelectItem>
                  <SelectItem value="budget">$ - Econômico</SelectItem>
                  <SelectItem value="moderate">$$ - Moderado</SelectItem>
                  <SelectItem value="expensive">$$$ - Caro</SelectItem>
                  <SelectItem value="luxury">$$$$ - Luxo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Características */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Características</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableFeatures.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() => toggleArrayValue('features', feature)}
                    />
                    <Label htmlFor={`feature-${feature}`} className="text-sm">
                      {featureLabels[feature]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Filtros Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="open-now"
                  checked={filters.openNow}
                  onCheckedChange={(checked) => updateFilters('openNow', checked)}
                />
                <Label htmlFor="open-now" className="text-sm flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Aberto agora
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => updateFilters('verified', checked)}
                />
                <Label htmlFor="verified" className="text-sm flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Verificado
                </Label>
              </div>
            </div>

            {/* Distância (apenas se geolocalização estiver ativa) */}
            {showLocationFilters && (
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Distância máxima: {filters.distance[0]} km
                </Label>
                <Slider
                  value={filters.distance}
                  onValueChange={(value) => updateFilters('distance', value)}
                  max={50}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 km</span>
                  <span>50 km</span>
                </div>
              </div>
            )}

            {/* Ordenação */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Ordenar por</Label>
              <Select value={filters.sortBy} onValueChange={(value) => updateFilters('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ordenação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevância</SelectItem>
                  <SelectItem value="rating">Melhor avaliado</SelectItem>
                  <SelectItem value="distance">Distância</SelectItem>
                  <SelectItem value="newest">Mais recente</SelectItem>
                  <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
                  <SelectItem value="most_viewed">Mais visualizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AdvancedFiltersPanel;