
"use client";

import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center text-center bg-gray-100 dark:bg-gray-800">
           <Image
            src="https://placehold.co/1920x1080.png"
            alt="Pemandangan indah dari destinasi wisata di Indonesia"
            layout="fill"
            objectFit="cover"
            className="absolute -z-10 opacity-20"
            data-ai-hint="beautiful landscape Indonesia"
            priority
          />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg text-foreground">
              Temukan Perjalanan Impian Anda
            </h1>
            <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md text-foreground/80">
              Biarkan AI membantu Anda merencanakan petualangan tak terlupakan di seluruh Indonesia.
            </p>
            <Button asChild size="lg" className="text-lg py-7 px-8 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/search">
                Mulai Rencanakan Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

      </main>
      <AppFooter />
    </div>
  );
}
