import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LocationSearchProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
  }) => void;
  placeholder?: string;
  value?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const LocationSearch = ({ onLocationSelect, placeholder = "Digite um endereço...", value }: LocationSearchProps) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGoogleApiKey();
  }, []);

  useEffect(() => {
    if (apiKey) {
      // Load Google Maps API if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.onload = initializeAutocomplete;
        document.head.appendChild(script);
      } else {
        initializeAutocomplete();
      }
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey]);

  const loadGoogleApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-google-api-key');
      
      if (error) {
        console.error('Error loading Google API key:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a API do Google Maps",
          variant: "destructive"
        });
        return;
      }

      setApiKey(data.apiKey);
    } catch (error) {
      console.error('Error calling get-google-api-key function:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a API do Google Maps",
        variant: "destructive"
      });
    }
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'br' },
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
      }
    );

    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place.geometry) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar a localização",
        variant: "destructive"
      });
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    
    // Extract city and state from address components
    let city = "";
    let state = "";
    
    place.address_components?.forEach((component: any) => {
      if (component.types.includes('administrative_area_level_2')) {
        city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        state = component.short_name;
      }
    });

    setInputValue(place.formatted_address);
    
    onLocationSelect({
      address: place.formatted_address,
      lat,
      lng,
      city,
      state
    });
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Geolocalização não é suportada neste navegador",
        variant: "destructive"
      });
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results: any, status: any) => {
            setIsLoadingLocation(false);
            
            if (status === 'OK' && results[0]) {
              const result = results[0];
              
              // Extract city and state
              let city = "";
              let state = "";
              
              result.address_components?.forEach((component: any) => {
                if (component.types.includes('administrative_area_level_2')) {
                  city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                  state = component.short_name;
                }
              });

              setInputValue(result.formatted_address);
              
              onLocationSelect({
                address: result.formatted_address,
                lat: latitude,
                lng: longitude,
                city,
                state
              });
            } else {
              toast({
                title: "Erro",
                description: "Não foi possível obter o endereço atual",
                variant: "destructive"
              });
            }
          }
        );
      },
      (error) => {
        setIsLoadingLocation(false);
        toast({
          title: "Erro",
          description: "Não foi possível obter sua localização",
          variant: "destructive"
        });
      }
    );
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={getCurrentLocation}
        disabled={isLoadingLocation}
        className="flex-shrink-0"
      >
        {isLoadingLocation ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default LocationSearch;