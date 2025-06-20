"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, User, Bot, Loader2, Info } from "lucide-react";
import type { AITravelAssistantInput, AITravelAssistantOutput } from "@/ai/flows/ai-travel-assistant";
import { aiTravelAssistant } from "@/ai/flows/ai-travel-assistant";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  destination?: string;
}

interface AIChatWidgetProps {
  initialDestination?: string;
}

export function AIChatWidget({ initialDestination }: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentDestination, setCurrentDestination] = useState(initialDestination || "");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if(initialDestination) {
      setCurrentDestination(initialDestination);
      if (isOpen) {
         setMessages(prev => [...prev, {
          id: Date.now().toString() + '_automsg',
          text: `Okay, I'm ready to answer questions about ${initialDestination}. What would you like to know?`,
          sender: "ai"
        }]);
      }
    }
  }, [initialDestination, isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      destination: currentDestination,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      let destinationToQuery = currentDestination;
      let question = userMessage.text;

      // Simple check if user specifies a destination in the query
      const destMatch = userMessage.text.match(/about ([\w\s]+)[?,.]/i);
      if (destMatch && destMatch[1]) {
        destinationToQuery = destMatch[1].trim();
        // Optional: remove "about [destination]" from question if needed for cleaner processing by AI
        // question = question.replace(destMatch[0], "").trim(); 
      }
      
      if (!destinationToQuery) {
         setMessages((prevMessages) => [
          ...prevMessages,
          { id: Date.now().toString() + '_ai_err', text: "Please specify a destination you'd like to ask about, or select one from the recommendations.", sender: "ai" },
        ]);
        setIsLoading(false);
        return;
      }

      const aiInput: AITravelAssistantInput = {
        destination: destinationToQuery,
        question: question,
      };
      const aiResponse: AITravelAssistantOutput = await aiTravelAssistant(aiInput);

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString() + '_ai', text: aiResponse.answer, sender: "ai" },
      ]);
    } catch (error) {
      console.error("Error calling AI Travel Assistant:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString() + '_ai_err', text: "Sorry, I encountered an error. Please try again.", sender: "ai" },
      ]);
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: "Could not get a response from the AI assistant.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const openChatWithDestination = (destinationName: string) => {
    setCurrentDestination(destinationName);
    setMessages([{
      id: Date.now().toString() + '_automsg_open',
      text: `Let's talk about ${destinationName}. What would you like to ask?`,
      sender: "ai"
    }]);
    setInputValue(""); // Clear previous input
    setIsOpen(true);
  };
  
  // Expose method to parent if needed, or use prop drilling / context for complex scenarios
  // For this example, if `DestinationCard` calls a function passed from page.tsx which then calls this, it's fine.
  // This specific implementation detail depends on how `onAskQuestion` is wired in parent.
  // Here, we assume `initialDestination` prop handles this.

  return (
    <>
      {/* This button can be placed anywhere, e.g., fixed on page */}
      {!isOpen && (
         <Button
            onClick={() => {
              setCurrentDestination(""); // Reset destination when opening fresh
              setMessages([]);
              setIsOpen(true);
            }}
            className="fixed bottom-6 right-6 rounded-full p-4 shadow-lg z-50 bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Open AI Travel Assistant"
            size="lg"
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="p-6 pb-2 border-b">
            <SheetTitle className="text-2xl font-headline text-primary flex items-center gap-2">
              <Bot className="h-7 w-7"/> AI Travel Assistant
            </SheetTitle>
            <SheetDescription>
              Ask me anything about Indonesian travel destinations!
              {currentDestination && <span className="block mt-1 text-sm text-primary">Currently focusing on: <strong>{currentDestination}</strong></span>}
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    message.sender === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-3 text-sm shadow ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                  {message.sender === "user" && (
                     <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-accent text-accent-foreground"><User size={18}/></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
                  </Avatar>
                  <div className="max-w-[70%] rounded-xl px-4 py-3 text-sm shadow bg-muted text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <SheetFooter className="p-6 pt-2 border-t">
            {!currentDestination && (
               <div className="text-xs text-muted-foreground p-2 rounded-md bg-muted flex items-center gap-2 w-full mb-2">
                 <Info size={16} /> Tip: You can ask about a specific place by typing "Tell me about [destination name]..."
               </div>
            )}
            <div className="flex w-full items-center gap-2">
              <Input
                type="text"
                placeholder={currentDestination ? `Ask about ${currentDestination}...` : "Type your question..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                className="flex-grow"
                disabled={isLoading}
                aria-label="Chat input"
              />
              <Button onClick={handleSendMessage} disabled={isLoading || inputValue.trim() === ""} aria-label="Send message">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
