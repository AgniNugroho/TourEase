
"use client";

import { MountainSnow, LogOut, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { createUserDocument, type UserProfileData } from "@/services/userService";
import { toast as sonnerToast } from "sonner";


export function AppHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userProfile: UserProfileData = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          providerId: currentUser.providerData[0]?.providerId ?? 'unknown',
        };
        try {
            await createUserDocument(userProfile);
        } catch (error) {
            console.error("Failed to ensure user document exists:", error);
            toast({ 
              variant: "destructive", 
              title: "Gagal menyinkronkan profil",
              description: "Tidak dapat membuat profil Anda di database. Beberapa fitur mungkin tidak berfungsi."
            });
        }
      }
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        toast({ title: "Berhasil Keluar", description: "Anda telah berhasil keluar." });
        router.push('/');
        router.refresh();
      } catch (error) {
        console.error("Logout error:", error);
        toast({ variant: "destructive", title: "Gagal Keluar", description: "Terjadi kesalahan saat mencoba keluar." });
      }
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  return (
    <header className="py-6 px-4 md:px-8 bg-primary/10 shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <MountainSnow className="h-8 w-8" />
          <h1 className="text-3xl font-headline font-bold">TourEase</h1>
        </Link>
        <nav className="flex items-center gap-2">
            {pathname !== "/search" && (
                 <Button asChild variant="ghost">
                    <Link href="/search">
                        <Search className="mr-2 h-4 w-4" />
                        Cari Destinasi
                    </Link>
                </Button>
            )}
          {isLoading ? (
             <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-auto p-1 flex items-center gap-2 focus-visible:ring-ring focus-visible:ring-2 rounded-full">
                   <span className="hidden sm:inline-flex items-center">
                      {user.displayName || "Pengguna"}
                   </span>
                  <div className="flex items-center gap-1">
                    <Avatar className="h-9 w-9 border-2 border-primary/50">
                      <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? "Avatar Pengguna"} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || "Pengguna"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <div className="space-x-2 flex items-center">
                <Button asChild variant="outline">
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Daftar</Link>
                </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
