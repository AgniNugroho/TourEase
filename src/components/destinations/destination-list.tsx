
"use client";

import { useState } from "react";
import Image from "next/image";
import type { PersonalizedDestinationOutput } from "@/ai/flows/personalized-destination-recommendation";
import { DestinationCard, type Destination } from "./destination-card";
import { DollarSign, Info, Bookmark, Loader2, Tag, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { generateDestinationImage } from "@/ai/flows/destination-image-generation";

interface DestinationListProps {
  destinations?: PersonalizedDestinationOutput["destinations"];
  onAskQuestion: (destinationName: string) => void;
  user: User | null;
}

export function DestinationList({ destinations, onAskQuestion, user }: DestinationListProps) {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (destination: Destination) => {
    setSelectedDestination(destination);
  };

  const handleCloseDialog = () => {
    setSelectedDestination(null);
  };
  
  const handleSaveDestination = async () => {
    if (!user || !selectedDestination) return;

    setIsSaving(true);
    try {
        if (!db) {
            throw new Error("Penyimpanan gagal: basis data tidak dikonfigurasi.");
        }
        
        const docId = selectedDestination.name.replace(/\//g, '_');
        const destinationRef = doc(db, "users", user.uid, "savedDestinations", docId);
        
        // Initially, save the destination with text data and a timestamp.
        const destinationToSave = {
            ...selectedDestination,
            savedAt: serverTimestamp(),
            imageUrl: selectedDestination.imageUrl || null, // save current image or null
        };
        await setDoc(destinationRef, destinationToSave, { merge: true });

        toast({
            title: "Destinasi Disimpan!",
            description: `${selectedDestination.name} telah ditambahkan. Membuat gambar...`,
        });
        
        handleCloseDialog();

        // Now, generate the image and update the document. This happens in the background.
        try {
            const imageResponse = await generateDestinationImage({
                name: selectedDestination.name,
                destinationType: selectedDestination.destinationType,
            });

            if (imageResponse.imageUrl) {
                 await setDoc(destinationRef, {
                    imageUrl: imageResponse.imageUrl,
                }, { merge: true });

                 toast({
                    title: "Gambar Dibuat!",
                    description: `Gambar untuk ${selectedDestination.name} berhasil dibuat dan disimpan.`,
                });
            }
        } catch (imageError) {
             console.error("Error generating/updating image:", imageError);
             toast({
                variant: "destructive",
                title: "Gagal Membuat Gambar",
                description: `Tidak dapat membuat gambar untuk ${selectedDestination.name}.`,
            });
        }
    } catch (error: any) {
        console.error("Error saving destination to Firestore:", error);
        let description = "Terjadi kesalahan saat menyimpan destinasi. Silakan coba lagi.";
        
        if (error.code) {
            switch (error.code) {
                case 'permission-denied':
                    description = "Izin ditolak. Pastikan aturan keamanan Firestore Anda telah diterapkan dan mengizinkan penulisan.";
                    break;
                default:
                    description = `Terjadi kesalahan Firebase: ${error.message} (kode: ${error.code})`;
            }
        } else if (error instanceof Error) {
            description = error.message;
        }

        toast({
            variant: "destructive",
            title: "Gagal Menyimpan",
            description: description,
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <>
      <div className="mt-12">
        <h2 className="text-4xl font-headline text-center mb-8 text-primary">Pilihan Destinasi untuk Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations?.map((dest, index) => (
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
            <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
                <div className="relative w-full h-56 md:h-64 bg-secondary flex items-center justify-center">
                    {selectedDestination.imageUrl ? (
                        <Image
                            src={selectedDestination.imageUrl}
                            alt={`Gambar dari ${selectedDestination.name}`}
                            layout="fill"
                            objectFit="cover"
                            className="w-full h-full"
                            data-ai-hint={selectedDestination.name.toLowerCase().split(" ").slice(0,2).join(" ")}
                        />
                    ) : (
                       <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-16 w-16" />
                            <p className="mt-2 text-sm font-medium">Gambar akan dibuat saat disimpan.</p>
                        </div>
                    )}
                </div>
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-3xl font-headline text-primary">{selectedDestination.name}</DialogTitle>
                </DialogHeader>
                <div className="px-6 pb-4 max-h-[20vh] overflow-y-auto">
                    <DialogDescription className="text-base text-foreground">
                        {selectedDestination.description}
                    </DialogDescription>
                </div>
                <div className="px-6 pb-6 space-y-3">
                    {selectedDestination.destinationType && (
                        <div className="flex items-center text-md p-3 rounded-lg bg-secondary/30">
                            <Tag className="w-5 h-5 mr-3 text-primary" />
                            <span className="font-medium text-foreground/90">Tipe: {selectedDestination.destinationType}</span>
                        </div>
                    )}
                    <div className="flex items-center text-lg p-3 rounded-lg bg-secondary/50">
                        <DollarSign className="w-5 h-5 mr-3 text-primary" />
                        <span className="font-semibold text-foreground">{selectedDestination.estimatedCost}</span>
                    </div>
                </div>
                <DialogFooter className="p-6 pt-4 border-t bg-muted/50 flex-col sm:flex-row sm:justify-end gap-2">
                    <Button
                        onClick={() => {
                            onAskQuestion(selectedDestination.name);
                            handleCloseDialog();
                        }}
                        className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                        <Info className="w-4 h-4 mr-2" />
                        Tanya Asisten AI
                    </Button>
                    <Button
                        onClick={handleSaveDestination}
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                        variant="outline"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Bookmark className="w-4 h-4 mr-2" />
                        )}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
