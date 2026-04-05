"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Plane, Zap, Lock, BarChart3, Globe, Loader2, CheckCircle2, Activity, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-cargo');
  const { toast } = useToast();
  
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: "", email: "", org: "" });
  const [currentYear, setCurrentYear] = useState<number>(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleBookDemo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDemoOpen(false);
      setDemoForm({ name: "", email: "", org: "" });
      toast({
        title: "Strategic Session Initiated",
        description: "An AeroIntel Account Manager will reach out via secure channel.",
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      <div className="tactical-grid opacity-40" />
      
      <header className="px-6 lg:px-12 h-20 flex items-center border-b bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-3" href="/">
          <div className="p-2 rounded-lg bg-primary shadow-lg shadow-primary/20">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground font-headline uppercase italic">AeroIntel</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-8 items-center mr-8">
          {["Features", "Security", "Compliance"].map((item) => (
            <Link 
              key={item}
              className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1" 
              href={item === "Features" ? "#features" : `/${item.toLowerCase().replace(' ', '-')}`}
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest px-6">Sign In</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 font-bold text-xs uppercase tracking-widest px-6 shadow-xl shadow-primary/20">
              Launch Console <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-48 flex justify-center relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <Badge variant="outline" className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">
                    Next-Gen Aviation Intelligence
                  </Badge>
                  <h1 className="text-5xl font-black tracking-tight sm:text-7xl xl:text-8xl/none font-headline uppercase leading-none">
                    Mission <span className="text-primary italic">Control</span> <br />
                    For Global Cargo.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl font-medium leading-relaxed">
                    The intelligence enclave for global logistics. Optimize load planning, detect cross-border anomalies, and predict demand with E2EE precision.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4">
                  <Link href="/dashboard">
                    <Button size="lg" className="px-10 h-14 bg-primary shadow-2xl shadow-primary/30 text-sm font-bold uppercase tracking-widest rounded-full">
                      Access Intelligence Hub
                    </Button>
                  </Link>
                  
                  <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="lg" className="px-10 h-14 border-primary text-primary hover:bg-primary/10 text-sm font-bold uppercase tracking-widest rounded-full group">
                        Book Strategic Demo <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] border-none shadow-2xl bg-card/95 backdrop-blur-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 font-headline text-2xl uppercase italic">
                          <div className="p-2 rounded-lg bg-primary/20"><Activity className="h-6 w-6 text-primary" /></div>
                          Demo Request
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                          Authorize a strategic consultation session with the AeroIntel Global Ops team.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleBookDemo} className="space-y-5 py-6">
                        <div className="space-y-2">
                          <Label htmlFor="demo-name" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Full Identity</Label>
                          <Input id="demo-name" placeholder="John Vane" required className="bg-secondary/50 border-none h-12 font-bold" value={demoForm.name} onChange={(e) => setDemoForm({...demoForm, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demo-email" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Secure Email</Label>
                          <Input id="demo-email" type="email" placeholder="john@globalops.com" required className="bg-secondary/50 border-none h-12 font-bold" value={demoForm.email} onChange={(e) => setDemoForm({...demoForm, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demo-org" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Organization Node</Label>
                          <Input id="demo-org" placeholder="Emirates SkyCargo" required className="bg-secondary/50 border-none h-12 font-bold" value={demoForm.org} onChange={(e) => setDemoForm({...demoForm, org: e.target.value})} />
                        </div>
                        <DialogFooter className="pt-6">
                          <Button type="submit" className="w-full bg-primary h-14 font-bold uppercase tracking-[0.2em]" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Shield className="h-5 w-5 mr-2" />}
                            Initialize Connection
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="relative group lg:block hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-white/50 shadow-2xl h-[500px]">
                  {heroImage && (
                    <Image
                      alt={heroImage.description}
                      className="w-full h-full object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-1000"
                      fill
                      src={heroImage.imageUrl}
                      data-ai-hint={heroImage.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 p-6 glass-morphism rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Asset Stream</span>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                        <span className="text-[10px] font-mono">LAT: 25.27 N / LNG: 55.29 E</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-primary animate-in slide-in-from-left duration-1000" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-32 bg-card relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-20">
              <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Core Intelligence</h2>
              <h3 className="text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">Tactical Operational Suite</h3>
            </div>
            <div className="grid max-w-6xl mx-auto gap-10 lg:grid-cols-3">
              {[
                { title: "Predictive Intelligence", desc: "AI-driven demand forecasting utilizing deep telemetry to eliminate fleet volumetric gaps.", icon: BarChart3 },
                { title: "3D Stability Hub", desc: "Military-grade tactical weight & balance engine for all aircraft from A350s to C-17s.", icon: Zap },
                { title: "Telemetry Fusion", desc: "Unified global asset tracking with high-res satellite mapping and real-time IoT sensors.", icon: Globe },
              ].map((f, i) => (
                <Card key={i} className="border-none bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-default">
                  <CardContent className="p-10 space-y-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                      <f.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase italic tracking-tight">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="w-full py-32 flex justify-center bg-background relative">
          <div className="scanline" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-20">
              <Badge variant="outline" className="px-4 py-1 bg-destructive/10 text-destructive border-destructive/20 font-bold uppercase tracking-widest text-[10px]">
                Defense-In-Depth Protocol
              </Badge>
              <h2 className="text-4xl font-black tracking-tighter sm:text-6xl uppercase italic">Hardened Tactical Enclave</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-xl font-medium italic">
                Protecting critical aviation infrastructure with Zero-Trust architecture and AES-256-GCM hardware encryption.
              </p>
            </div>
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-10">
                {[
                  { title: "Military-Grade Cryptography", desc: "End-to-End Encryption for all telemetry and message streams.", icon: Lock },
                  { title: "Identity Federation Node", desc: "Strict biometric and multifactor verification for all node requests.", icon: Shield },
                  { title: "IATA Compliance Ledger", desc: "Automated daily auditing against Cargo-XML and SOC2 Type II standards.", icon: CheckCircle2 },
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform shadow-inner">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black uppercase italic tracking-tight">{s.title}</h3>
                      <p className="text-muted-foreground text-sm font-medium leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-br from-primary to-accent opacity-10 rounded-3xl blur-2xl group-hover:opacity-20 transition duration-1000"></div>
                <Card className="border-none shadow-2xl bg-slate-950 text-white overflow-hidden relative rounded-3xl">
                  <div className="absolute inset-0 tactical-grid opacity-10" />
                  <div className="p-8 space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-1">Global Node Status</span>
                        <h4 className="font-black text-2xl uppercase tracking-tighter italic">ALPHA-7 TACTICAL</h4>
                      </div>
                      <div className="h-3 w-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_hsl(var(--primary))]" />
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: "ENCRYPTION LINK", value: "AES-256-GCM ACTIVE" },
                        { label: "SATELLITE SYNC", value: "LOCKED (99.9%)" },
                        { label: "AUDIT LEDGER", value: "IMMUTABLE SYNC" }
                      ].map((stat, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[9px] font-mono font-bold opacity-50 uppercase tracking-widest">
                            <span>{stat.label}</span>
                            <span className="text-primary">{stat.value}</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full bg-primary origin-left animate-in slide-in-from-left duration-1000 delay-${i * 200}`} style={{ width: i === 0 ? '100%' : i === 1 ? '92%' : '85%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-[10px] font-mono text-white/40 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                      "AeroIntel nodes perform real-time key rotation every 14 days. Any deviation from SOPs triggers immediate GSOC forensic isolation."
                    </p>
                    
                    <div className="pt-4 flex gap-3">
                      <Link href="/security-policy" className="flex-1">
                        <Button variant="outline" className="w-full h-10 text-[9px] font-bold uppercase tracking-widest border-white/10 text-white hover:bg-white/10 rounded-lg">Security Policy</Button>
                      </Link>
                      <Link href="/compliance" className="flex-1">
                        <Button variant="outline" className="w-full h-10 text-[9px] font-bold uppercase tracking-widest border-white/10 text-white hover:bg-white/10 rounded-lg">Compliance</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-4 sm:flex-row py-10 w-full shrink-0 items-center px-8 md:px-16 border-t bg-card relative z-10">
        <div className="flex items-center gap-3">
          <Plane className="h-5 w-5 text-primary opacity-50" />
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">© {currentYear} AeroIntel Enterprise | Tactical Logistics Nodes</p>
        </div>
        <nav className="sm:ml-auto flex gap-10">
          {["Compliance", "Security Policy", "Support", "Global Status"].map((link) => (
            <Link key={link} className="text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors underline-offset-8 hover:underline" href={`/${link.toLowerCase().replace(' ', '-')}`}>
              {link}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
