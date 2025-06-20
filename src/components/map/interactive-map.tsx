"use client";

import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, MapIcon } from "lucide-react";

// Predefined popular locations in Indonesia with approximate coordinates
const popularIndonesianLocations = [
  { id: "jakarta", name: "Jakarta", position: { lat: -6.2088, lng: 106.8456 }, description: "The bustling capital city of Indonesia." },
  { id: "bali", name: "Bali (Denpasar)", position: { lat: -8.6705, lng: 115.2126 }, description: "Famous for its volcanic mountains, iconic rice paddies, beaches and coral reefs." },
  { id: "yogyakarta", name: "Yogyakarta", position: { lat: -7.7956, lng: 110.3695 }, description: "Known for its traditional arts and cultural heritage, home to Borobudur and Prambanan temples." },
  { id: "rajaampat", name: "Raja Ampat Islands", position: { lat: -0.5, lng: 130.5 }, description: "Archipelago comprising over 1,500 small islands, cays, and shoals, known for its incredible marine biodiversity." },
  { id: "bromo", name: "Mount Bromo", position: { lat: -7.9425, lng: 112.9536 }, description: "An active somma volcano and part of the Tengger Semeru National Park." },
  { id: "komodo", name: "Komodo National Park", position: { lat: -8.5226, lng: 119.4889 }, description: "Home to the Komodo dragon, the world's largest lizard." }
];

export function InteractiveMap() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<(typeof popularIndonesianLocations[0]) | null>(null);

  useEffect(() => {
    // In a real app, use environment variables.
    // For Next.js, it would be process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    // This is a placeholder to demonstrate.
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (key) {
      setApiKey(key);
    }
  }, []);

  if (!apiKey) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center flex items-center justify-center gap-2">
            <MapIcon className="h-6 w-6 text-primary" />
            Interactive Destination Map
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold text-destructive">Map Unavailable</p>
            <p className="text-muted-foreground">
              The Google Maps API key is not configured. Please set the NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.
            </p>
            <p className="mt-4 text-sm">Displaying a static representation of Indonesia for now:</p>
            <img 
              src="https://placehold.co/800x400.png?text=Map+of+Indonesia+Placeholder" 
              alt="Placeholder map of Indonesia" 
              className="mt-4 rounded-md shadow-md mx-auto"
              data-ai-hint="map Indonesia"
            />
        </CardContent>
      </Card>
    );
  }

  const indonesiaCenter = { lat: -2.5489, lng: 118.0149 }; // General center of Indonesia

  return (
    <Card className="mt-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary flex items-center justify-center gap-2">
            <MapIcon className="h-7 w-7" />
            Explore Indonesia on the Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: "500px", width: "100%" }} className="rounded-lg overflow-hidden border-2 border-primary/50 shadow-inner">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={indonesiaCenter}
              defaultZoom={4.5}
              mapId="tourease_map" // Optional: for custom styling in Google Cloud Console
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
            Click on a marker to see more information about popular destinations.
        </p>
      </CardContent>
    </Card>
  );
}
