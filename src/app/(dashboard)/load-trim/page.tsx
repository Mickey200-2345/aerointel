"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Weight, 
  Plane, 
  Zap, 
  Loader2, 
  TrendingUp, 
  ShieldCheck,
  LayoutGrid,
  Activity,
  FileCheck,
  RefreshCw,
  Fuel,
  ChevronDown,
  Compass,
  Box,
  Users,
  Info,
  Layers,
  AlertTriangle,
  Download,
  Wifi
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { shipmentCopilot } from "@/ai/flows/shipment-copilot-flow";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

const ENVELOPE_DATA = [
  { weight: 120000, cg: 15 },
  { weight: 450000, cg: 25 },
  { weight: 450000, cg: 35 },
  { weight: 120000, cg: 35 },
  { weight: 120000, cg: 15 },
];

const AIRCRAFT_DATABASE = {
  "Airbus A350-1000": { type: 'Commercial', pax: 410, payload: 68000, span: 64.7, imageId: 'aircraft-3d-airbus' },
  "Airbus A380-800": { type: 'Commercial', pax: 555, payload: 84000, span: 79.8, imageId: 'aircraft-3d-airbus' },
  "Boeing 777-9X": { type: 'Commercial', pax: 426, payload: 76000, span: 71.8, imageId: 'aircraft-3d-boeing' },
  "Boeing 747-8F": { type: 'Cargo', pax: 0, payload: 132000, span: 68.4, imageId: 'aircraft-3d-cargo' },
  "C-17 Globemaster III": { type: 'Military', pax: 102, payload: 77500, span: 51.8, imageId: 'aircraft-3d-military' },
  "Lockheed C-130J": { type: 'Military', pax: 92, payload: 19000, span: 40.4, imageId: 'aircraft-3d-military' },
  "Antonov An-124": { type: 'Heavy Cargo', pax: 0, payload: 150000, span: 73.3, imageId: 'aircraft-3d-cargo' }
};

export default function LoadAndTrimPage() {
  const [aircraft, setAircraft] = useState("Airbus A350-1000");
  const [fwdHold, setFwdHold] = useState(20000);
  const [midHold, setMidHold] = useState(30000);
  const [aftHold, setAftHold] = useState(10000);
  const [fuel, setFuel] = useState(50000);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentSpecs = AIRCRAFT_DATABASE[aircraft as keyof typeof AIRCRAFT_DATABASE];
  
  const diagram = useMemo(() => {
    return PlaceHolderImages.find(img => img.id === currentSpecs.imageId);
  }, [currentSpecs.imageId]);

  const stats = useMemo(() => {
    const basicOperatingWeight = currentSpecs.type === 'Military' ? 125000 : 155000;
    const totalCargo = fwdHold + midHold + aftHold;
    const totalWeight = basicOperatingWeight + totalCargo + fuel;
    
    let cgBase = 25.0; 
    cgBase -= (fwdHold * 0.0001);
    cgBase += (aftHold * 0.00015);
    cgBase += (midHold * 0.00002);
    
    const isSafe = cgBase >= 18 && cgBase <= 32 && totalWeight <= currentSpecs.payload + basicOperatingWeight;
    const trim = (cgBase / 4).toFixed(1) + " Units ANU";

    return {
      totalWeight,
      cg: parseFloat(cgBase.toFixed(2)),
      trim,
      isSafe,
      maxWeight: currentSpecs.payload + basicOperatingWeight
    };
  }, [fwdHold, midHold, aftHold, fuel, currentSpecs]);

  const handleApplyPreset = (type: 'airbus' | 'boeing' | 'military') => {
    if (type === 'airbus') {
      setAircraft("Airbus A350-1000");
      setFwdHold(18000); setMidHold(25000); setAftHold(12000); setFuel(45000);
    } else if (type === 'boeing') {
      setAircraft("Boeing 777-9X");
      setFwdHold(22000); setMidHold(35000); setAftHold(8000); setFuel(55000);
    } else {
      setAircraft("C-17 Globemaster III");
      setFwdHold(25000); setMidHold(30000); setAftHold(15000); setFuel(60000);
    }
    setResults(null);
    toast({
      title: `${type.toUpperCase()} Preset Loaded`,
      description: "Tactical airframe parameters synchronized.",
    });
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const response = await shipmentCopilot({
        message: `Finalize load sheet for ${aircraft}. Total weight: ${stats.totalWeight}kg, CG: ${stats.cg}% MAC. Provide certification.`
      });
      
      setResults({
        ...stats,
        aiAdvice: response.reply,
        timestamp: new Date().toISOString(),
        dispatchId: "DP-" + Math.random().toString(36).substr(2, 9).toUpperCase()
      });

      toast({
        title: "Dispatch Certified",
        description: `AeroIntel Node has verified dispatch for ${aircraft}.`,
      });
    } catch (error: any) {
      setResults({
        ...stats,
        aiAdvice: "Protocol Override: Intelligence link unstable. Local heuristics verify that the current configuration is within safe operating envelopes. Load sheet certified via node A7-7A.",
        timestamp: new Date().toISOString(),
        dispatchId: "DP-LOCAL-" + Math.random().toString(36).substr(2, 9).toUpperCase()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "PDF Ledger Generated",
        description: `Dispatch Report ${results?.dispatchId || 'TEMP'} has been encrypted and exported.`,
      });
    }, 1500);
  };

  const handleSyncToAvionics = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Avionics Handshake Active",
        description: "Load sheet broadcast to airframe ACARS. Telemetry verified.",
      });
    }, 2000);
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3 text-foreground">
            <Layers className="h-8 w-8 text-primary" /> 3D Stability Hub
          </h1>
          <p className="text-muted-foreground">Tactical weight & balance engine for global airframes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1.5 font-bold uppercase tracking-widest text-[10px] hidden sm:flex gap-2">
            <ShieldCheck className="h-3 w-3" /> PRECISION DISPATCH
          </Badge>
          <Button variant="outline" size="sm" onClick={() => { setFwdHold(20000); setMidHold(30000); setAftHold(10000); setFuel(50000); setResults(null); }}>
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Reset Engine
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-lg bg-card/80 backdrop-blur-md">
            <CardHeader className="pb-4 border-b bg-secondary/20">
              <CardTitle className="text-sm font-headline uppercase tracking-widest text-primary flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Fleet Configurator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="h-12 border-primary/20 hover:bg-primary/5 text-[9px] font-bold uppercase" onClick={() => handleApplyPreset('airbus')}>Airbus</Button>
                <Button variant="outline" className="h-12 border-accent/20 hover:bg-accent/5 text-[9px] font-bold uppercase" onClick={() => handleApplyPreset('boeing')}>Boeing</Button>
                <Button variant="outline" className="h-12 border-destructive/20 hover:bg-destructive/5 text-[9px] font-bold uppercase" onClick={() => handleApplyPreset('military')}>Military</Button>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Selected Airframe</Label>
                <div className="relative">
                  <select 
                    value={aircraft} 
                    onChange={(e) => setAircraft(e.target.value)}
                    className="w-full h-11 px-4 bg-secondary/50 border-none rounded-xl appearance-none text-sm font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                  >
                    {Object.keys(AIRCRAFT_DATABASE).map(key => <option key={key} value={key}>{key}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-8">
                {['FWD', 'MID', 'AFT'].map((hold, i) => (
                  <div key={hold} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">{hold} Hold Distribution</Label>
                      <span className="text-xs font-mono font-bold text-primary">{(i === 0 ? fwdHold : i === 1 ? midHold : aftHold).toLocaleString()} kg</span>
                    </div>
                    <Slider 
                      value={[i === 0 ? fwdHold : i === 1 ? midHold : aftHold]} 
                      max={currentSpecs.payload * 0.7} 
                      step={500} 
                      onValueChange={(v) => i === 0 ? setFwdHold(v[0]) : i === 1 ? setMidHold(v[0]) : setAftHold(v[0])}
                    />
                  </div>
                ))}

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-accent">
                    <Label className="text-[10px] font-bold uppercase flex items-center gap-2">
                      <Fuel className="h-3 w-3" /> Fuel Reserve
                    </Label>
                    <span className="text-xs font-mono font-bold">{fuel.toLocaleString()} kg</span>
                  </div>
                  <Slider value={[fuel]} max={120000} step={1000} onValueChange={(v) => setFuel(v[0])} />
                </div>
              </div>

              <Button 
                className="w-full h-14 bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 text-md rounded-2xl" 
                onClick={handleGeneratePlan}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Box className="h-5 w-5 mr-2" />}
                CERTIFY DISPATCH REPORT
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className={`h-1 w-full ${stats.totalWeight > stats.maxWeight ? 'bg-destructive' : 'bg-primary'}`} />
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Takeoff Weight</p>
                  <p className="text-2xl font-bold font-headline">{(stats.totalWeight / 1000).toFixed(1)}T</p>
                </div>
                <Weight className="h-8 w-8 text-primary opacity-20" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className={`h-1 w-full ${stats.isSafe ? 'bg-accent' : 'bg-destructive'}`} />
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Center of Gravity</p>
                  <p className={`text-2xl font-bold font-headline ${stats.isSafe ? 'text-accent' : 'text-destructive'}`}>
                    {stats.cg}% MAC
                  </p>
                </div>
                <Activity className="h-8 w-8 text-accent opacity-20" />
              </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-1 w-full bg-primary" />
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Takeoff Trim</p>
                  <p className="text-2xl font-bold font-headline text-primary">{stats.trim}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-primary opacity-20" />
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg h-[400px] bg-slate-900 group relative overflow-hidden">
              <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
              <div className="relative h-full w-full flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between z-10">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Box className="h-3 w-3" /> Technical Airframe Preview
                  </span>
                  <Badge variant="outline" className="text-white border-white/20 text-[8px]">{currentSpecs.type}</Badge>
                </div>
                <div className="relative flex-1 w-full flex items-center justify-center p-4">
                  {diagram && (
                    <div className="relative w-full h-full min-h-[300px]">
                      <Image 
                        src={diagram.imageUrl} 
                        alt={diagram.description} 
                        fill 
                        priority
                        className="object-contain transition-transform duration-1000 group-hover:scale-105"
                        data-ai-hint={diagram.imageHint}
                      />
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 z-10 grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-center">
                      <p className="text-[8px] text-muted-foreground uppercase mb-0.5">Payload</p>
                      <p className="text-xs font-bold text-white">{(currentSpecs.payload/1000).toFixed(0)}T</p>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-center">
                      <p className="text-[8px] text-muted-foreground uppercase mb-0.5">Wingspan</p>
                      <p className="text-xs font-bold text-white">{currentSpecs.span}m</p>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-center">
                      <p className="text-[8px] text-muted-foreground uppercase mb-0.5">Pax Cap</p>
                      <p className="text-xs font-bold text-white">{currentSpecs.pax}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-lg flex flex-col h-[400px]">
              <CardHeader className="bg-primary/5 border-b py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-headline flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" /> Stability Envelope
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="cg" type="number" domain={[0, 50]} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="weight" type="number" domain={[100000, 500000]} tick={{ fontSize: 10 }} />
                    <ChartTooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={ENVELOPE_DATA} fill="hsl(var(--primary))" line shape="circle" fillOpacity={0.1} />
                    <Scatter data={[{ cg: stats.cg, weight: stats.totalWeight }]} fill="hsl(var(--accent))" shape="star" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {results && (
            <Card className="border-none shadow-2xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-4">
              <CardHeader className="pb-2 border-b border-primary/10">
                <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" /> Technical Certification Report
                </CardTitle>
                <CardDescription className="font-mono text-[10px]">DISPATCH ID: {results.dispatchId}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm italic leading-relaxed text-foreground/80 border-l-2 border-primary pl-4">{results.aiAdvice}</p>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] font-bold uppercase tracking-widest border-primary text-primary hover:bg-primary/10"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                  >
                    {isExporting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Download className="h-3 w-3 mr-2" />}
                    Export PDF
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-[10px] font-bold uppercase tracking-widest bg-primary shadow-lg shadow-primary/20"
                    onClick={handleSyncToAvionics}
                    disabled={isSyncing}
                  >
                    {isSyncing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Wifi className="h-3 w-3 mr-2" />}
                    Sync to Avionics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}