
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
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile, type User } from "firebase/auth";
import { createUserDocument } from "@/services/userService";

const registerFormSchema = z.object({
  name: z.string().min(2, "Nama lengkap wajib diisi."),
  email: z.string().email("Silakan masukkan alamat email yang valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isFirebaseConfigured = !!auth;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });

  const handleRegisterSubmit = async (values: RegisterFormValues) => {
    if (!isFirebaseConfigured) {
      toast({
        variant: "destructive",
        title: "Kesalahan Konfigurasi",
        description: "Firebase tidak dikonfigurasi. Fitur registrasi dinonaktifkan.",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      await updateProfile(userCredential.user, { displayName: values.name });
      
      const userWithDisplayName = { ...userCredential.user, displayName: values.name };

      await createUserDocument(userWithDisplayName as User);
      
      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah berhasil dibuat. Silakan masuk.",
      });
      router.push("/login");

    } catch (error: any) {
      console.error("Registration error:", error);
      let description = "Terjadi kesalahan yang tidak diketahui.";
      if (error.code === 'auth/email-already-in-use') {
        description = "Alamat email ini sudah terdaftar.";
      }
      toast({
        variant: "destructive",
        title: "Gagal Mendaftar",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center container mx-auto px-4 py-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-center text-primary">Buat Akun</CardTitle>
            <CardDescription className="text-center text-lg">
              Bergabunglah dengan TourEase untuk mulai merencanakan perjalanan Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegisterSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama Anda" {...field} disabled={!isFirebaseConfigured || isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="anda@contoh.com" {...field} disabled={!isFirebaseConfigured || isLoading} />
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
                        <Input type="password" placeholder="••••••••" {...field} disabled={!isFirebaseConfigured || isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} disabled={!isFirebaseConfigured || isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full text-lg py-6" disabled={!isFirebaseConfigured || isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                  Daftar
                </Button>
              </form>
            </Form>
             {!isFirebaseConfigured && (
              <p className="mt-4 text-xs text-center text-destructive/80">
                Registrasi tidak tersedia. Aplikasi belum terkonfigurasi sepenuhnya.
              </p>
            )}
             <p className="mt-6 text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Masuk
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
