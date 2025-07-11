
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Loader2, AlertTriangle, Users, ShieldCheck, Mail, Calendar, KeyRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, type UserProfileData } from "@/services/userService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfileData[]>([]);
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
      const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const allUsers = await getAllUsers();
          setUsers(allUsers);
        } catch (err: any) {
          console.error("Error fetching users:", err);
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
      fetchUsers();
    } else {
        setIsLoading(false);
    }
  }, [isAuthorized, toast]);

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Tidak diketahui';
    // Firebase Timestamps can be either on the server (as an object) or client (as a Date object after retrieval)
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID');
    }
    if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('id-ID');
    }
    return 'Format tidak valid';
  };

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
                <CardTitle className="flex items-center gap-2"><Users /> Daftar Pengguna</CardTitle>
                <CardDescription>Berikut adalah daftar semua pengguna yang terdaftar di TourEase.</CardDescription>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pengguna</TableHead>
                                <TableHead><Mail className="inline-block h-4 w-4 mr-1" /> Email</TableHead>
                                <TableHead><KeyRound className="inline-block h-4 w-4 mr-1" /> Penyedia</TableHead>
                                <TableHead><Calendar className="inline-block h-4 w-4 mr-1" /> Tanggal Bergabung</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={u.photoURL ?? ""} />
                                                <AvatarFallback>{getInitials(u.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{u.displayName || 'Tidak ada nama'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.providerId.includes('google') ? 'destructive' : 'secondary'}>
                                            {u.providerId}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatTimestamp(u.createdAt)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
