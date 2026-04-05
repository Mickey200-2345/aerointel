"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, BrainCircuit, Loader2, ChevronRight, Info, AlertTriangle } from "lucide-react";
import { anomalyReasoning, type AnomalyReasoningOutput } from "@/ai/flows/anomaly-reasoning-flow";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";

interface Anomaly {
  id: string;
  description: string;
  createdAt: string;
  status: 'new' | 'investigating' | 'resolved';
  severity: string;
  shipmentId?: string;
  data?: any;
}

export default function AnomaliesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const anomaliesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "anomalyAlerts");
  }, [firestore, user]);

  const { data: anomalies, isLoading: isAnomaliesLoading } = useCollection<Anomaly>(anomaliesQuery);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [reasoning, setReasoning] = useState<AnomalyReasoningOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [quotaHit, setQuotaHit] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
    setLoading(true);
    setReasoning(null);
    setQuotaHit(false);
    try {
      const result = await anomalyReasoning({
        anomalyDescription: anomaly.description,
        relevantData: JSON.stringify(anomaly.data || {})
      });
      setReasoning(result);
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        setQuotaHit(true);
        toast({
          variant: "destructive",
          title: "Node at Capacity",
          description: "AI Quota reached. Please wait 60s for link re-establishment."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "The AI reasoner encountered an error. Please try again later."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">Anomaly Detection</h1>
          <p className="text-muted-foreground">AI-powered identification and reasoning for operational risks.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">Recent Flags</h3>
          {isAnomaliesLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : anomalies && anomalies.length > 0 ? (
            anomalies.map((anomaly) => (
              <Card 
                key={anomaly.id} 
                className={`cursor-pointer transition-all border-none shadow-sm hover:ring-2 hover:ring-primary/20 ${selectedAnomaly?.id === anomaly.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleAnalyze(anomaly)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={anomaly.status === 'new' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {anomaly.status.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {anomaly.createdAt ? new Date(anomaly.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-1 truncate">{anomaly.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>ID: {anomaly.id.slice(0, 8)}</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-8 border-2 border-dashed rounded-xl text-muted-foreground">
              No anomalies detected.
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedAnomaly ? (
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-card overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-headline">{selectedAnomaly.id.slice(0, 8)}</CardTitle>
                      <CardDescription className="line-clamp-1">{selectedAnomaly.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Info className="h-3 w-3" /> Contextual Data
                    </h4>
                    <pre className="p-4 rounded-xl bg-secondary/50 text-[11px] font-code overflow-auto max-h-40">
                      {JSON.stringify(selectedAnomaly.data || { shipmentId: selectedAnomaly.shipmentId }, null, 2)}
                    </pre>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <BrainCircuit className="h-4 w-4 text-primary" /> AeroIntel AI Reasoner
                      </h4>
                      {loading && <div className="flex items-center gap-2 text-xs text-primary"><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</div>}
                    </div>

                    {reasoning ? (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                        <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
                          <h5 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider text-xs">Explanation</h5>
                          <p className="text-sm text-foreground/80 leading-relaxed italic">{reasoning.explanation}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-5 rounded-2xl bg-accent/5 border border-accent/10">
                            <h5 className="text-sm font-bold text-accent mb-2 uppercase tracking-wider text-xs">Severity</h5>
                            <Badge variant={reasoning.severity === 'critical' ? 'destructive' : 'default'} className="rounded-full px-3">
                              {reasoning.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="p-5 rounded-2xl bg-secondary/50 border border-border">
                            <h5 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider text-xs">Recommended Action</h5>
                            <p className="text-sm font-medium">{reasoning.recommendedAction}</p>
                          </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <Button size="sm" className="bg-accent hover:bg-accent/90">Investigate Further</Button>
                          <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">Archive Anomaly</Button>
                        </div>
                      </div>
                    ) : quotaHit ? (
                      <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 flex flex-col items-center text-center space-y-3">
                        <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
                        <h5 className="text-sm font-bold text-destructive uppercase tracking-widest">Intelligence Node Offline</h5>
                        <p className="text-xs text-muted-foreground italic">Free Tier Quota reached. Please wait 60 seconds before initiating a new forensic link.</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAnalyze(selectedAnomaly)}>Retry Handshake</Button>
                      </div>
                    ) : !loading && (
                      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-muted rounded-2xl text-muted-foreground">
                        <BrainCircuit className="h-10 w-10 text-muted-foreground/50 mb-4" />
                        <p className="text-sm">Click "Analyze" to initiate GenAI reasoning flow...</p>
                        <Button variant="outline" className="mt-4" onClick={() => handleAnalyze(selectedAnomaly)}>
                          Run AI Analysis
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-muted rounded-2xl">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-headline font-semibold mb-2">Select An Anomaly</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                AeroIntel uses a tool-based GenAI flow to reason about each flagged anomaly and suggest operational resolutions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}