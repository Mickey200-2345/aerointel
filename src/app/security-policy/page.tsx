"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane, Shield, Lock, Fingerprint, Network, ArrowLeft, Terminal, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SecurityPolicyPage() {
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
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive mb-2">
              <Shield className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">Security Policy</h1>
            <p className="max-w-[700px] text-muted-foreground text-lg">
              Technical defense-in-depth protocols protecting the global aviation supply chain.
            </p>
          </div>

          <div className="space-y-12">
            <section className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h2 className="text-2xl font-bold font-headline mb-4">Encryption Standards</h2>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  All data in transit and at rest is protected by military-grade cryptographic standards.
                </p>
              </div>
              <div className="md:col-span-2 grid gap-4">
                <Card className="border-none shadow-sm bg-secondary/20">
                  <CardContent className="pt-6 flex gap-4">
                    <Lock className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wider mb-1">AES-256-GCM</h3>
                      <p className="text-xs text-muted-foreground">Standard for data at rest across all tactical storage nodes.</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-secondary/20">
                  <CardContent className="pt-6 flex gap-4">
                    <Network className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wider mb-1">E2EE Satellite Tunnels</h3>
                      <p className="text-xs text-muted-foreground">End-to-End Encrypted channels for live telemetry from aircraft and cargo sensors.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-8 border-t pt-12">
              <div className="md:col-span-1">
                <h2 className="text-2xl font-bold font-headline mb-4">Access Control</h2>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  Zero Trust Architecture (ZTA) ensures every request is verified.
                </p>
              </div>
              <div className="md:col-span-2 grid gap-4">
                <Card className="border-none shadow-sm bg-secondary/20">
                  <CardContent className="pt-6 flex gap-4">
                    <Fingerprint className="h-6 w-6 text-accent shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Identity Federation</h3>
                      <p className="text-xs text-muted-foreground">Support for Google Workspace, Azure AD, and Okta via E2EE links.</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-secondary/20">
                  <CardContent className="pt-6 flex gap-4">
                    <Terminal className="h-6 w-6 text-accent shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wider mb-1">RBAC & Least Privilege</h3>
                      <p className="text-xs text-muted-foreground">Role-Based Access Control enforced at the edge, limiting data exposure to necessary personnel.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-destructive flex items-center justify-center">
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline">Tactical Node Security</h3>
                  <p className="text-xs text-destructive-foreground font-mono">NODE PROTECTION LEVEL: CRITICAL</p>
                </div>
              </div>
              <p className="text-sm opacity-80 leading-relaxed mb-6">
                AeroIntel utilizes Hardware Security Modules (HSMs) for key management. Private keys never leave the secure enclave of our tactical nodes. We perform real-time key rotation every 14 days or immediately upon detection of an anomaly.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold uppercase mb-1">DDoS Mitigation</p>
                  <p className="text-xs">Advanced L7 scrubbing for all global endpoints.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold uppercase mb-1">Audit Logging</p>
                  <p className="text-xs">Immutable session recording for all administrative actions.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold uppercase mb-1">Vulnerability Scan</p>
                  <p className="text-xs">Continuous 24/7 scanning of the intelligence node.</p>
                </div>
              </div>
            </section>
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
          <p className="text-xs text-muted-foreground">© {currentYear} AeroIntel Global Defense</p>
          <div className="flex gap-4">
            <Link href="/compliance" className="text-xs hover:underline">Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
