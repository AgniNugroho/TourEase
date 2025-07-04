
"use client";

import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapIcon } from "lucide-react";

// Predefined popular locations in Indonesia with approximate coordinates
const popularIndonesianLocations = [
  { id: "jakarta", name: "Jakarta", position: { lat: -6.2088, lng: 106.8456 }, description: "Ibu kota Indonesia yang ramai." },
  { id: "bali", name: "Bali (Denpasar)", position: { lat: -8.6705, lng: 115.2126 }, description: "Terkenal dengan gunung berapi, sawah ikonik, pantai, dan terumbu karangnya." },
  { id: "yogyakarta", name: "Yogyakarta", position: { lat: -7.7956, lng: 110.3695 }, description: "Dikenal dengan seni tradisional dan warisan budayanya, rumah bagi candi Borobudur dan Prambanan." },
  { id: "rajaampat", name: "Kepulauan Raja Ampat", position: { lat: -0.5, lng: 130.5 }, description: "Gugusan pulau yang terdiri lebih dari 1.500 pulau kecil, yang terkenal dengan keanekaragaman hayati lautnya yang luar biasa." },
  { id: "bromo", name: "Gunung Bromo", position: { lat: -7.9425, lng: 112.9536 }, description: "Gunung berapi somma aktif dan bagian dari Taman Nasional Tengger Semeru." },
  { id: "komodo", name: "Taman Nasional Komodo", position: { lat: -8.5226, lng: 119.4889 }, description: "Rumah bagi komodo, kadal terbesar di dunia." }
];

export function InteractiveMap() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<(typeof popularIndonesianLocations[0]) | null>(null);
  const [authFailed, setAuthFailed] = useState(false);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      setApiKey(key);
    }
    
    // Define the global callback for Google Maps authentication failures
    (window as any).gm_authFailure = () => {
      setAuthFailed(true);
    };

    return () => {
      // Clean up the global callback when the component unmounts
      delete (window as any).gm_authFailure;
    };
  }, []);
  
  const ErrorDisplay = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center flex items-center justify-center gap-2">
          <MapIcon className="h-6 w-6 text-primary" />
          Peta Destinasi Interaktif
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center p-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold text-destructive">{title}</p>
          {children}
      </CardContent>
    </Card>
  );

  if (authFailed) {
    return (
      <ErrorDisplay title="Gagal Memuat Peta">
        <p className="text-muted-foreground">
          Terjadi masalah dengan Kunci API Google Maps Anda. Ini sering kali disebabkan karena penagihan belum diaktifkan untuk proyek Anda.
        </p>
        <p className="mt-4 text-sm">
          Silakan periksa <a href="https://developers.google.com/maps/documentation/javascript/error-messages#billing-not-enabled-map-error" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">dokumentasi Google</a> dan pastikan penagihan telah diaktifkan di Google Cloud Console.
        </p>
      </ErrorDisplay>
    );
  }

  if (!apiKey) {
    return (
      <ErrorDisplay title="Peta Tidak Tersedia">
        <p className="text-muted-foreground">
          Kunci API Google Maps tidak dikonfigurasi. Harap atur variabel lingkungan NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
        </p>
        <p className="mt-4 text-sm">Menampilkan representasi statis Indonesia untuk saat ini:</p>
        <img 
          src="https://placehold.co/800x400.png?text=Peta+Placeholder+Indonesia" 
          alt="Peta placeholder Indonesia" 
          className="mt-4 rounded-md shadow-md mx-auto"
          data-ai-hint="map Indonesia"
        />
      </ErrorDisplay>
    );
  }

  const indonesiaCenter = { lat: -2.5489, lng: 118.0149 };

  return (
    <Card className="mt-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary flex items-center justify-center gap-2">
            <MapIcon className="h-7 w-7" />
            Jelajahi Indonesia di Peta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: "500px", width: "100%" }} className="rounded-lg overflow-hidden border-2 border-primary/50 shadow-inner">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={indonesiaCenter}
              defaultZoom={4.5}
              mapId="tourease_map"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
            >
              {popularIndonesianLocations.map((location) => (
                <AdvancedMarker
                  key={location.id}
                  position={location.position}
                  onClick={() => setSelectedLocation(location)}
                >
                  <Pin 
                    background={'hsl(var(--primary))'} 
                    borderColor={'hsl(var(--primary-foreground))'} 
                    glyphColor={'hsl(var(--primary-foreground))'}
                  />
                </AdvancedMarker>
              ))}

              {selectedLocation && (
                <InfoWindow
                  position={selectedLocation.position}
                  onCloseClick={() => setSelectedLocation(null)}
                  maxWidth={250}
                >
                  <div className="p-2">
                    <h3 className="text-lg font-headline font-semibold text-primary mb-1">{selectedLocation.name}</h3>
                    <p className="text-sm text-foreground">{selectedLocation.description}</p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>
        <p className="text-center mt-4 text-sm text-muted-foreground">
            Klik pada penanda untuk melihat informasi lebih lanjut tentang destinasi populer.
        </p>
      </CardContent>
    </Card>
  );
}

