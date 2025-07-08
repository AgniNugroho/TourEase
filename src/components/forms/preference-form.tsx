
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Search } from "lucide-react";
import type { PersonalizedDestinationInput } from "@/ai/flows/personalized-destination-recommendation";

const budgetOptions = [
  "Dibawah Rp 1.000.000",
  "Rp 1.000.000 - Rp 5.000.000",
  "Diatas Rp 5.000.000",
];
const numberOfPeopleOptions = [
  "1 orang",
  "2 orang",
  "3-5 orang",
  "Lebih dari 5 orang",
];

const preferenceFormSchema = z.object({
  budget: z.string().min(1, "Anggaran wajib diisi."),
  interests: z.string().min(3, "Silakan deskripsikan minat Anda."),
  numberOfPeople: z.string().min(1, "Jumlah orang wajib diisi."),
  location: z.string().min(2, "Lokasi Anda saat ini wajib diisi"),
});

type PreferenceFormValues = z.infer<typeof preferenceFormSchema>;

interface PreferenceFormProps {
  onSubmit: (data: PersonalizedDestinationInput) => Promise<void>;
  isLoading: boolean;
}

export function PreferenceForm({ onSubmit, isLoading }: PreferenceFormProps) {
  const form = useForm<PreferenceFormValues>({
    resolver: zodResolver(preferenceFormSchema),
    defaultValues: {
      budget: "",
      interests: "",
      numberOfPeople: "",
      location: "",
    },
  });

  const handleFormSubmit = (values: PreferenceFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary">Rencanakan Perjalanan Anda Bersama Kami!</CardTitle>
        <CardDescription className="text-center text-lg">
          Beri tahu kami preferensi Anda, dan AI kami akan menemukan destinasi sempurna untuk Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Anggaran</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih rentang anggaran Anda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {budgetOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Deskripsi Lokasi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=" "
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="numberOfPeople"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Jumlah Orang</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jumlah orang yang bepergian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {numberOfPeopleOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Lokasi Anda Saat Ini</FormLabel>
                  <FormControl>
                    <Input placeholder=" " {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full text-lg py-6" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Search className="mr-2 h-6 w-6" />
              )}
              Temukan Destinasimu
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
