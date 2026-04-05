"use client";

import { useEffect, useState, useCallback } from "react";
import { operationalInsightsSummary, type OperationalInsightsSummaryOutput } from "@/ai/flows/operational-insights-summary-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Lightbulb, RefreshCcw, ShieldAlert, AlertTriangle, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CACHE_KEY = 'aero-intel-operational-insights-v1';
const CACHE_DURATION = 15 * 60 * 1000;

export function OperationalInsights() {
  const [data, setData] = useState<OperationalInsightsSummaryOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; type: 'quota' | 'general' } | null>(null);

  const fetchData = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    if (!force) {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        } catch (e) {
          sessionStorage.removeItem(CACHE_KEY);
        }
      }
    }

    try {
      const rawData = "Current cargo demand is 15% higher than predicted for London-Singapore. 4-hour delay at HKG predicted. Volumetric gaps found in EK203.";
      const result = await operationalInsightsSummary({ dailyOperationalData: rawData });
      
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));

      setData(result);
    } catch (err: any) {
      const errorMessage = err.message || "";
      if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        setError({ message: "AeroIntel AI Node at Free Tier capacity. Standby 60s.", type: 'quota' });
      } else {
        setError({ message: "Unable to establish secure link with Global Intelligence Node.", type: 'general' });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 animate-pulse text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-widest">Scanning Global Fleet Telemetry...</span>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-2xl bg-destructive/5 border-destructive/20">
        <AlertTriangle className="h-10 w-10 text-destructive mb-4 opacity-50" />
        <h3 className="text-sm font-bold text-destructive uppercase tracking-widest mb-2">Link Interrupted</h3>
        <p className="text-xs text-muted-foreground mb-6 max-w-[280px] italic">{error.message}</p>
        <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => fetchData(true)}>
          <RefreshCcw className="h-3.5 w-3.5 mr-2" /> RE-ESTABLISH LINK
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex justify-between items-start">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Executive Status Summary</h4>
          </div>
          <p className="text-sm leading-relaxed text-foreground/80 font-medium italic">{data.summary}</p>
        </div>
        {data.isSimulated && (
          <Badge variant="outline" className="ml-4 bg-accent/10 text-accent border-accent/20 animate-pulse-soft">
            <Zap className="h-3 w-3 mr-1" /> LOCAL MODE
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-accent" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Critical Insights</h4>
          </div>
          <ul className="space-y-2">
            {data.criticalInsights.map((insight, i) => (
              <li key={i} className="text-xs text-muted-foreground border-l-2 border-accent pl-3 py-1 bg-accent/5 rounded-r-lg">{insight}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Tactical Actions</h4>
          </div>
          <ul className="space-y-2">
            {data.potentialActions.map((action, i) => (
              <li key={i} className="text-xs text-muted-foreground border-l-2 border-primary pl-3 py-1 bg-primary/5 rounded-r-lg">{action}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100" onClick={() => fetchData(true)}>
          <RefreshCcw className="h-3 w-3 mr-1" /> Force Refresh Hub
        </Button>
      </div>
    </div>
  );
}
