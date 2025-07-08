
"use client";

import { useState } from "react";
import Image from "next/image";
import type { PersonalizedDestinationOutput } from "@/ai/flows/personalized-destination-recommendation";
import { DestinationCard, type Destination } from "./destination-card";
import { Lightbulb, DollarSign, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DestinationListProps {
  destinations?: PersonalizedDestinationOutput["destinations"];
  onAskQuestion: (destinationName: string) => void;
}

export function DestinationList({ destinations, onAskQuestion }: DestinationListProps) {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const handleViewDetails = (destination: Destination) => {
    setSelectedDestination(destination);
  };

  const handleCloseDialog = () => {
    setSelectedDestination(null);
  };

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
    <>
      <div className="mt-12">
        <h2 className="text-4xl font-headline text-center mb-8 text-primary">Pilihan Destinasi untuk Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((dest, index) => (
            <DestinationCard
              key={index}
              destination={dest as Destination} // Cast as local Destination type
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      </div>

      {selectedDestination && (
        <Dialog open={!!selectedDestination} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-lg">
                <div className="relative w-full h-56 md:h-64">
                    <Image
                        src={selectedDestination.imageUrl || `https://placehold.co/600x400.png`}
                        alt={`Gambar dari ${selectedDestination.name}`}
                        layout="fill"
                        objectFit="cover"
                        className="w-full h-full"
                        data-ai-hint={selectedDestination.name.toLowerCase().split(" ").slice(0,2).join(" ")}
                    />
                </div>
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-3xl font-headline text-primary">{selectedDestination.name}</DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-4 max-h-[20vh] overflow-y-auto">
                    <DialogDescription className="text-base text-foreground">
                        {selectedDestination.description}
                    </DialogDescription>
                </div>
                <div className="px-6 pb-6">
                    <div className="flex items-center mt-4 text-lg p-3 rounded-lg bg-secondary/50">
                        <DollarSign className="w-5 h-5 mr-3 text-primary" />
                        <span className="font-semibold text-foreground">Kira-kira {selectedDestination.estimatedCost}</span>
                    </div>
                </div>
                <DialogFooter className="p-6 pt-4 border-t bg-muted/50">
                    <Button
                        onClick={() => {
                            onAskQuestion(selectedDestination.name);
                            handleCloseDialog();
                        }}
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                        <Info className="w-4 h-4 mr-2" />
                        Tanya Asisten AI
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
