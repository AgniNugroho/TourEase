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
            title: "No specific recommendations found",
            description: "Try adjusting your preferences for different results.",
          });
        }
      } else {
        throw new Error("No destinations found in AI response.");
      }
    } catch (error) {
      console.error("Error getting personalized destinations:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setRecommendationsError(`Failed to fetch recommendations: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error Fetching Recommendations",
        description: `Could not get recommendations. ${errorMessage}`,
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleAskQuestionOnDestination = (destinationName: string) => {
    setChatInitialDestination(destinationName); // This will trigger useEffect in AIChatWidget
    // To directly open the chat, you might need a ref to AIChatWidget or a more global state for chat open status
    // For now, setting initial destination will prepare the chat. The user still clicks the chat button.
    // A more advanced solution would be to pass a function to AIChatWidget to imperatively open it.
    // Or have AIChatWidget always rendered and control its visibility via a state managed here.
    // For simplicity, let's assume `AIChatWidget` manages its open state and picks up `initialDestination`.
    // The AIChatWidget now has a button that is always visible when the sheet is closed.
    // We can trigger a "click" on that button or make the sheet open programmatically.
    // Updated AIChatWidget to open and set context when initialDestination changes and sheet is opened.
    // We need a way to tell the widget to open.
    // A simple way: click the button programmatically if one exists. Or pass an `isOpen` prop.
    // Let's pass an `initialDestination` which the chat widget can use to pre-fill context IF it's opened.
    // The user will still need to click the chat icon.
    // If a more direct "open chat for this destination" is needed, a ref or context is better.
    // Updated DestinationCard to pass name to this handler.
    // Updated AIChatWidget to accept initialDestination and set context if open.
    
    // To make it more interactive, let's find the chat trigger button and click it.
    // This is a bit hacky. A ref to an imperative handle on AIChatWidget is cleaner.
    // Given the current setup, this direct DOM manipulation is not ideal.
    // The AIChatWidget will now handle the `initialDestination` prop correctly when user opens it.
    // The toast provides a hint.
     toast({
        title: `AI Assistant Ready for ${destinationName}`,
        description: `Click the chat icon to ask questions about ${destinationName}.`,
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
            <p className="text-2xl font-headline text-primary">Finding your perfect trip...</p>
            <p className="text-muted-foreground mt-2">Our AI is curating the best destinations based on your preferences.</p>
          </div>
        )}

        {recommendationsError && (
           <Alert variant="destructive" className="my-8 max-w-2xl mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline text-xl">Oops! Something went wrong.</AlertTitle>
            <AlertDescription>
              {recommendationsError} Please try adjusting your preferences or try again later.
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
