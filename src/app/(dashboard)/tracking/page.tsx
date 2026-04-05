"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Loader2, 
  Activity,
  Satellite,
  Search,
  Maximize2,
  X,
  Crosshair,
  CloudSun,
  Waves,
  Wind,
  Zap,
  Plane,
  Navigation,
  Signal,
  Gauge,
  Monitor,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Shipment {
  id: string;
  masterAirWaybillNumber: string;
  status: string;
  destinationLocationId: string;
  originIata?: string;
  destinationIata?: string;
  totalWeightKg: number;
  priority: string;
  type?: string;
  temperatureCelsius?: number;
  latitude?: number;
  longitude?: number;
  carrierCode?: string;
  altitudeFt?: number;
  speedKts?: number;
  heading?: number;
  squawk?: string;
}

const WeatherOverlay = () => (
  <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 w-48 animate-in fade-in slide-in-from-right-4">
    <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-primary/20">
      <h5 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
        <CloudSun className="h-3 w-3 text-primary" /> Land Domain
      </h5>
      <div className="flex justify-between items-center text-xs">
        <span>Temp</span>
        <span className="font-bold">24°C</span>
      </div>
      <div className="flex justify-between items-center text-xs mt-1">
        <span>Vis</span>
        <span className="text-primary font-bold">10km</span>
      </div>
    </div>
    <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-accent/20">
      <h5 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
        <Waves className="h-3 w-3 text-accent" /> Sea Domain
      </h5>
      <div className="flex justify-between items-center text-xs">
        <span>Waves</span>
        <span className="font-bold">1.2m</span>
      </div>
      <div className="flex justify-between items-center text-xs mt-1">
        <span>Current</span>
        <span className="text-accent font-bold">2.1kts</span>
      </div>
    </div>
    <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-destructive/20">
      <h5 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
        <Wind className="h-3 w-3 text-destructive" /> Air Domain
      </h5>
      <div className="flex justify-between items-center text-xs">
        <span>Wind</span>
        <span className="font-bold">45kts</span>
      </div>
      <div className="flex justify-between items-center text-xs mt-1">
        <span>Turb</span>
        <span className="text-destructive font-bold uppercase">Light</span>
      </div>
    </div>
  </div>
);

export default function TrackingPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const carrierFilter = searchParams.get('carrier');
  const querySearch = searchParams.get('search');
  
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [localSearch, setLocalSearch] = useState(querySearch || "");

  const [isSatelliteLocked, setIsSatelliteLocked] = useState(false);
  const [isAdsbActive, setIsAdsbActive] = useState(false);
  const [handshakeProgress, setHandshakeProgress] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shipmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "shipments"), limit(50));
  }, [firestore, user]);

  const { data: rawShipments, isLoading } = useCollection<Shipment>(shipmentsQuery);

  const shipments = useMemo(() => {
    if (!rawShipments) return [];
    return rawShipments.map(s => ({
      ...s,
      altitudeFt: s.status === 'In Transit' ? Math.floor(30000 + Math.random() * 8000) : 0,
      speedKts: s.status === 'In Transit' ? Math.floor(450 + Math.random() * 50) : 0,
      heading: Math.floor(Math.random() * 360),
      squawk: Math.floor(1000 + Math.random() * 8000).toString(),
      originIata: s.originIata || '---',
      destinationIata: s.destinationIata || '---'
    }));
  }, [rawShipments]);

  // Handle side-effects after handshake completion
  useEffect(() => {
    if (handshakeProgress === 100 && !isSatelliteLocked) {
      setIsSatelliteLocked(true);
      setIsAdsbActive(true);
      // Wait for next tick to avoid state-update warning
      setTimeout(() => {
        toast({
          title: "Global Handshake Verified",
          description: "Satellite Link and ADS-B protocols synchronized.",
        });
      }, 0);
    }
  }, [handshakeProgress, isSatelliteLocked, toast]);

  useEffect(() => {
    if (isClient && !isLoading && handshakeProgress < 100) {
      const timer = setInterval(() => {
        setHandshakeProgress(prev => Math.min(prev + 10, 100));
      }, 200);
      return () => clearInterval(timer);
    }
  }, [isClient, isLoading, handshakeProgress]);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const term = (querySearch || localSearch).toLowerCase();
      const carrierMatch = !carrierFilter || s.carrierCode?.toLowerCase() === carrierFilter.toLowerCase();
      const searchMatch = !term || 
        (s.masterAirWaybillNumber || "").toLowerCase().includes(term) || 
        (s.id || "").toLowerCase().includes(term) ||
        (s.originIata || "").toLowerCase().includes(term) ||
        (s.destinationIata || "").toLowerCase().includes(term);
      return carrierMatch && searchMatch;
    });
  }, [shipments, localSearch, carrierFilter, querySearch]);

  useEffect(() => {
    if (filteredShipments.length > 0 && (querySearch || localSearch) && !selectedShipmentId) {
      setSelectedShipmentId(filteredShipments[0].id);
    }
  }, [filteredShipments, querySearch, localSearch, selectedShipmentId]);

  const selectedShipment = useMemo(() => {
    return shipments?.find(s => s.id === selectedShipmentId) || null;
  }, [shipments, selectedShipmentId]);

  const mapUrl = useMemo(() => {
    if (!isClient) return "";
    const lat = selectedShipment?.latitude || 25.2769;
    const lng = selectedShipment?.longitude || 55.2962;
    const zoom = isExpanded ? 16 : 14;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&t=k&output=embed`;
  }, [selectedShipment, isExpanded, isClient]);

  const handleRefreshProtocols = useCallback(() => {
    setIsSatelliteLocked(false);
    setIsAdsbActive(false);
    setHandshakeProgress(0);
    toast({
      title: "Recalibrating Sensors",
      description: "Initiating global node re-sync...",
    });
  }, [toast]);

  if (!isClient) return null;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 relative z-10 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3 text-foreground">
              <Navigation className="h-8 w-8 text-primary" /> Live Radar Portal
            </h1>
            <p className="text-muted-foreground text-sm">Global Flight Information Region (FIR) Monitoring Node.</p>
          </div>
          {(carrierFilter || querySearch) && (
            <div className="flex gap-2">
              {carrierFilter && (
                <Badge variant="outline" className="h-10 px-4 bg-primary/10 text-primary border-primary/20 flex gap-2 items-center">
                  <X className="h-4 w-4 cursor-pointer" onClick={() => router.replace('/tracking')} />
                  Carrier: {carrierFilter.toUpperCase()}
                </Badge>
              )}
              {querySearch && (
                <Badge variant="outline" className="h-10 px-4 bg-accent/10 text-accent border-accent/20 flex gap-2 items-center">
                  <X className="h-4 w-4 cursor-pointer" onClick={() => router.replace('/tracking')} />
                  Search: {querySearch}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className={cn(
              "h-11 px-4 gap-3 transition-all duration-500 rounded-xl font-black text-[10px] uppercase tracking-widest",
              isSatelliteLocked ? "bg-primary/5 text-primary border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.1)]" : "bg-muted text-muted-foreground opacity-50"
            )}
            onClick={handleRefreshProtocols}
          >
            <Satellite className={cn("h-4 w-4", isSatelliteLocked && "animate-pulse")} />
            SATELLITE LINK: {isSatelliteLocked ? "LOCKED" : "CONNECTING..."}
          </Button>
          
          <Button 
            variant="outline"
            className={cn(
              "h-11 px-4 gap-3 transition-all duration-500 rounded-xl font-black text-[10px] uppercase tracking-widest",
              isAdsbActive ? "bg-accent/5 text-accent border-accent/20" : "bg-muted text-muted-foreground opacity-50"
            )}
            onClick={handleRefreshProtocols}
          >
            <Signal className={cn("h-4 w-4", isAdsbActive && "animate-pulse")} />
            Live ADS-B {isAdsbActive ? "Active" : "Scanning..."}
          </Button>
        </div>
      </div>

      <div className="flex-1 grid gap-6 lg:grid-cols-12 min-h-[600px]">
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden border rounded-2xl bg-card shadow-sm h-full">
          <div className="p-4 border-b bg-secondary/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5 text-primary" /> Live Traffic Ledger
              </h3>
              <span className="text-[10px] font-mono font-bold text-primary">{filteredShipments.length} AIRBORNE</span>
            </div>
            {handshakeProgress < 100 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-bold uppercase text-muted-foreground">
                  <span>Syncing FIR Ledger...</span>
                  <span>{handshakeProgress}%</span>
                </div>
                <Progress value={handshakeProgress} className="h-1" />
              </div>
            )}
          </div>
          <div className="px-4 pt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Filter by AWB / Flight..." 
                className="h-9 pl-8 text-xs bg-secondary/30 border-none rounded-xl" 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Initial Handshake...</p>
                </div>
              ) : filteredShipments.length > 0 ? (
                filteredShipments.map((s) => (
                  <div 
                    key={s.id} 
                    className={cn(
                      "p-4 cursor-pointer transition-colors hover:bg-muted/50 group",
                      selectedShipmentId === s.id ? "bg-primary/5 border-l-2 border-primary" : ""
                    )}
                    onClick={() => setSelectedShipmentId(s.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-lg bg-secondary",
                          selectedShipmentId === s.id && "bg-primary text-white"
                        )}>
                          <Plane className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">{s.masterAirWaybillNumber || s.id.slice(0, 8)}</p>
                          <p className="text-[9px] text-muted-foreground uppercase font-bold">{s.carrierCode || "UNKNOWN"}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-[8px] h-4 font-mono">{s.squawk || "7000"}</Badge>
                        <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="h-4 px-1 text-[8px] bg-primary/5 text-primary border-primary/20">{s.originIata}</Badge>
                        <span className="opacity-20">→</span>
                        <Badge variant="outline" className="h-4 px-1 text-[8px] bg-accent/5 text-accent border-accent/20">{s.destinationIata}</Badge>
                      </div>
                      <div className="text-right text-primary font-mono">
                        {s.altitudeFt ? `${(s.altitudeFt / 100).toFixed(0)} FL` : "GROUND"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-muted-foreground opacity-40">
                  <Search className="h-10 w-10 mx-auto mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No active traffic found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="lg:col-span-6 flex flex-col h-full min-h-[600px]">
          <div className="relative w-full h-full rounded-2xl overflow-hidden border shadow-2xl bg-slate-900 group">
            <div className="radar-sweep z-20" />
            
            {(isLoading || !isSatelliteLocked) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-slate-900/80 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-xs font-black text-primary uppercase tracking-[0.4em]">Establishing Orbital Link...</p>
                <p className="text-[10px] font-bold text-primary/40 uppercase mt-2 tracking-widest italic">Node: Global-West-7A</p>
              </div>
            ) : (
              <iframe
                src={mapUrl}
                className="absolute inset-0 w-full h-full border-0 grayscale-[20%] contrast-[110%] opacity-80 z-10"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
            
            <div className="absolute inset-0 bg-primary/5 pointer-events-none z-20" />
            
            {showWeather && <WeatherOverlay />}
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <div className="relative h-24 w-24 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
                <div className="h-full w-full border border-primary/30 rounded-full flex items-center justify-center">
                  <div className="h-1 w-1 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                  <Crosshair className="h-8 w-8 text-primary opacity-50 absolute" />
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
              <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-primary/20">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                  <Monitor className="h-3 w-3 text-primary" /> Command HUD
                </h5>
                <div className="text-[9px] font-mono space-y-1">
                  <p className="text-primary font-black">LAT: {selectedShipment?.latitude?.toFixed(4) || "25.2769"}</p>
                  <p className="text-primary font-black">LNG: {selectedShipment?.longitude?.toFixed(4) || "55.2962"}</p>
                  <p className="text-muted-foreground uppercase">SENSORS: {isSatelliteLocked ? "LOCKED" : "SCANNING..."}</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-30">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={showWeather ? "default" : "secondary"}
                  className="shadow-lg backdrop-blur-md text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl"
                  onClick={() => setShowWeather(!showWeather)}
                >
                  <CloudSun className="h-3 w-3 mr-2" /> WX DOMAIN
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="shadow-lg backdrop-blur-md text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl"
                  onClick={() => setIsExpanded(true)}
                >
                  <Maximize2 className="h-3 w-3 mr-2" /> FULL FIR VIEW
                </Button>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="bg-background/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-accent/20 min-w-[120px]">
                  <p className="text-[8px] font-black text-muted-foreground uppercase mb-1">Radar Signal</p>
                  <div className="flex items-center gap-2">
                    <Signal className={cn("h-3 w-3 text-accent", isAdsbActive && "animate-pulse")} />
                    <span className="text-xs font-black text-accent">{isAdsbActive ? "99.4% LKD" : "0.0% SYNC"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2">
          {selectedShipment ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-none shadow-lg overflow-hidden bg-card">
                <div className="bg-primary/10 p-5 border-b border-primary/20 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black italic uppercase tracking-tighter text-primary">{selectedShipment.masterAirWaybillNumber}</h3>
                    <Badge className="bg-accent text-white font-black text-[9px]">{selectedShipment.carrierCode}</Badge>
                  </div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">TRANSPONDER: {selectedShipment.squawk}</p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-secondary/50 border">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1.5"><Activity className="h-2.5 w-2.5" /> Altitude</p>
                      <p className="text-sm font-black text-primary font-mono">{selectedShipment.altitudeFt?.toLocaleString()} FT</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/50 border">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1.5"><Gauge className="h-2.5 w-2.5" /> Speed</p>
                      <p className="text-sm font-black text-accent font-mono">{selectedShipment.speedKts} KTS</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] opacity-60">Origin</span>
                        <span className="text-primary text-base italic">{selectedShipment.originIata}</span>
                      </div>
                      <Navigation className="h-4 w-4 rotate-90 text-primary opacity-20" />
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-[8px] opacity-60">Destination</span>
                        <span className="text-accent text-base italic">{selectedShipment.destinationIata}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">Path Progress</span>
                        <span className="text-[9px] font-bold text-primary">82% COMPLETE</span>
                      </div>
                      <Progress value={82} className="h-1.5" />
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={selectedShipment.status === 'In Transit' ? 'default' : 'secondary'} className="text-[9px] font-black italic">
                        {selectedShipment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className="text-muted-foreground">Payload</span>
                      <span className="text-primary">{selectedShipment.totalWeightKg.toLocaleString()} KG</span>
                    </div>
                  </div>

                  <Button className="w-full h-11 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 group">
                    INITIATE FORENSIC SYNC <Zap className="ml-2 h-3.5 w-3.5 fill-current group-hover:scale-110 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-2xl opacity-40">
              <Plane className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-sm font-black uppercase tracking-widest">Select Target</h3>
              <p className="text-[10px] text-muted-foreground mt-2 italic">Click an airborne node in the ledger or search for a specific flight path above.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden border-none bg-background/95 backdrop-blur-2xl">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 bg-primary/10 border-b flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg">
                  <Satellite className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-headline font-black italic uppercase tracking-tighter">Tactical Command Center</DialogTitle>
                  <DialogDescription className="text-[10px] uppercase tracking-widest font-black text-primary italic">Live Global FIR Radar View</DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="rounded-full h-10 w-10 hover:bg-primary/10">
                <X className="h-6 w-6" />
              </Button>
            </DialogHeader>
            <div className="flex-1 relative bg-slate-950">
              <div className="radar-sweep z-20 opacity-30" />
              <iframe
                src={mapUrl}
                className="absolute inset-0 w-full h-full border-0 grayscale-[10%] z-10"
                allowFullScreen
              />
              <div className="absolute inset-0 tactical-grid pointer-events-none opacity-20 z-20" />
              
              <div className="absolute top-8 right-8 z-30 space-y-4">
                <WeatherOverlay />
              </div>
              
              <div className="absolute bottom-8 left-8 z-30 p-6 glass-morphism rounded-2xl border-primary/20 min-w-[300px]">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Radar Summary</h4>
                <div className="space-y-3">
                  {selectedShipment ? (
                    <>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-white/60">CALLSIGN</span>
                        <span className="text-primary font-black">{selectedShipment.masterAirWaybillNumber}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-white/60">ALTITUDE</span>
                        <span className="text-primary font-black">{selectedShipment.altitudeFt?.toLocaleString()} FT</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-white/60">POSITION</span>
                        <span className="text-primary font-black">{selectedShipment.latitude?.toFixed(4)}N / {selectedShipment.longitude?.toFixed(4)}E</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] text-white/40 italic">Awaiting target lock...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}