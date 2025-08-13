import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface BusinessMapProps {
  latitude: number;
  longitude: number;
  businessName: string;
  address: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const BusinessMap = ({ latitude, longitude, businessName, address }: BusinessMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    loadGoogleApiKey();
  }, []);

  useEffect(() => {
    if (apiKey) {
      // Load Google Maps API if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [apiKey, latitude, longitude]);

  const loadGoogleApiKey = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-google-api-key');
      
      if (error) {
        console.error('Error loading Google API key:', error);
        return;
      }

      setApiKey(data.apiKey);
    } catch (error) {
      console.error('Error calling get-google-api-key function:', error);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const center = { lat: latitude, lng: longitude };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    // Add marker for the business
    const marker = new window.google.maps.Marker({
      position: center,
      map: mapInstanceRef.current,
      title: businessName,
      animation: window.google.maps.Animation.DROP
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${businessName}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">${address}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

    // Auto-open info window
    setTimeout(() => {
      infoWindow.open(mapInstanceRef.current, marker);
    }, 500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Localização</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg bg-muted flex items-center justify-center"
        >
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm">Carregando mapa...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessMap;