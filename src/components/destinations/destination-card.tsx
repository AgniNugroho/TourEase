
"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Info } from "lucide-react";

export interface Destination {
  name: string;
  description: string;
  estimatedCost: string;
  imageUrl?: string;
}

interface DestinationCardProps {
  destination: Destination;
  onAskQuestion: (destinationName: string) => void;
}

export function DestinationCard({ destination, onAskQuestion }: DestinationCardProps) {
  const placeholderImage = `https://placehold.co/600x400.png`;
  const imageAlt = `Gambar dari ${destination.name}`;

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      <div className="relative w-full h-48 md:h-56">
        <Image
          src={destination.imageUrl || placeholderImage}
          alt={imageAlt}
          layout="fill"
          objectFit="cover"
          data-ai-hint={destination.name.toLowerCase().split(" ").slice(0,2).join(" ")}
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-headline text-primary">{destination.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-base line-clamp-4">{destination.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t">
        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4 mr-1 text-primary" />
          <span>Kira-kira {destination.estimatedCost}</span>
        </div>
        <Button
            variant="outline"
            size="sm"
            onClick={() => onAskQuestion(destination.name)}
            aria-label={`Tanya pertanyaan tentang ${destination.name}`}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Info className="w-4 h-4 mr-2" />
            Tanya Asisten AI
        </Button>
      </CardFooter>
    </Card>
  );
}
