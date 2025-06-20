"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Info } from "lucide-react";

export interface Destination {
  name: string;
  description: string;
  estimatedCost: string;
  imageUrl?: string; // Optional: if AI provides image URLs in future
  imageHint?: string; // For placeholder image generation
}

interface DestinationCardProps {
  destination: Destination;
  onAskQuestion: (destinationName: string) => void;
}

export function DestinationCard({ destination, onAskQuestion }: DestinationCardProps) {
  const placeholderImage = `https://placehold.co/600x400.png`;
  const imageAlt = `Image of ${destination.name}`;

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      <div className="relative w-full h-48 md:h-56">
        <Image
          src={destination.imageUrl || placeholderImage}
          alt={imageAlt}
          layout="fill"
          objectFit="cover"
          data-ai-hint={destination.imageHint || destination.name.toLowerCase().split(" ").slice(0,2).join(" ")}
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-headline text-primary">{destination.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-base line-clamp-4">{destination.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t">
        <Badge variant="secondary" className="text-sm py-1 px-3">
          <DollarSign className="w-4 h-4 mr-1" />
          {destination.estimatedCost}
        </Badge>
        <Button
            variant="outline"
            size="sm"
            onClick={() => onAskQuestion(destination.name)}
            aria-label={`Ask a question about ${destination.name}`}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Info className="w-4 h-4 mr-2" />
            Ask AI Assistant
        </Button>
      </CardFooter>
    </Card>
  );
}
