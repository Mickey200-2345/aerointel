"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Plane, LayoutDashboard, Map, Bell, MessageSquare, FileText, Settings, ShieldAlert, LogOut, Search, Bot, Building2, MapPin, Loader2, AlertTriangle, Clock, Shield, Wifi, Briefcase, Globe, Weight, Activity, ChevronRight, Menu, Zap, Warehouse, Share2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, useAuth } from "@/firebase";
import { doc, collection, query, orderBy, limit, where } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SupportBotWidget } from "@/components/support-bot-widget";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc(userDocRef);

  const alertsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "anomalyAlerts"), 
      limit(10)
    );
  }, [firestore, user]);

  const { data: alerts } = useCollection(alertsQuery);
  const newAlertsCount = alerts?.filter(a => a.status === 'new').length || 0;

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  const handleShareNode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin);
      toast({
        title: "Node URL Copied",
        description: "Public access link is ready for distribution.",
      });
    }
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/tracking?search=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch("");
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <Plane className="h-6 w-6 text-primary absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Initializing Tactical Node...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const hubLocation = profile?.country || "United Arab Emirates";
  const hubName = profile?.country ? `${profile.country} Terminal` : "Dubai Central (DWC)";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/30">
        <Sidebar variant="sidebar" className="border-r border-border shadow-2xl z-20 glass-morphism">
          <SidebarHeader className="p-6">
            <Link href="/dashboard" className="flex items-center gap-3 px-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform">
                <Plane className="h-6 w-6 italic" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter font-headline uppercase italic leading-none">AeroIntel</span>
                <span className="text-[8px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Operational Node</span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 mt-4">Navigation Hub</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {[
                    { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
                    { name: "Live Tracking", icon: Map, href: "/tracking" },
                    { name: "Global Airlines", icon: Globe, href: "/airlines" },
                    { name: "Load & Trim", icon: Weight, href: "/load-trim" },
                    { name: "Warehouse", icon: Warehouse, href: "/warehouse" },
                    { name: "Baggage Tracer", icon: Briefcase, href: "/baggage" },
                    { name: "Anomalies", icon: ShieldAlert, href: "/anomalies" },
                    { name: "AI Copilot", icon: Bot, href: "/assistant" },
                    { name: "Messages", icon: MessageSquare, href: "/messages" },
                    { name: "Documents", icon: FileText, href: "/documents" },
                  ].map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.name} className="transition-all duration-300 h-11 px-4 rounded-xl hover:bg-primary/10">
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className={`h-4.5 w-4.5 transition-colors ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-xs font-bold uppercase tracking-widest ${pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}>{item.name}</span>
                          {pathname === item.href && <ChevronRight className="h-3 w-3 ml-auto text-primary" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-6 mt-auto">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/settings"} className="h-10 px-4 rounded-xl">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 px-4 rounded-xl">
                  <LogOut className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-4 px-2">
                <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-lg">
                  <AvatarImage src={profile?.avatarUrl} alt="User avatar" />
                  <AvatarFallback className="bg-primary/10 text-primary font-black">{profile?.firstName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black uppercase italic tracking-tight truncate">
                    {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : "Operations Lead"}
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{profile?.role || "Global Manager"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 px-2 py-2 rounded-lg bg-primary/5 border border-primary/10">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary truncate">
                  {hubLocation}
                </span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="absolute inset-0 tactical-grid pointer-events-none opacity-30 z-0" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none z-0" />

          <header className="h-20 border-b bg-background/60 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-10 shadow-sm relative">
            <div className="scanline opacity-20" />
            
            <form onSubmit={handleGlobalSearch} className="flex items-center gap-6 flex-1 max-w-xl">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Search Live Flights (AWB, Callsigns, IDs...)"
                  className="pl-11 bg-secondary/40 border-none h-11 w-full focus-visible:ring-2 focus-visible:ring-primary/20 font-bold text-xs uppercase tracking-widest rounded-xl"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-2 border-primary text-primary hover:bg-primary/10 font-bold text-[10px] uppercase tracking-widest rounded-full hidden lg:flex"
                onClick={handleShareNode}
              >
                <Share2 className="h-3.5 w-3.5" /> Share Node
              </Button>

              <div className="h-10 w-px bg-border/50 mx-2 hidden lg:block" />

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-11 w-11 hover:bg-primary/10 transition-all rounded-xl">
                    <Bell className="h-5 w-5" />
                    {newAlertsCount > 0 && (
                      <span className="absolute top-3 right-3 flex h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse shadow-[0_0_10px_red]"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96 p-0 overflow-hidden border-none shadow-2xl rounded-2xl glass-morphism" align="end">
                  <div className="p-5 bg-primary text-primary-foreground flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase italic tracking-[0.2em] flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" /> Operational Flags
                    </h3>
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-[8px]">{newAlertsCount} NEW</Badge>
                  </div>
                  <ScrollArea className="h-96">
                    <div className="divide-y divide-border/50">
                      {alerts && alerts.length > 0 ? (
                        alerts.map((alert) => (
                          <div key={alert.id} className="p-5 hover:bg-primary/5 transition-colors cursor-pointer group" onClick={() => router.push('/anomalies')}>
                            <div className="flex items-start gap-4">
                              <div className={`p-2.5 rounded-xl shrink-0 ${alert.severity === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-xs font-black uppercase tracking-tight truncate">{alert.alertType || 'Anomaly Detected'}</p>
                                  <span className="text-[8px] font-bold text-muted-foreground">Recent</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium line-clamp-2 leading-relaxed mb-2">{alert.description}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`text-[8px] font-black uppercase h-4 px-2 ${alert.severity === 'critical' ? 'border-destructive text-destructive' : 'border-primary text-primary'}`}>
                                    {alert.severity}
                                  </Badge>
                                  <span className="text-[8px] font-mono font-bold opacity-40">REF: {alert.id.slice(0, 8)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center text-muted-foreground space-y-3">
                          <Activity className="h-8 w-8 mx-auto opacity-10" />
                          <p className="text-[10px] font-bold uppercase tracking-widest italic">All systems nominal</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-3 bg-secondary/30 text-center border-t border-border/50">
                    <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-[0.3em] text-primary w-full h-10 rounded-lg hover:bg-primary/10" onClick={() => router.push('/anomalies')}>
                      Access Anomaly Vault <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic leading-none">{hubName}</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center gap-1">
                  <Activity className="h-2 w-2 text-primary animate-pulse" /> Live Operational Link
                </span>
              </div>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto p-8 z-10 relative">
            <div className="max-w-[1600px] mx-auto h-full">
              {children}
            </div>
          </div>
        </main>
        <SupportBotWidget />
      </div>
    </SidebarProvider>
  );
}
