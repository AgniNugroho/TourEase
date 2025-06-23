"use client";

import type { PersonalizedDestinationOutput } from "@/ai/flows/personalized-destination-recommendation";
import { DestinationCard, type Destination } from "./destination-card";
import { AlertCircle, Lightbulb } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DestinationListProps {
  destinations?: PersonalizedDestinationOutput["destinations"];
  onAskQuestion: (destinationName: string) => void;
}

export function DestinationList({ destinations, onAskQuestion }: DestinationListProps) {
  if (!destinations || destinations.length === 0) {
    return (
      <div className="mt-8 text-center">
        <Alert variant="default" className="max-w-md mx-auto bg-secondary/50">
          <Lightbulb className="h-5 w-5" />
          <AlertTitle className="font-headline text-xl">Belum Ada Rekomendasi</AlertTitle>
          <AlertDescription>
            Isi formulir preferensi di atas untuk mendapatkan ide destinasi wisata yang dipersonalisasi!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-4xl font-headline text-center mb-8 text-primary">Destinasi Personalisasi Anda</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((dest, index) => (
          <DestinationCard
            key={index}
            destination={dest as Destination} // Cast as local Destination type
            onAskQuestion={onAskQuestion}
          />
        ))}
      </div>
    </div>
  );
}
