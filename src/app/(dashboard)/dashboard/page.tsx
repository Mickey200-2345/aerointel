"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Package, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Building2, 
  Loader2, 
  Activity, 
  Globe, 
  Shield, 
  ArrowUpRight, 
  Zap,
  Satellite,
  Signal,
  Search,
  Navigation,
  ChevronRight,
  Briefcase,
  Layers
} from "lucide-react";
import { OperationalInsights } from "@/components/dashboard/operational-insights";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function DashboardOverview() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shipmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "shipments");
  }, [firestore, user]);

  const anomaliesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "anomalyAlerts"), limit(20));
  }, [firestore, user]);

  const { data: shipments, isLoading: isShipmentsLoading } = useCollection(shipmentsQuery);
  const { data: alerts, isLoading: isAlertsLoading } = useCollection(anomaliesQuery);

  const stats = useMemo(() => [
    { title: "Tactical Payload", value: shipments?.length?.toString() || "0", sub: "Active Assets", change: "+12.5%", trend: "up", icon: Package, loading: isShipmentsLoading, color: "text-primary", href: "/tracking" },
    { title: "Dispatch Reliability", value: "94.2%", sub: "On-Time Performance", change: "+2.1%", trend: "up", icon: Clock, color: "text-accent", href: "/airlines" },
    { title: "Global Fleet", value: "42", sub: "Active Flights", change: "-3", trend: "down", icon: Plane, color: "text-primary", href: "/airlines" },
    { title: "Operational Flags", value: (alerts || []).filter((a: any) => a.status === 'new').length?.toString() || "0", sub: "Pending Resolution", change: "-2", trend: "up", icon: AlertTriangle, loading: isAlertsLoading, color: "text-destructive", href: "/anomalies" },
  ], [shipments, alerts, isShipmentsLoading, isAlertsLoading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/tracking?search=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Global Intelligence Node</h2>
          </div>
          <h1 className="text-4xl font-black tracking-tight font-headline uppercase italic">Strategic <span className="text-primary">Overview</span></h1>
          <p className="text-muted-foreground font-medium max-w-xl">Real-time fusion of cargo telemetry, fleet logistics, and predictive anomaly logic from the live system.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="px-4 py-2 bg-primary/5 text-primary border-primary/20 flex gap-2 items-center rounded-xl font-black text-[10px] tracking-widest shadow-sm">
              <Satellite className="h-3 w-3 animate-pulse" /> SATELLITE LINK: LOCKED
            </Badge>
            <Badge variant="outline" className="px-4 py-2 bg-accent/5 text-accent border-accent/20 flex gap-2 items-center rounded-xl font-black text-[10px] tracking-widest shadow-sm">
              <Signal className="h-3 w-3 animate-pulse" /> Live ADS-B Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className="shadow-2xl border-none glass-morphism overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            onClick={() => router.push(stat.href)}
          >
            <div className={`h-1.5 w-full bg-primary/10 group-hover:bg-primary transition-colors`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black font-headline italic flex items-center gap-3">
                {stat.loading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : stat.value}
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-2">{stat.sub}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5 border border-primary/10">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-primary" />
                  ) : (
                    <TrendingUp className="h-3 w-3 text-destructive rotate-180" />
                  )}
                  <span className={`text-[10px] font-black ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                  View Node <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-none shadow-2xl glass-morphism overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-white/10 flex flex-row items-center justify-between py-6">
            <div className="space-y-1">
              <CardTitle className="font-headline font-black text-xl uppercase italic tracking-tighter flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary fill-primary" /> AI Operational Analysis
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Strategic Telemetry Fusion Layer</CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase">Live Cloud Sync</span>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <OperationalInsights />
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl glass-morphism overflow-hidden">
            <CardHeader className="py-6 border-b border-white/10 bg-primary/5">
              <CardTitle className="font-headline font-black text-sm uppercase italic tracking-widest flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" /> Tactical Target Search
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 h-4 w-4 text-primary animate-pulse" />
                  <Input 
                    placeholder="Enter AWB or Callsign..." 
                    className="pl-10 bg-secondary/30 border-none h-12 font-bold text-xs uppercase tracking-widest focus-visible:ring-primary/20"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-primary font-black uppercase text-[10px] tracking-widest h-11 shadow-lg shadow-primary/20">
                  LOCK ON RADAR <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="mt-4 text-[9px] text-muted-foreground italic text-center font-medium">
                Connects directly to the Global FIR node for immediate asset tracking.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-2xl group transition-all"
              onClick={() => router.push('/load-trim')}
            >
              <Layers className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-widest">3D Stability</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 border-accent/20 hover:bg-accent/5 hover:border-accent/40 rounded-2xl group transition-all"
              onClick={() => router.push('/baggage')}
            >
              <Briefcase className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-widest">Baggage Tracer</span>
            </Button>
          </div>

          <Card className="border-none shadow-2xl bg-slate-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
            <CardHeader className="py-6 border-b border-white/5 relative z-10">
              <CardTitle className="font-headline font-black text-sm uppercase italic tracking-widest flex items-center gap-2 text-primary">
                <Shield className="h-4 w-4 fill-primary" /> Tactical Flag Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative z-10 space-y-4">
              {isAlertsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                </div>
              ) : alerts && alerts.length > 0 ? (
                alerts.slice(0, 3).map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group" onClick={() => router.push('/anomalies')}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-destructive shadow-[0_0_10px_red]' : 'bg-primary shadow-[0_0_10px_blue]'}`} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-tight truncate text-white/90">{alert.alertType || "Anomaly Detected"}</span>
                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest mt-0.5">REF: {alert.id?.slice(0, 8)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 pl-4">
                      <Badge variant="outline" className={`text-[8px] h-4 font-black uppercase border-white/10 ${alert.severity === 'critical' ? 'text-destructive' : 'text-primary'}`}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-30">
                  <Package className="h-10 w-10 mx-auto mb-3" />
                  <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Active Flags</p>
                </div>
              )}
              <Button 
                variant="ghost" 
                className="w-full h-10 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-white/5 mt-2 rounded-lg text-primary"
                onClick={() => router.push('/anomalies')}
              >
                View Forensic Ledger <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
