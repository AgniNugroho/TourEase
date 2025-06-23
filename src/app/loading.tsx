"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-primary">
      <Loader2 className="h-16 w-16 animate-spin mb-4" />
      <p className="text-xl font-headline">Memuat TourEase...</p>
    </div>
  );
}
