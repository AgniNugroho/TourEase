
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Loader2, AlertTriangle, Users, ShieldCheck, LineChart as LineChartIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, type UserProfileData } from "@/services/userService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ChartData {
    date: string;
    "Pengguna Baru": number;
}

export default function AdminPage() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email === 'admin@tourease.com') {
          setIsAuthorized(true);
        } else {
          toast({
            variant: "destructive",
            title: "Akses Ditolak",
            description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
          });
          router.push('/');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  useEffect(() => {
    if (isAuthorized) {
      const fetchAndProcessUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const allUsers = await getAllUsers();
          
          const dailyCounts = allUsers.reduce((acc, user) => {
            if (user.createdAt?.seconds) {
              const date = new Date(user.createdAt.seconds * 1000);
              const formattedDate = format(date, 'yyyy-MM-dd');
              acc[formattedDate] = (acc[formattedDate] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          const processedData = Object.entries(dailyCounts)
            .map(([date, count]) => ({
              date: format(new Date(date), "d MMM", { locale: id }),
              "Pengguna Baru": count
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setChartData(processedData);

        } catch (err: any) {
          console.error("Error fetching or processing users:", err);
          const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui saat mengambil data pengguna.";
          setError(errorMessage);
          toast({
            variant: "destructive",
            title: "Gagal Mengambil Data Pengguna",
            description: errorMessage,
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchAndProcessUsers();
    } else {
        setIsLoading(false);
    }
  }, [isAuthorized, toast]);


  if (!isAuthorized || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
        <Loader2 className="h-16 w-16 animate-spin mb-4" />
        <p className="text-xl font-headline">Memuat Panel Admin...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 mb-8 text-primary">
          <ShieldCheck className="h-10 w-10" />
          <h1 className="text-4xl font-headline text-center">Panel Admin</h1>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChartIcon /> Pengguna Aktif</CardTitle>
                <CardDescription>Grafik pertumbuhan jumlah pengguna baru yang terdaftar per hari.</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="my-4">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle>Oops! Terjadi kesalahan.</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!error && (
                    <div className="h-[400px] w-full">
                       <ChartContainer config={{}} className="h-full w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: -10,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    content={
                                      <ChartTooltipContent
                                        labelClassName="text-sm"
                                        className="bg-card/80 backdrop-blur-sm"
                                      />
                                    }
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="Pengguna Baru" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={2}
                                    dot={{
                                        r: 4,
                                        fill: 'hsl(var(--primary))',
                                        stroke: 'hsl(var(--card))'
                                    }}
                                />
                            </LineChart>
                         </ResponsiveContainer>
                       </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
