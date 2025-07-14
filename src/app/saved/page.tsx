
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DestinationCard, type Destination } from "@/components/destinations/destination-card";
import { Loader2, AlertTriangle, Info, Frown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Tag } from "lucide-react";

export default function SavedDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      // If firebase is not configured, redirect to login as this page is protected.
      router.push('/login');
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && db) {
      const fetchSavedDestinations = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const destinationsRef = collection(db, "users", user.uid, "savedDestinations");
          const q = query(destinationsRef, orderBy("savedAt", "desc"));
          const querySnapshot = await getDocs(q);
          const savedDests = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            name: doc.data().name,
            description: doc.data().description,
            estimatedCost: doc.data().estimatedCost,
            destinationType: doc.data().destinationType,
            // imageUrl is not saved, so we can leave it undefined.
          })) as Destination[];
          setDestinations(savedDests);
        } catch (err: any) {
          console.error("Error fetching saved destinations:", err);
          let errorMessage = "Terjadi kesalahan yang tidak diketahui saat mengambil data.";
          if (err.code === 'permission-denied') {
             errorMessage = "Anda tidak memiliki izin untuk melihat data ini. Pastikan aturan keamanan Firestore Anda sudah benar.";
          }
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Gagal Mengambil Data",
            description: errorMessage,
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchSavedDestinations();
    } else if (!user) {
        // This case handles when the user logs out on this page.
        // The auth state listener will redirect, but we also stop loading here.
        setIsLoading(false);
    }
  }, [user, toast]);
  
  const handleViewDetails = (destination: Destination) => {
    setSelectedDestination(destination);
  };

  const handleCloseDialog = () => {
    setSelectedDestination(null);
  };
  
  // Display a loading screen while auth is being checked or data is being fetched.
  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
        <Loader2 className="h-16 w-16 animate-spin mb-4" />
        <p className="text-xl font-headline">Memuat Destinasi Tersimpan...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-headline text-center mb-8 text-primary">Destinasi Tersimpan Anda</h1>
        
        {error && (
           <Alert variant="destructive" className="my-8 max-w-2xl mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline text-xl">Oops! Terjadi kesalahan.</AlertTitle>
            <AlertDescription>
              {error} Silakan coba lagi nanti.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && destinations.length === 0 && (
          <div className="text-center my-12">
             <Alert variant="default" className="max-w-md mx-auto bg-secondary/50">
                <Frown className="h-5 w-5" />
                <AlertTitle className="font-headline text-xl">Tidak Ada Destinasi Tersimpan</AlertTitle>
                <AlertDescription>
                    Anda belum menyimpan destinasi apa pun. Mulai cari dan simpan tempat favorit Anda!
                </AlertDescription>
            </Alert>
          </div>
        )}

        {!error && destinations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, index) => (
              <DestinationCard
                key={index}
                destination={dest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>
      <AppFooter />
      
      {selectedDestination && (
        <Dialog open={!!selectedDestination} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg">
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
               {selectedDestination.destinationType && (
                <div className="flex items-center pt-2">
                    <Badge variant="outline">{selectedDestination.destinationType}</Badge>
                </div>
              )}
            </DialogHeader>
            <div className="px-6 pb-4 max-h-[20vh] overflow-y-auto">
              <DialogDescription className="text-base text-foreground">
                {selectedDestination.description}
              </DialogDescription>
            </div>
            <div className="px-6 pb-6 space-y-3">
              <div className="flex items-center text-lg p-3 rounded-lg bg-secondary/50">
                <DollarSign className="w-5 h-5 mr-3 text-primary" />
                <span className="font-semibold text-foreground">{selectedDestination.estimatedCost}</span>
              </div>
            </div>
            <DialogFooter className="p-6 pt-4 border-t bg-muted/50">
              <Button
                onClick={handleCloseDialog}
                className="w-full"
                variant="outline"
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
