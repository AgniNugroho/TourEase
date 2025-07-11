
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Loader2, MountainSnow } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

const loginFormSchema = z.object({
  email: z.string().email("Silakan masukkan alamat email yang valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.84-4.32 1.84-3.6 0-6.5-2.95-6.5-6.5s2.9-6.5 6.5-6.5c1.98 0 3.47.79 4.27 1.54l2.5-2.5C18.68 2.36 15.96 1 12.48 1 7.22 1 3.23 4.92 3.23 10.08s3.99 9.08 9.25 9.08c2.83 0 5.21-1 6.89-2.66 1.76-1.76 2.44-4.35 2.44-6.89v-.8H12.48z" />
    </svg>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Kesalahan Konfigurasi",
            description: "Firebase tidak dikonfigurasi. Fitur login dinonaktifkan.",
        });
        return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Berhasil Masuk",
        description: "Selamat datang kembali!",
      });
      router.push('/');
    } catch (error: any) {
      console.error("Login error:", error);
      let description = "Terjadi kesalahan yang tidak diketahui.";
       if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = "Email atau kata sandi salah. Silakan coba lagi.";
      }
      toast({
        variant: "destructive",
        title: "Gagal Masuk",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Kesalahan Konfigurasi",
        description: "Firebase tidak dikonfigurasi. Silakan periksa variabel lingkungan Anda.",
      });
      return;
    }
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Google sign in successful, user:", user);
      toast({
        title: "Berhasil Masuk",
        description: `Selamat datang kembali, ${user.displayName}!`,
      });
      router.push('/');
    } catch (error: any) {
      console.error("Google login error:", error);
      let description = "Terjadi kesalahan saat masuk dengan Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        description = "Jendela login ditutup sebelum otentikasi selesai."
      } else if (typeof error.message === 'string') {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Gagal Masuk",
        description: description,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
        <Link href="/" className="flex items-center gap-2 text-primary mb-8">
            <MountainSnow className="h-8 w-8" />
            <h1 className="text-3xl font-headline font-bold">TourEase</h1>
        </Link>
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center text-primary">Masuk</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="anda@contoh.com" {...field} disabled={!auth || isLoading || isGoogleLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kata Sandi</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={!auth || isLoading || isGoogleLoading}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full text-lg py-6" disabled={!auth || isLoading || isGoogleLoading}>
                  {isLoading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                  Masuk
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full text-lg py-6" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading || !auth}>
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-6 w-6" />
              )}
              Google
            </Button>
            
            {!auth && (
              <p className="mt-2 text-xs text-center text-destructive/80">
                Login tidak tersedia. Aplikasi belum terkonfigurasi sepenuhnya.
              </p>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Daftar
              </Link>
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
