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
          text: `Baik, saya siap menjawab pertanyaan tentang ${initialDestination}. Apa yang ingin Anda ketahui?`,
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
      const aiInput: AITravelAssistantInput = {
        destination: currentDestination,
        question: userMessage.text,
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
        { id: Date.now().toString() + '_ai_err', text: "Maaf, saya mengalami kesalahan. Silakan coba lagi.", sender: "ai" },
      ]);
      toast({
        variant: "destructive",
        title: "Kesalahan Asisten AI",
        description: "Tidak dapat memperoleh respons dari asisten AI.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const openChatWithDestination = (destinationName: string) => {
    setCurrentDestination(destinationName);
    setMessages([{
      id: Date.now().toString() + '_automsg_open',
      text: `Mari kita bicara tentang ${destinationName}. Apa yang ingin Anda tanyakan?`,
      sender: "ai"
    }]);
    setInputValue(""); // Clear previous input
    setIsOpen(true);
  };

  return (
    <>
      {!isOpen && (
         <Button
            onClick={() => {
              setCurrentDestination(""); 
              setMessages([]);
              setIsOpen(true);
            }}
            className="fixed bottom-6 right-6 rounded-full p-4 shadow-lg z-50 bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Buka Asisten Perjalanan AI"
            size="lg"
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="p-6 pb-2 border-b">
            <SheetTitle className="text-2xl font-headline text-primary flex items-center gap-2">
              <Bot className="h-7 w-7"/> Asisten Perjalanan AI
            </SheetTitle>
            <SheetDescription>
              Tanyakan apa saja tentang destinasi wisata di Indonesia!
              {currentDestination && <span className="block mt-1 text-sm text-primary">Saat ini fokus pada: <strong>{currentDestination}</strong></span>}
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
            <div className="flex w-full items-center gap-2">
              <Input
                type="text"
                placeholder={currentDestination ? `Tanya tentang ${currentDestination}...` : "Ketik pertanyaan Anda..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                className="flex-grow"
                disabled={isLoading}
                aria-label="Input obrolan"
              />
              <Button onClick={handleSendMessage} disabled={isLoading || inputValue.trim() === ""} aria-label="Kirim pesan">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
