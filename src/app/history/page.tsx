
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Loader2, AlertTriangle, Frown, History, ChevronsRight, Eye, ChevronRight, Bookmark } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getSearchHistory, type SearchHistoryEntry } from "@/services/historyService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { DestinationList } from "@/components/destinations/destination-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function HistoryPage() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<SearchHistoryEntry | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
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
    if (user) {
      const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const searchHistory = await getSearchHistory(user.uid);
          setHistory(searchHistory);
        } catch (err: any) {
          console.error("Error fetching search history:", err);
          const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui saat mengambil data.";
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Gagal Mengambil Riwayat",
            description: errorMessage,
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    }
  }, [user, toast]);
  
  const handleViewDetails = (entry: SearchHistoryEntry) => {
    setSelectedHistoryEntry(entry);
  };
  
  const handleCloseDialog = () => {
    setSelectedHistoryEntry(null);
  };

  const handleAskQuestion = (destinationName: string) => {
    // This could be enhanced to open the chat widget, for now, we just toast
    toast({
      title: "Asisten AI",
      description: `Buka Asisten AI untuk bertanya tentang ${destinationName}`,
    });
  };

  if (isLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
        <Loader2 className="h-16 w-16 animate-spin mb-4" />
        <p className="text-xl font-headline">Memuat Riwayat Pencarian...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8 text-primary">
          <History className="h-10 w-10" />
          <h1 className="text-4xl font-headline text-center">Riwayat Pencarian Anda</h1>
        </div>
        
        {error && (
           <Alert variant="destructive" className="my-8 max-w-2xl mx-auto">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-headline text-xl">Oops! Terjadi kesalahan.</AlertTitle>
            <AlertDescription>{error} Silakan coba lagi nanti.</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && history.length === 0 && (
          <div className="text-center my-12">
             <Alert variant="default" className="max-w-md mx-auto bg-secondary/50">
                <Frown className="h-5 w-5" />
                <AlertTitle className="font-headline text-xl">Belum Ada Riwayat</AlertTitle>
                <AlertDescription>
                    Anda belum melakukan pencarian apa pun. Mulai rencanakan perjalanan Anda!
                </AlertDescription>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/search">Cari Destinasi</Link>
                </Button>
            </Alert>
          </div>
        )}

        {!error && history.length > 0 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {history.map((entry) => (
              <Card key={entry.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center text-primary">
                    <span>Pencarian pada {entry.searchedAt ? new Date(entry.searchedAt.seconds * 1000).toLocaleString('id-ID') : 'Tanggal tidak diketahui'}</span>
                    <Badge variant="secondary">{entry.destinations.length} Rekomendasi</Badge>
                  </CardTitle>
                  <CardDescription>
                    Pencarian berdasarkan minat: <span className="font-semibold text-foreground">{entry.input.interests}</span> dari <span className="font-semibold text-foreground">{entry.input.location}</span>.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => handleViewDetails(entry)} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Hasil Pencarian
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <AppFooter />
      
      {selectedHistoryEntry && (
        <Dialog open={!!selectedHistoryEntry} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="text-3xl font-headline text-primary">Detail Riwayat Pencarian</DialogTitle>
              <DialogDescription>
                Hasil pencarian dari {selectedHistoryEntry.searchedAt ? new Date(selectedHistoryEntry.searchedAt.seconds * 1000).toLocaleString('id-ID') : 'N/A'}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 overflow-hidden">
                <aside className="col-span-1 bg-muted/50 p-6 border-r flex flex-col">
                   <h3 className="text-xl font-headline mb-4">Preferensi Anda</h3>
                   <div className="space-y-3 text-sm">
                       <p><strong>Anggaran:</strong> {selectedHistoryEntry.input.budget}</p>
                       <p><strong>Minat:</strong> {selectedHistoryEntry.input.interests}</p>
                       <p><strong>Jumlah Orang:</strong> {selectedHistoryEntry.input.numberOfPeople}</p>
                       <p><strong>Lokasi:</strong> {selectedHistoryEntry.input.location}</p>
                   </div>
                   <Separator className="my-6" />
                   <div className="mt-auto">
                        <Button variant="outline" className="w-full" onClick={() => router.push('/search')}>
                           <History className="mr-2 h-4 w-4" />
                           Lakukan Pencarian Baru
                        </Button>
                   </div>
                </aside>
                <main className="col-span-2 overflow-y-auto">
                  <div className="p-6">
                    <DestinationList 
                        user={user} 
                        destinations={selectedHistoryEntry.destinations} 
                        onAskQuestion={handleAskQuestion} 
                    />
                  </div>
                </main>
            </div>
             <DialogFooter className="p-4 border-t bg-muted/20">
              <Button onClick={handleCloseDialog} variant="outline">Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
