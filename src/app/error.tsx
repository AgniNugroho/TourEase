"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-destructive p-4">
      <AlertTriangle className="h-16 w-16 mb-4" />
      <h1 className="text-4xl font-headline mb-2">Something went wrong!</h1>
      <p className="text-lg text-center mb-6 max-w-md">
        We encountered an unexpected issue. Please try again.
      </p>
      <p className="text-sm text-muted-foreground mb-4">Error: {error.message}</p>
      <Button
        onClick={() => reset()}
        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
      >
        Try again
      </Button>
    </div>
  );
}
