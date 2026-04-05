"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plane, 
  Globe, 
  BarChart3, 
  ShieldCheck, 
  Loader2, 
  Search, 
  ExternalLink, 
  Building2,
  Activity,
  Zap,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { shipmentCopilot } from "@/ai/flows/shipment-copilot-flow";
import { useToast } from "@/hooks/use-toast";

interface Airline {
  id: string;
  name: string;
  type: string;
  contactEmail: string;
  address?: string;
  iataCode?: string;
  fleetSize?: number;
  onTimePerformance?: number;
  status?: 'Active' | 'Under Maintenance' | 'Restricted';
}

export default function AirlinesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const airlinesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "organizations"),
      where("type", "==", "Airline")
    );
  }, [firestore, user]);

  const { data: airlines, isLoading } = useCollection<Airline>(airlinesQuery);

  const filteredAirlines = airlines?.filter(airline => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    
    const nameMatch = (airline.name || "").toLowerCase().includes(term);
    const iataMatch = (airline.iataCode || "").toLowerCase() === term;
    const iataContains = (airline.iataCode || "").toLowerCase().includes(term);
    const idMatch = (airline.id || "").toLowerCase().includes(term);
    
    return iataMatch || nameMatch || iataContains || idMatch;
  });

  const handleAIAnalysis = async () => {
    if (!searchTerm) {
      toast({
        title: "Search Term Required",
        description: "Enter an airline name or IATA code for AI analysis.",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await shipmentCopilot({
        message: `Analyze operational status and performance for airline: ${searchTerm}. Include IATA code if found.`
      });
      
      toast({
        title: "AI Carrier Intelligence",
        description: response.reply,
      });
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        toast({
          variant: "destructive",
          title: "Node at Capacity",
          description: "AI Quota reached. Please wait 60s for link re-establishment."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "Could not establish secure link to Aviation Intelligence Node.",
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const trackLiveFleet = (iataCode?: string) => {
    router.push(`/tracking?carrier=${iataCode || ''}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
            <Plane className="h-8 w-8 text-primary" /> Global Airlines
          </h1>
          <p className="text-muted-foreground">Carrier performance and fleet capacity management.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by Code (e.g. EK)..." 
              className="pl-9 bg-card border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            className="bg-primary shadow-lg shadow-primary/20" 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            AI ANALYSIS
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center p-24 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Syncing Global Airline Ledger...</p>
          </div>
        ) : filteredAirlines && filteredAirlines.length > 0 ? (
          filteredAirlines.map((airline) => (
            <Card key={airline.id} className="border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="h-1.5 bg-primary/20 group-hover:bg-primary transition-colors" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-headline">{airline.name || "Unknown Carrier"}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] h-5">
                          {airline.iataCode || "???"}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {airline.id?.slice(0, 8)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={airline.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">
                    {airline.status || 'ACTIVE'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-secondary/50 border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 font-headline">On-Time Perf</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{airline.onTimePerformance || '94.2'}%</span>
                      <Activity className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50 border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 font-headline">Fleet Assets</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{airline.fleetSize || '42'} Units</span>
                      <BarChart3 className="h-3 w-3 text-accent" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Capacity Utilization</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-1" />
                </div>

                <div className="pt-2 flex items-center justify-between border-t mt-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Verified Node</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold gap-2 uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                    onClick={() => trackLiveFleet(airline.iataCode)}
                  >
                    <MapPin className="h-3 w-3" /> Track Live Fleet <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl text-muted-foreground">
            <Plane className="h-12 w-12 opacity-10 mb-4" />
            <p className="text-sm italic">No carriers matching "{searchTerm}" found in the global registry.</p>
            {searchTerm && (
              <Button variant="outline" className="mt-4" onClick={handleAIAnalysis}>
                Lookup "{searchTerm}" via AI Copilot
              </Button>
            )}
          </div>
        )}
      </div>

      <Card className="border-none shadow-sm bg-accent/5">
        <CardHeader>
          <CardTitle className="text-sm font-headline uppercase tracking-widest text-accent">Strategic Carrier Overview</CardTitle>
          <CardDescription>Consolidated metrics from the AeroIntel Global Intelligence Node.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Tonnage</span>
              <p className="text-2xl font-bold font-headline">1.4M kg</p>
              <Badge className="bg-primary/20 text-primary border-none text-[9px]">MTD PERFORMANCE</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Delay</span>
              <p className="text-2xl font-bold font-headline">12m</p>
              <Badge className="bg-accent/20 text-accent border-none text-[9px]">GLOBAL OPTIMIZED</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Network Reach</span>
              <p className="text-2xl font-bold font-headline">184 Hubs</p>
              <Badge variant="outline" className="text-[9px]">ACTIVE NODES</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Security Audits</span>
              <p className="text-2xl font-bold font-headline">99.9%</p>
              <Badge className="bg-destructive/10 text-destructive border-none text-[9px]">COMPLIANCE PASS</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
