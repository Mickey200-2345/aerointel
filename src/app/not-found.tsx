"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane, Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
          <Plane className="h-7 w-7 rotate-45" />
        </div>
        <span className="text-3xl font-bold font-headline tracking-tighter">AeroIntel</span>
      </div>

      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-secondary opacity-50">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <AlertCircle className="h-20 w-20 text-destructive animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-headline">Navigation Lost</h2>
          <p className="text-muted-foreground">
            The flight path you requested does not exist. The page might have been moved, deleted, or entered incorrectly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <Home className="h-4 w-4 mr-2" /> Return to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
              Back to Landing
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-20 text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        System Active: Route Recovery Mode
      </div>
    </div>
  );
}
