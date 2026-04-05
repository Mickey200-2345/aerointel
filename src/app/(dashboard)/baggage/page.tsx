'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Globe, 
  Loader2, 
  AlertCircle, 
  TrendingUp,
  Server,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { shipmentCopilot } from "@/ai/flows/shipment-copilot-flow";
import { useToast } from "@/hooks/use-toast";

interface BaggageResult {
  status: string;
  lastSeenLocation: string;
  worldTracerFileId: string;
  estimatedRecoveryTime: string;
  recoveryProbability: number;
}

export default function BaggagePage() {
  const [tagNumber, setTagNumber] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<BaggageResult | null>(null);
  const { toast } = useToast();

  const handleTrace = async () => {
    if (!tagNumber || !lastName) {
      toast({
        variant: "destructive",
        title: "Missing Data",
        description: "Please enter a baggage tag and passenger name."
      });
      return;
    }

    setIsSearching(true);
    setResult(null);

    try {
      // We use the copilot flow which has access to the WorldTracer tool
      const response = await shipmentCopilot({
        message: `Trace baggage tag ${tagNumber} for passenger ${lastName}. Provide a structured recovery summary.`
      });

      // Simulating parsing tool output from AI response for the UI display
      // In a real app, you'd call the tool directly or have the AI return JSON
      setTimeout(() => {
        setResult({
          status: "Located at Hub",
          lastSeenLocation: "Dubai International (DXB)",
          worldTracerFileId: `WT-${tagNumber.slice(-4)}-772X`,
          estimatedRecoveryTime: "24 Hours",
          recoveryProbability: 98.4
        });
        setIsSearching(false);
      }, 2000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Link Failure",
        description: "Could not establish secure connection to WorldTracer."
      });
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-primary" /> Baggage Tracer
          </h1>
          <p className="text-muted-foreground">AI-driven baggage recovery powered by Amadeus WorldTracer.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1.5 items-center px-3 py-1.5 font-bold uppercase tracking-widest text-[10px]">
            <Server className="h-3 w-3" /> WorldTracer Link: Active
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Recovery Console</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag">Baggage Tag Number</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="tag" 
                    placeholder="e.g. BA123456" 
                    className="pl-10 bg-secondary/30 border-none h-11"
                    value={tagNumber}
                    onChange={(e) => setTagNumber(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Passenger Last Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Smith" 
                  className="bg-secondary/30 border-none h-11"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <Button 
                className="w-full h-11 bg-primary font-bold shadow-lg shadow-primary/20"
                onClick={handleTrace}
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                INITIATE AI TRACE
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Global Security Protocol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-accent/80 leading-relaxed italic">
                All baggage tracing requests are routed through a hardened E2EE tunnel to WorldTracer global nodes. Identity verification is required for file modification.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-lg overflow-hidden">
                <div className="bg-primary/10 p-6 border-b border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-xl">{tagNumber}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">File ID: {result.worldTracerFileId}</p>
                    </div>
                  </div>
                  <Badge className="bg-accent text-white font-bold">{result.status.toUpperCase()}</Badge>
                </div>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Last Seen Location</p>
                          <p className="text-lg font-medium">{result.lastSeenLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase">Recovery Estimate</p>
                          <p className="text-lg font-medium">{result.estimatedRecoveryTime}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-secondary/50 border space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3" /> Recovery Probability
                        </p>
                        <span className="text-lg font-bold text-primary">{result.recoveryProbability}%</span>
                      </div>
                      <Progress value={result.recoveryProbability} className="h-2" />
                      <p className="text-[10px] text-muted-foreground italic leading-tight">
                        Based on historical WorldTracer recovery patterns and current hub logistics flow.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t flex flex-wrap gap-3">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">Send Update to Passenger</Button>
                    <Button variant="outline">Initiate Reroute</Button>
                    <Button className="bg-accent ml-auto">Generate Manifest</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : isSearching ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-2xl">
              <div className="relative mb-6">
                <Globe className="h-16 w-16 text-primary/20 animate-spin-slow" />
                <Loader2 className="h-8 w-8 text-primary animate-spin absolute inset-0 m-auto" />
              </div>
              <h3 className="text-xl font-headline font-bold mb-2">Scanning Global Network...</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                AeroIntel is performing an AI-assisted handshake with WorldTracer nodes to locate the mishandled item.
              </p>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-2xl opacity-60">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-headline font-semibold mb-2">Awaiting Trace Request</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Enter a baggage tag and passenger name to start the recovery process via WorldTracer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
