
"use client";

import { Heart } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="py-8 px-4 md:px-8 mt-12 bg-gray-100 dark:bg-gray-800 border-t border-border">
      <div className="container mx-auto text-center text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          Dibuat dengan <Heart className="h-4 w-4 text-red-500" /> oleh Tim TourEase
        </p>
        <p>&copy; {new Date().getFullYear()} TourEase. Hak cipta dilindungi.</p>
      </div>
    </footer>
  );
}
