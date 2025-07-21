
"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ImageIcon } from "lucide-react";

export interface Destination {
  name: string;
  description: string;
  estimatedCost: string;
  destinationType: string;
  imageUrl?: string;
}

interface DestinationCardProps {
  destination: Destination;
  onViewDetails: (destination: Destination) => void;
}

export function DestinationCard({ destination, onViewDetails }: DestinationCardProps) {
  const imageAlt = `Gambar dari ${destination.name}`;
  const isDataUri = destination.imageUrl?.startsWith('data:');

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      <div className="relative w-full h-48 md:h-56 bg-muted/50 flex items-center justify-center">
        {destination.imageUrl && !destination.imageUrl.includes('placehold.co') ? (
            <Image
              src={destination.imageUrl}
              alt={imageAlt}
              layout="fill"
              objectFit="cover"
              unoptimized={isDataUri}
              data-ai-hint={destination.name.toLowerCase().split(" ").slice(0,2).join(" ")}
            />
        ) : (
            <div className="flex flex-col items-center text-muted-foreground">
                <ImageIcon className="h-12 w-12" />
                <p className="mt-2 text-sm">Gambar tidak tersedia</p>
            </div>
        )}
         {destination.destinationType && (
            <Badge variant="secondary" className="absolute top-2 right-2 shadow-md">
                {destination.destinationType}
            </Badge>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-headline text-primary">{destination.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-base line-clamp-4">{destination.description}</CardDescription>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => onViewDetails(destination)}
            aria-label={`Lihat lebih lanjut tentang ${destination.name}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Lihat
        </Button>
      </CardFooter>
    </Card>
  );
}
