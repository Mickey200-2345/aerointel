"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp,
  initiateGoogleSignIn,
  initiateAnonymousSignIn
} from "@/firebase/non-blocking-login";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Plane, ArrowRight, Loader2, ShieldCheck, Mail, Lock, UserPlus, Globe, Play, Wifi, Server, Activity, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthPending, setIsAuthPending] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'validating' | 'secure'>('validating');

  useEffect(() => {
    const timer = setTimeout(() => setNetworkStatus('secure'), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && !isAuthPending) {
      router.push('/dashboard');
    }
  }, [user, isAuthPending, router]);

  const handlePostLoginProfile = async (firebaseUser: any, isGuest = false) => {
    if (!firestore) return;

    const userRef = doc(firestore, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const profileData = {
        id: firebaseUser.uid,
        externalAuthId: firebaseUser.uid,
        email: firebaseUser.email || `${firebaseUser.uid}@aero-intel.internal`,
        firstName: isGuest ? "Guest" : "Operations",
        lastName: isGuest ? "Observer" : "Lead",
        avatarUrl: firebaseUser.photoURL || null,
        organizationId: "ORG-GEN-7A",
        role: isGuest ? "Guest Observer" : "Operations Lead",
        country: "United Arab Emirates",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDocumentNonBlocking(userRef, profileData, { merge: true });
      
      toast({
        title: isGuest ? "Demo Mode Active" : "Identity Initialized",
        description: isGuest ? "You have entered the platform as a Guest Observer." : "Your tactical profile has been synchronized.",
      });
    }
  };

  const handleGuestLogin = async () => {
    if (auth) {
      setIsAuthPending(true);
      try {
        const result = await initiateAnonymousSignIn(auth);
        if (result.user) {
          await handlePostLoginProfile(result.user, true);
        }
      } catch (error: any) {
        setIsAuthPending(false);
        toast({
          variant: "destructive",
          title: "Guest Link Failure",
          description: "Unable to establish anonymous demo session.",
        });
      } finally {
        setIsAuthPending(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (auth) {
      setIsAuthPending(true);
      try {
        const result = await initiateGoogleSignIn(auth);
        if (result.user) {
          await handlePostLoginProfile(result.user);
        }
      } catch (error: any) {
        setIsAuthPending(false);
        if (error.code !== 'auth/popup-closed-by-user') {
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error.message || "Secure link failed.",
          });
        }
      } finally {
        setIsAuthPending(false);
      }
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth && email && password) {
      setIsAuthPending(true);
      try {
        await initiateEmailSignIn(auth, email, password);
      } catch (error: any) {
        setIsAuthPending(false);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Invalid credentials or node sync failure.",
        });
      }
    }
  };

  if (isUserLoading || isAuthPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="tactical-grid" />
        <div className="flex flex-col items-center gap-8 relative z-10">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
            <Plane className="h-8 w-8 text-primary absolute inset-0 m-auto animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xs font-black text-primary uppercase tracking-[0.5em] animate-pulse">Establishing Secure Session</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Synchronizing Identity Node...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 overflow-hidden">
      <div className="tactical-grid opacity-40" />
      <div className="scanline" />
      
      <div className="flex items-center gap-4 mb-12 relative z-10">
        <div className="p-3 bg-primary rounded-2xl shadow-2xl shadow-primary/20 group hover:scale-110 transition-transform cursor-default">
          <Plane className="h-10 w-10 text-primary-foreground italic" />
        </div>
        <div className="flex flex-col">
          <span className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none text-foreground">AeroIntel</span>
          <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mt-1">Universal Portal</span>
        </div>
      </div>
      
      <Card className="w-full max-w-md border-none shadow-2xl relative glass-morphism overflow-hidden rounded-[2rem]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary animate-in slide-in-from-left duration-1000" />
        
        <CardHeader className="text-center pb-4 pt-10">
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className={`gap-2 px-5 py-2 rounded-full font-black text-[9px] tracking-[0.2em] transition-all duration-500 ${networkStatus === 'secure' ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_hsl(var(--primary)/0.2)]' : 'bg-muted text-muted-foreground'}`}>
              {networkStatus === 'secure' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {networkStatus === 'secure' ? 'TACTICAL NETWORK: LOCKED' : 'VALIDATING NODE...'}
            </Badge>
          </div>
          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter text-foreground">Identity Access</CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-60">Authorize Terminal Connection</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-4 pb-10 px-8">
          <Button 
            className="w-full h-16 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 rounded-2xl group relative overflow-hidden"
            onClick={handleGuestLogin}
          >
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="flex items-center gap-3 relative z-10">
              <Zap className="h-5 w-5 fill-current" /> Initialize Demo Session
            </span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black">
              <span className="bg-background/0 px-6 text-muted-foreground italic backdrop-blur-md">OR AUTHORIZE VIA CREDENTIALS</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/40 p-1.5 rounded-2xl mb-6">
              <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-2.5">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-black text-[10px] uppercase tracking-widest py-2.5">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-5">
              <form onSubmit={handleEmailSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Terminal Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="login-email" 
                      type="email" 
                      placeholder="name@organization.com" 
                      className="bg-secondary/50 border-none h-12 pl-12 rounded-xl font-bold text-sm focus-visible:ring-primary/20 transition-all text-foreground"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Access Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="login-password" 
                      type="password" 
                      className="bg-secondary/50 border-none h-12 pl-12 rounded-xl font-bold text-sm focus-visible:ring-primary/20 transition-all text-foreground"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-secondary h-12 text-[10px] font-black tracking-[0.2em] rounded-xl group uppercase">
                  Establish Session <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-5">
              <form onSubmit={handleEmailSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">New Identity</Label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="name@organization.com" 
                      className="bg-secondary/50 border-none h-12 pl-12 rounded-xl font-bold text-sm focus-visible:ring-primary/20 transition-all text-foreground"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-1">Security Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="signup-password" 
                      type="password" 
                      className="bg-secondary/50 border-none h-12 pl-12 rounded-xl font-bold text-sm focus-visible:ring-primary/20 transition-all text-foreground"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-accent h-12 text-[10px] font-black text-white tracking-[0.2em] rounded-xl uppercase">
                  Initialize Account <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <Button variant="outline" className="w-full h-12 gap-4 border-primary/20 hover:bg-primary/5 font-black text-[9px] uppercase tracking-[0.2em] rounded-xl group transition-all" onClick={handleGoogleLogin}>
            <Globe className="h-4 w-4 text-primary group-hover:rotate-12 transition-transform" /> Sign In with Workspace
          </Button>

          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-5 group">
             <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
               <ShieldCheck className="h-6 w-6" />
             </div>
             <div className="flex-1 space-y-1">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Showcase Protocol</p>
               <p className="text-[9px] text-muted-foreground leading-relaxed font-medium italic">
                 Click the <strong>Initialize Demo Session</strong> button at the top to instantly view the tactical dashboards as a guest observer.
               </p>
             </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-12 flex items-center gap-10 opacity-40">
        <div className="flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground">TLS 1.3 SECURE</span>
        </div>
        <div className="flex items-center gap-2">
          <Server className="h-3.5 w-3.5 text-primary" />
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground">NODE: GLOBAL-WEST-1</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground">LATENCY: 12ms</span>
        </div>
      </div>
    </div>
  );
}