
"use client";

import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle as AlertCardTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export interface MapLocation {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  description: string;
}

interface InteractiveMapProps {
    locations: MapLocation[];
    isLoading: boolean;
}

export function InteractiveMap({ locations, isLoading }: InteractiveMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center flex items-center justify-center gap-2">
          <MapIcon className="h-6 w-6 text-primary" />
          Peta Destinasi Interaktif
        </CardTitle>
      </CardHeader>
      <CardContent>
          <Alert variant="destructive" className="text-center">
            <AlertTriangle className="h-5 w-5" />
            <AlertCardTitle className="font-headline text-xl">{title}</AlertCardTitle>
            <AlertDescription>{children}</AlertDescription>
          </Alert>
      </CardContent>
    </Card>
  );

  if (authFailed) {
    return (
      <ErrorDisplay title="Gagal Memuat Peta">
        <p className="mt-2 text-muted-foreground">
          Terjadi masalah otentikasi dengan Kunci API Google Maps Anda. Ini sering kali disebabkan karena penagihan belum diaktifkan untuk proyek Anda atau kunci API tidak valid.
        </p>
        <p className="mt-4 text-sm">
          Silakan periksa <a href="https://developers.google.com/maps/documentation/javascript/error-messages#deverrorcodes" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">dokumentasi Google</a> dan pastikan penagihan telah diaktifkan di Google Cloud Console.
        </p>
      </ErrorDisplay>
    );
  }

  if (!apiKey) {
    return (
      <ErrorDisplay title="Peta Tidak Tersedia">
         <p className="mt-2 text-muted-foreground">
          Kunci API Google Maps tidak dikonfigurasi. Harap atur variabel lingkungan NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
        </p>
      </ErrorDisplay>
    );
  }

  const indonesiaCenter = { lat: -2.5489, lng: 118.0149 };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary flex items-center justify-center gap-2">
            <MapIcon className="h-7 w-7" />
            Jelajahi Destinasi Populer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: "500px", width: "100%" }} className="rounded-lg overflow-hidden border-2 border-primary/50 shadow-inner relative">
          {isLoading ? (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg font-semibold text-primary">Memuat destinasi populer...</p>
            </div>
          ) : (
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={indonesiaCenter}
                defaultZoom={4.5}
                mapId="tourease_map"
                gestureHandling={'greedy'}
                disableDefaultUI={true}
              >
                {locations.map((location) => (
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
          )}
        </div>
        {!isLoading && (
            <p className="text-center mt-4 text-sm text-muted-foreground">
                Menampilkan {locations.length > 0 ? `${locations.length} destinasi paling populer` : "destinasi populer"}. Klik pada penanda untuk melihat info.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
