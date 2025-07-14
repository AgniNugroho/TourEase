
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Loader2, AlertTriangle, ShieldCheck, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers } from "@/services/userService";
import { getAllSearchHistories } from "@/services/historyService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface UserChartData {
    date: string;
    "Pengguna Baru": number;
}

interface InterestChartData {
    name: string;
    value: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];


export default function AdminPage() {
  const [userChartData, setUserChartData] = useState<UserChartData[]>([]);
  const [interestChartData, setInterestChartData] = useState<InterestChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  router = useRouter();
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
      const fetchAndProcessData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const [allUsers, allHistories] = await Promise.all([
            getAllUsers(),
            getAllSearchHistories()
          ]);
          
          // Process user data for line chart
          const dailyCounts = allUsers.reduce((acc, user) => {
            if (user.createdAt?.seconds) {
              const date = new Date(user.createdAt.seconds * 1000);
              const formattedDate = format(date, 'yyyy-MM-dd');
              acc[formattedDate] = (acc[formattedDate] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);

          const processedUserData = Object.entries(dailyCounts)
            .map(([date, count]) => ({
              date: format(new Date(date), "d MMM", { locale: id }),
              "Pengguna Baru": count
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          setUserChartData(processedUserData);

          // Process history data for pie chart
          const interestCounts = allHistories.reduce((acc, history) => {
             // Standardize the interest string: lowercase and trim whitespace
            const interest = history.input.interests.trim().toLowerCase();
            if(interest) {
              acc[interest] = (acc[interest] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>);
          
          const processedInterestData = Object.entries(interestCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort by most popular

          setInterestChartData(processedInterestData);


        } catch (err: any) {
          console.error("Error fetching or processing admin data:", err);
          const errorMessage = err.message || "Terjadi kesalahan yang tidak diketahui saat mengambil data.";
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
      fetchAndProcessData();
    } else {
        setIsLoading(false);
    }
  }, [isAuthorized, toast]);

  const memoizedPieChart = useMemo(() => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
        <RechartsTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
        />
        <Pie
            data={interestChartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            fill="hsl(var(--primary))"
        >
            {interestChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
        <Legend />
        </PieChart>
    </ResponsiveContainer>
  ), [interestChartData]);


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
          <h1 className="text-4xl font-headline text-center">Dasbor Admin</h1>
        </div>
        
        {error && (
            <Alert variant="destructive" className="my-4">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Oops! Terjadi kesalahan.</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {!error && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LineChartIcon /> Pertumbuhan Pengguna</CardTitle>
                        <CardDescription>Grafik pertumbuhan jumlah pengguna baru yang terdaftar per hari.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                           <ChartContainer config={{}} className="h-full w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={userChartData}
                                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
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
                                    <RechartsTooltip
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
                                        dot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))' }}
                                    />
                                </LineChart>
                             </ResponsiveContainer>
                           </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><PieChartIcon /> Tren Minat Pencarian</CardTitle>
                        <CardDescription>Distribusi minat pencarian dari semua pengguna.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {interestChartData.length > 0 ? (
                           <div className="h-[400px] w-full flex items-center justify-center">
                            {memoizedPieChart}
                           </div>
                        ) : (
                            <div className="flex items-center justify-center h-[400px]">
                                <p className="text-muted-foreground">Tidak ada data riwayat pencarian.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

