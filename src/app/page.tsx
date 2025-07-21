
"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { InteractiveMap, type MapLocation } from "@/components/map/interactive-map";
import { getTopRecommendedDestinations } from "@/services/historyService";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [topDestinations, setTopDestinations] = useState<MapLocation[]>([]);
  const [isMapDataLoading, setIsMapDataLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      // If firebase is not configured, we can't check auth, so we redirect.
      router.push('/login');
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  {/*}
  useEffect(() => {
    const fetchTopDestinations = async () => {
      setIsMapDataLoading(true);
      try {
        const destinations = await getTopRecommendedDestinations();
        setTopDestinations(destinations);
      } catch (error) {
        console.error("Failed to fetch top destinations:", error);
        toast({
          variant: "destructive",
          title: "Gagal memuat destinasi populer",
          description: "Tidak dapat mengambil data untuk peta interaktif karena masalah izin atau koneksi."
        });
        // Set to empty array on error to prevent broken map state
        setTopDestinations([]);
      } finally {
        setIsMapDataLoading(false);
      }
    };

    if (user) {
        fetchTopDestinations();
    }
  }, [toast, user]);
  */}

  if (isAuthLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
        <Loader2 className="h-16 w-16 animate-spin mb-4" />
        <p className="text-xl font-headline">Memuat Halaman Utama...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center text-center">
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg text-foreground">
              Temukan Perjalanan Impian Anda
            </h1>
            <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md text-foreground/80">
              Biarkan AI membantu Anda merencanakan petualangan tak terlupakan di seluruh Indonesia.
            </p>
            <Button asChild size="lg" className="text-lg py-7 px-8 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/search">
                Mulai Rencanakan Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Interactive Map Section
        <section className="container mx-auto px-4 py-12">
            <InteractiveMap locations={topDestinations} isLoading={isMapDataLoading} />
        </section>
        */}
      </main>
      <AppFooter />
    </div>
  );
}
