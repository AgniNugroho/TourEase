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

const budgetOptions = ["low", "medium", "high"];
const travelStyleOptions = ["solo", "family", "couple", "friends", "business"];

const preferenceFormSchema = z.object({
  budget: z.string().min(1, "Budget is required."),
  interests: z.string().min(3, "Please describe your interests (e.g., nature, culture, adventure)."),
  travelStyle: z.string().min(1, "Travel style is required."),
  location: z.string().min(2, "Your current location is required (e.g., city, country)."),
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
      travelStyle: "",
      location: "",
    },
  });

  const handleFormSubmit = (values: PreferenceFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-headline text-center text-primary">Plan Your Dream Trip to Indonesia!</CardTitle>
        <CardDescription className="text-center text-lg">
          Tell us your preferences, and our AI will find the perfect destinations for you.
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
                  <FormLabel className="text-lg">Budget</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your budget range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {budgetOptions.map((option) => (
                        <SelectItem key={option} value={option} className="capitalize">
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How much are you planning to spend?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Interests</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Beaches, Mountains, Historical sites, Culinary experiences, Wildlife..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What kind of activities or places are you interested in?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="travelStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Travel Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your travel style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {travelStyleOptions.map((option) => (
                        <SelectItem key={option} value={option} className="capitalize">
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Who are you traveling with?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Your Current Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jakarta, Indonesia or London, UK" {...field} />
                  </FormControl>
                  <FormDescription>
                    This helps us estimate travel costs.
                  </FormDescription>
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
              Find My Destinations
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
