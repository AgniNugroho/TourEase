"use client";

import { MountainSnow } from "lucide-react";
import Link from "next/link";

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 bg-primary/10 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <MountainSnow className="h-8 w-8" />
          <h1 className="text-3xl font-headline font-bold">TourEase</h1>
        </Link>
        <nav className="space-x-4">
          {/* Future navigation links can go here */}
          {/* Example: <Link href="/about" className="text-foreground hover:text-primary transition-colors">About</Link> */}
        </nav>
      </div>
    </header>
  );
}
