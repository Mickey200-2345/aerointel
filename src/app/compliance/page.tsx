"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane, ShieldCheck, FileCheck, Landmark, Globe, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CompliancePage() {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <Plane className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground font-headline">AeroIntel</span>
        </Link>
        <nav className="ml-auto flex gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none" />
        <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-12">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary mb-2">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Compliance Ledger</h1>
            <p className="max-w-[700px] text-muted-foreground text-lg">
              AeroIntel maintains the highest standards of regulatory compliance for global aviation logistics and data sovereignty.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Landmark className="h-6 w-6 text-primary" />
                  <CardTitle className="font-headline text-xl">Aviation Standards</CardTitle>
                </div>
                <CardDescription>Industry-specific protocols for cargo data exchange.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <FileCheck className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <p><span className="font-bold text-foreground">IATA Cargo-XML:</span> Full support for messaging standards to enable seamless interoperability with airlines and freight forwarders.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <FileCheck className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <p><span className="font-bold text-foreground">ICAO Annex 17:</span> Compliance with international security measures for air cargo and mail protection.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-6 w-6 text-accent" />
                  <CardTitle className="font-headline text-xl">Data Sovereignty</CardTitle>
                </div>
                <CardDescription>Global data protection and privacy regulations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <ShieldCheck className="h-4 w-4 text-accent mt-1 shrink-0" />
                  <p><span className="font-bold text-foreground">GDPR & CCPA:</span> Rigorous privacy controls and data subject rights management for all personnel and operational data.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                  <ShieldCheck className="h-4 w-4 text-accent mt-1 shrink-0" />
                  <p><span className="font-bold text-foreground">SOC2 Type II:</span> Continuous auditing of security, availability, and confidentiality across our entire cloud infrastructure.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 p-8 rounded-3xl bg-primary text-primary-foreground">
            <h2 className="text-2xl font-bold mb-4 font-headline flex items-center gap-3">
              <Landmark className="h-6 w-6" /> Strategic Auditing
            </h2>
            <p className="mb-6 opacity-90 leading-relaxed">
              AeroIntel nodes are subject to automated daily compliance checks. Any deviation from standard operating procedures (SOPs) triggers an immediate forensic analysis by our Global Security Operation Center (GSOC).
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/20">ISO 27001 Certified</div>
              <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/20">HIPAA Compliant Nodes</div>
              <div className="px-4 py-2 bg-white/10 rounded-full text-xs font-bold border border-white/20">IATA Cargo iQ Partner</div>
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Intelligence Portal
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t bg-card">
        <div className="container px-4 flex justify-between items-center mx-auto max-w-5xl">
          <p className="text-xs text-muted-foreground">© {currentYear} AeroIntel Compliance Bureau</p>
          <div className="flex gap-4">
            <Link href="/security-policy" className="text-xs hover:underline">Security Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
