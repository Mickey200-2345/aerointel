"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Warehouse, 
  Cpu, 
  Thermometer, 
  Droplets, 
  Box, 
  Activity, 
  Zap, 
  Loader2, 
  ArrowUpRight, 
  ShieldCheck,
  RefreshCw,
  LayoutGrid,
  History,
  Camera,
  Lock,
  ShieldAlert,
  Fingerprint,
  Eye,
  AlertTriangle,
  Wifi,
  Square
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { warehouseIntel, type WarehouseIntelOutput } from "@/ai/flows/warehouse-intel-flow";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface WarehouseData {
  id: string;
  name: string;
  location: string;
  capacityUtilization: number;
  inventoryCount: number;
  activeRobots: number;
  temperature: number;
  humidity: number;
  status: 'Optimal' | 'Warning' | 'Critical';
}

export default function WarehousePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<WarehouseIntelOutput | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMfaVerified, setIsMfaVerified] = useState(false);
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const warehouseQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "warehouses");
  }, [firestore, user]);

  const { data: warehouses, isLoading: isWarehouseLoading } = useCollection<WarehouseData>(warehouseQuery);

  const activeWarehouse = warehouses?.[0] || {
    id: "WH-DWC-01",
    name: "Terminal Alpha Automated Hub",
    location: "Dubai Central (DWC)",
    capacityUtilization: 82,
    inventoryCount: 14250,
    activeRobots: 42,
    temperature: 19.5,
    humidity: 45,
    status: "Optimal"
  };

  const handleRunAI = async () => {
    setIsAnalyzing(true);
    try {
      const response = await warehouseIntel({
        warehouseName: activeWarehouse.name,
        metrics: {
          utilization: activeWarehouse.capacityUtilization,
          inventoryCount: activeWarehouse.inventoryCount,
          activeRobots: activeWarehouse.activeRobots,
          temp: activeWarehouse.temperature
        }
      });
      setAiResult(response);
      toast({
        title: "Tactical Optimization Loaded",
        description: "AI Node has successfully analyzed warehouse telemetry."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Link Failure",
        description: "Could not establish secure link to Warehouse Intel Node."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const verifyMfa = () => {
    setIsVerifyingMfa(true);
    setTimeout(() => {
      setIsMfaVerified(true);
      setIsVerifyingMfa(false);
      toast({
        title: "MFA Success",
        description: "Biometric identity confirmed. Establishing CCTV link."
      });
    }, 2000);
  };

  const startCctv = async () => {
    if (!isMfaVerified) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setIsStreamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please enable camera permissions in your browser settings to access CCTV.",
      });
    }
  };

  const stopCctv = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreamActive(false);
    toast({
      title: "Feed Terminated",
      description: "Secure link to CCTV Node WH-DWC-7A has been closed."
    });
  };

  const handleRequestAuthorization = () => {
    toast({
      title: "Authorization Requested",
      description: "Your access request for CCTV Node WH-DWC-7A has been sent to GSOC.",
    });
  };

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // Authorized roles for CCTV access
  // For the DEMO, we explicitly include 'Guest Observer' so users can showcase the feature
  const isAuthorized = profile?.role === 'Security Manager' || 
                     profile?.role === 'Admin' || 
                     profile?.role === 'Operations Lead' ||
                     profile?.role === 'Global Manager' ||
                     profile?.role === 'Guest Observer';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
            <Warehouse className="h-8 w-8 text-primary" /> Warehouse Intelligence
          </h1>
          <p className="text-muted-foreground">Autonomous storage nodes and inventory velocity tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1.5 items-center px-3 py-1.5 font-bold uppercase tracking-widest text-[10px]">
            <Cpu className="h-3 w-3" /> ROBOTIC GRID: ACTIVE
          </Badge>
          <Button variant="outline" size="sm" className="h-9">
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Sync Node
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-none shadow-sm bg-card overflow-hidden">
              <div className="h-1 bg-primary" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Capacity</p>
                  <p className="text-2xl font-bold font-headline">{activeWarehouse.capacityUtilization}%</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <LayoutGrid className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-card overflow-hidden">
              <div className="h-1 bg-accent" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Pick Rate</p>
                  <p className="text-2xl font-bold font-headline">942/hr</p>
                </div>
                <div className="p-2 rounded-lg bg-accent/10 text-accent">
                  <Activity className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-card overflow-hidden">
              <div className="h-1 bg-primary" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Robots</p>
                  <p className="text-2xl font-bold font-headline">{activeWarehouse.activeRobots}</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg glass-morphism overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/10 flex flex-row items-center justify-between py-6">
              <div className="space-y-1">
                <CardTitle className="font-headline font-bold text-lg uppercase flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Optimization Engine
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest">AI Terminal Analysis</CardDescription>
              </div>
              <Button onClick={handleRunAI} disabled={isAnalyzing} className="bg-primary shadow-lg shadow-primary/20 font-bold uppercase text-[10px] tracking-widest">
                {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Zap className="h-3 w-3 mr-2" />}
                Run Optimizer
              </Button>
            </CardHeader>
            <CardContent className="pt-8">
              {aiResult ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                  <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Tactical Analysis</h4>
                    <p className="text-sm italic leading-relaxed text-foreground/80">{aiResult.analysis}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Box className="h-3.5 w-3.5" /> Recommended Moves
                      </h4>
                      <ul className="space-y-2">
                        {aiResult.suggestedActions.map((action, i) => (
                          <li key={i} className="text-xs p-3 rounded-lg bg-secondary/50 border border-border flex items-start gap-3">
                            <ArrowUpRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] font-bold uppercase text-accent mb-2">Efficiency Rating</p>
                      <div className="text-5xl font-black font-headline text-accent italic">{aiResult.efficiencyRating}%</div>
                      <Progress value={aiResult.efficiencyRating} className="h-1.5 w-full mt-4" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <Zap className="h-12 w-12 text-primary" />
                  <p className="text-sm font-bold uppercase tracking-widest">Optimizer Idle</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg overflow-hidden bg-slate-950 text-white relative">
            <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
            <CardHeader className="border-b border-white/10 relative z-10">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="font-headline font-bold text-lg uppercase flex items-center gap-2 text-primary">
                    <Camera className="h-5 w-5" /> CCTV Security Control
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-white/40">Authorized Access Only</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {isStreamActive && (
                    <Button variant="destructive" size="sm" className="h-7 px-3 text-[10px] font-black uppercase rounded-full flex items-center gap-1.5" onClick={stopCctv}>
                      <Square className="h-3 w-3 fill-current" /> Terminate Feed
                    </Button>
                  )}
                  <Badge variant="outline" className={cn("border-white/20 text-[10px] h-6", isStreamActive ? "text-red-500 border-red-500 animate-pulse" : "text-white/60")}>
                    {isStreamActive ? "LIVE FEED" : "LINK STANDBY"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative z-10">
              {isProfileLoading ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : !isAuthorized ? (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/50">
                  <ShieldAlert className="h-16 w-16 text-destructive mb-2" />
                  <h3 className="text-xl font-headline font-bold">Access Denied</h3>
                  <p className="text-sm text-white/60 max-w-xs mb-4">Your current role does not have authorization for direct CCTV node telemetry.</p>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/5" onClick={handleRequestAuthorization}>Request Authorization</Button>
                </div>
              ) : !isMfaVerified ? (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                  <Fingerprint className="h-20 w-20 text-primary animate-pulse" />
                  <h3 className="text-xl font-headline font-bold uppercase tracking-widest">Multi-Factor Authentication</h3>
                  <p className="text-[10px] text-primary/60 max-w-xs mx-auto -mt-4 italic">Biometric link required for CCTV telemetry sync.</p>
                  <Button className="bg-primary text-slate-950 font-black px-10 rounded-full" onClick={verifyMfa} disabled={isVerifyingMfa}>
                    {isVerifyingMfa ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    VERIFY IDENTITY
                  </Button>
                </div>
              ) : (
                <div className="relative aspect-video bg-black overflow-hidden border-y border-white/10">
                  <video ref={videoRef} className={cn("w-full h-full object-cover grayscale contrast-[1.2] brightness-75", isStreamActive ? "opacity-100" : "opacity-0")} autoPlay muted />
                  {!isStreamActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                      <Eye className="h-12 w-12 text-primary opacity-20" />
                      <Button className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-slate-950 font-bold" onClick={startCctv}>INITIALIZE FEED</Button>
                    </div>
                  )}
                  {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-destructive/90 p-6 text-center">
                      <Alert variant="destructive" className="max-w-md bg-destructive border-white/20">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Hardware Lock</AlertTitle>
                        <AlertDescription>
                          Camera access was denied by the browser protocol. Please check tactical sensor permissions.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-primary" /> Environmental Node
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Thermometer className="h-5 w-5 text-destructive" />
                  <span className="text-xs font-bold uppercase">Temperature</span>
                </div>
                <span className="text-sm font-black font-mono">{activeWarehouse.temperature}°C</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase">Humidity</span>
                </div>
                <span className="text-sm font-black font-mono">{activeWarehouse.humidity}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
