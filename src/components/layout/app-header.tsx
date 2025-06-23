
"use client";

import { MountainSnow } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="py-6 px-4 md:px-8 bg-primary/10 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <MountainSnow className="h-8 w-8" />
          <h1 className="text-3xl font-headline font-bold">TourEase</h1>
        </Link>
        <nav className="space-x-2 flex items-center">
          <Button asChild variant="outline">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Daftar</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
