"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { User, Building2, Shield, Bell, Save, Loader2, MapPin, Mail, RefreshCw, Key, Fingerprint, Lock, ShieldCheck, Activity } from "lucide-react";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

export default function SettingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef);
  
  const orgDocRef = useMemoFirebase(() => {
    if (!firestore || !profile?.organizationId) return null;
    return doc(firestore, "organizations", profile.organizationId);
  }, [firestore, profile?.organizationId]);

  const { data: orgData, isLoading: isOrgLoading } = useDoc(orgDocRef);

  const [isSaving, setIsSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [isRotating, setIsRotating] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDocRef || !user) return;

    setIsSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setDocumentNonBlocking(userDocRef, {
      id: user.uid,
      externalAuthId: user.uid,
      email: (formData.get('email') as string) || profile?.email || user?.email || "",
      firstName: (formData.get('firstName') as string) || profile?.firstName || "Operations",
      lastName: (formData.get('lastName') as string) || profile?.lastName || "Lead",
      role: (formData.get('role') as string) || profile?.role || "Global Manager",
      organizationId: profile?.organizationId || "ORG-772-X",
      updatedAt: new Date().toISOString(),
      createdAt: profile?.createdAt || new Date().toISOString(),
      country: selectedCountry || profile?.country || "United Arab Emirates",
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    }, 800);
  };

  const handleSaveOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgDocRef || !profile?.organizationId) return;

    setIsSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setDocumentNonBlocking(orgDocRef, {
      id: profile.organizationId,
      name: (formData.get('orgName') as string) || orgData?.name || "Dubai Central (DWC) Operations",
      type: (formData.get('orgType') as string) || orgData?.type || "Ground Handler",
      address: (formData.get('orgAddress') as string) || orgData?.address || "Al Maktoum International Airport",
      updatedAt: new Date().toISOString(),
      createdAt: orgData?.createdAt || new Date().toISOString(),
      contactEmail: profile?.email || orgData?.contactEmail || "",
    }, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Organization Updated",
        description: "Organization details have been synchronized.",
      });
    }, 800);
  };

  const handleRotateKeys = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
      toast({
        title: "E2EE Key Rotation Complete",
        description: "New tactical encryption keys have been broadcast to your active session.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account, organization, and platform preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2">
            <MapPin className="h-4 w-4" /> Regional Hub
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" /> Organization
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Personal Information</CardTitle>
              <CardDescription>Update your personal details and how others see you on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input name="firstName" id="firstName" defaultValue={profile?.firstName || ""} placeholder="First name" className="bg-secondary/30 border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input name="lastName" id="lastName" defaultValue={profile?.lastName || ""} placeholder="Last name" className="bg-secondary/30 border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Work Email</Label>
                    <Input name="email" id="email" type="email" defaultValue={profile?.email || user?.email || ""} placeholder="Email address" className="bg-secondary/30 border-none h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Operational Role</Label>
                    <Input name="role" id="role" defaultValue={profile?.role || "Operations Lead"} className="bg-secondary/30 border-none h-11" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary px-8" disabled={isSaving || isProfileLoading}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Regional Hub Settings</CardTitle>
              <CardDescription>Set your primary operating location. This will update your local time zone and hub context.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Operating Country</Label>
                    <Select onValueChange={setSelectedCountry} defaultValue={profile?.country || "United Arab Emirates"}>
                      <SelectTrigger className="bg-secondary/30 border-none h-12">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-primary">Current Active Hub</p>
                      <p className="text-xs text-muted-foreground">{profile?.country || "United Arab Emirates"} (Primary Terminal)</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary px-8" disabled={isSaving || isProfileLoading}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Update Location
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Organization Details</CardTitle>
              <CardDescription>Manage your organization's identity and global settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveOrganization} className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-primary">{orgData?.name || "Dubai Central (DWC) Operations"}</h4>
                        <p className="text-xs text-muted-foreground">Org ID: {profile?.organizationId || "ORG-772-X"}</p>
                      </div>
                      <Building2 className="h-6 w-6 text-primary/40" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input name="orgName" id="orgName" defaultValue={orgData?.name || ""} placeholder="e.g. Emirates SkyCargo" className="bg-secondary/30 border-none h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgType">Industry Type</Label>
                      <Input name="orgType" id="orgType" defaultValue={orgData?.type || ""} placeholder="e.g. Ground Handler, Airline" className="bg-secondary/30 border-none h-11" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="orgAddress">Headquarters Address</Label>
                      <Input name="orgAddress" id="orgAddress" defaultValue={orgData?.address || ""} placeholder="Full address" className="bg-secondary/30 border-none h-11" />
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <div className="space-y-2">
                      <Label>Compliance Standard</Label>
                      <Input defaultValue="IATA Cargo XML Standard 3.1" className="bg-secondary/30 border-none opacity-50 h-11" disabled />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button type="submit" className="bg-primary px-8" disabled={isSaving || isOrgLoading}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Organization Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> Encryption & Access
                </CardTitle>
                <CardDescription>Configure end-to-end encryption keys and platform access protocols.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center">
                  <ShieldCheck className="h-10 w-10 text-primary opacity-20 mb-3" />
                  <h4 className="text-sm font-bold">E2EE Key Rotation</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">Next scheduled key rotation is in 14 days. This is managed automatically by AeroIntel's secure node.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4 text-xs h-9 border-primary text-primary hover:bg-primary/10"
                    onClick={handleRotateKeys}
                    disabled={isRotating}
                  >
                    {isRotating ? <RefreshCw className="h-3 w-3 animate-spin mr-2" /> : <Key className="h-3 w-3 mr-2" />}
                    FORCE ROTATE KEYS
                  </Button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Fingerprint className="h-4 w-4" /> Multi-Factor Auth
                  </h4>
                  <div className="p-4 rounded-xl bg-secondary/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Status: Enabled</span>
                        <span className="text-[10px] text-muted-foreground uppercase">Protected by AuthLink Node</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary/20">ACTIVE</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
              <CardHeader className="relative z-10 border-b border-white/5">
                <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest text-primary">
                  <Activity className="h-4 w-4" /> Node Health Stream
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 relative z-10 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-mono opacity-50 uppercase">
                    <span>Node Integration Integrity</span>
                    <span>99.9% Verified</span>
                  </div>
                  <Progress value={99.9} className="h-1.5 bg-white/10" />
                </div>

                <div className="grid gap-3">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Global Sec-Ops Link</span>
                    </div>
                    <span className="text-[10px] font-mono text-primary">SECURE</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Telemetry Enclave</span>
                    </div>
                    <span className="text-[10px] font-mono text-accent">ISOLATED</span>
                  </div>
                </div>

                <p className="text-[10px] text-white/40 italic leading-relaxed pt-4">
                  "All administrative actions within the Security Console are recorded in the immutable AeroIntel Audit Ledger (AIAL) for future forensic evaluation."
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
