"use client";

import { useState, useRef } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { PreferenceForm } from "@/components/forms/preference-form";
import { DestinationList } from "@/components/destinations/destination-list";
import { InteractiveMap } from "@/components/map/interactive-map";
import { AIChatWidget } from "@/components/chat/ai-chat-widget";
import { getPersonalizedDestinations, type PersonalizedDestinationInput, type PersonalizedDestinationOutput } from "@/ai/flows/personalized-destination-recommendation";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HomePage() {
  const [recommendations, setRecommendations] = useState<PersonalizedDestinationOutput["destinations"] | undefined>(undefined);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  
  const [chatInitialDestination, setChatInitialDestination] = useState<string | undefined>(undefined);
  const chatWidgetRef = useRef<{ openChatWithDestination: (destinationName: string) => void }>(null);


  const { toast } = useToast();

  const handlePreferencesSubmit = async (data: PersonalizedDestinationInput) => {
    setIsLoadingRecommendations(true);
    setRecommendationsError(null);
    setRecommendations(undefined); // Clear previous recommendations
    try {
      const result = await getPersonalizedDestinations(data);
      if (result && result.destinations) {
        setRecommendations(result.destinations);
        if (result.destinations.length === 0) {
           toast({
            title: "Tidak ada rekomendasi spesifik yang ditemukan",
            description: "Coba sesuaikan preferensi Anda untuk hasil yang berbeda.",
          });
        }
      } else {
        throw new Error("No destinations found in AI response.");
      }
    } catch (error) {
      console.error("Error getting personalized destinations:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setRecommendationsError(`Gagal mengambil rekomendasi: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Gagal Mengambil Rekomendasi",
        description: `Tidak dapat mengambil rekomendasi. ${errorMessage}`,
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleAskQuestionOnDestination = (destinationName: string) => {
    setChatInitialDestination(destinationName); 
     toast({
        title: `Asisten AI Siap untuk ${destinationName}`,
        description: `Klik ikon obrolan untuk mengajukan pertanyaan tentang ${destinationName}.`,
      });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section id="planner" className="mb-16">
          <PreferenceForm onSubmit={handlePreferencesSubmit} isLoading={isLoadingRecommendations} />
        </section>

        {isLoadingRecommendations && (
          <div className="flex flex-col items-center justify-center text-center my-12 p-8 rounded-lg bg-card shadow-md">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <p className="text-2xl font-headline text-primary">Mencari perjalanan sempurna Anda...</p>
            <p className="text-muted-foreground mt-2">AI kami sedang menyusun destinasi terbaik berdasarkan preferensi Anda.</p>
          </div>
        )}

        {recommendationsError && (
           <Alert variant="destructive" className="my-8 max-w-2xl mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline text-xl">Oops! Terjadi kesalahan.</AlertTitle>
            <AlertDescription>
              {recommendationsError} Silakan coba sesuaikan preferensi Anda atau coba lagi nanti.
            </AlertDescription>
          </Alert>
        )}

        {recommendations && !isLoadingRecommendations && (
          <section id="recommendations" className="my-12">
            <DestinationList destinations={recommendations} onAskQuestion={handleAskQuestionOnDestination} />
          </section>
        )}
        
        {(recommendations === undefined && !isLoadingRecommendations && !recommendationsError) && (
           <div className="mt-8 text-center py-10">
             {/* Placeholder for initial state or when form hasn't been submitted yet */}
           </div>
        )}

        <Separator className="my-16" />

        <section id="map" className="mb-16">
          <InteractiveMap />
        </section>
      </main>
      
      <AIChatWidget initialDestination={chatInitialDestination} />
      <AppFooter />
    </div>
  );
}
