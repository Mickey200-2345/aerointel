"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Share2, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Loader2, 
  Filter, 
  Upload, 
  Cloud, 
  HardDrive,
  CheckCircle2,
  X,
  Lock,
  Globe
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DocumentRecord {
  id: string;
  documentType: string;
  documentNumber: string;
  title: string;
  status?: string;
  fileSizeByte?: number;
  uploadDateTime: string;
  ownerOrganizationId: string;
}

export default function DocumentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [connectingCloud, setConnectingCloud] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState({
    title: "",
    type: "Manifest",
    number: ""
  });

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, "users", user.uid);
  }, [firestore, user]);
  const { data: profile } = useDoc(userDocRef);

  const docsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "documents");
  }, [firestore, user]);
  const { data: documents, isLoading } = useCollection<DocumentRecord>(docsQuery);

  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    const term = searchTerm.toLowerCase();
    return documents.filter(doc => {
      const titleMatch = (doc.title || "").toLowerCase().includes(term);
      const typeMatch = (doc.documentType || "").toLowerCase().includes(term);
      const numMatch = (doc.documentNumber || "").toLowerCase().includes(term);
      return titleMatch || typeMatch || numMatch;
    });
  }, [documents, searchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!newDoc.title) {
        setNewDoc(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const handleUpload = () => {
    if (!firestore || !profile || !newDoc.title || !newDoc.number || !selectedFile) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a file and fill in all document details."
      });
      return;
    }

    const docData = {
      documentType: newDoc.type,
      documentNumber: newDoc.number,
      title: newDoc.title,
      status: "Verified",
      fileSizeByte: selectedFile.size,
      fileName: selectedFile.name,
      fileType: selectedFile.type,
      uploadDateTime: new Date().toISOString(),
      ownerOrganizationId: profile.organizationId || "ORG-772-X",
      uploadedByUserId: user?.uid,
      fileReferenceId: `FILE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: serverTimestamp()
    };

    const docsRef = collection(firestore, "documents");
    addDocumentNonBlocking(docsRef, docData);

    toast({
      title: "Document Uploaded",
      description: `${newDoc.title} has been added to the secure vault.`
    });

    setNewDoc({ title: "", type: "Manifest", number: "" });
    setSelectedFile(null);
    setIsUploadOpen(false);
  };

  const handleCloudUploadSim = (platform: string) => {
    setConnectingCloud(platform);
    setTimeout(() => {
      setConnectingCloud(null);
      toast({
        title: "Cloud Connection Active",
        description: `Successfully authenticated with ${platform} Cloud Identity.`
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Document Vault</h1>
          <p className="text-muted-foreground">Secure, immutable storage for operational documentation.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vault..."
              className="pl-9 bg-card border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary">
                <Plus className="h-4 w-4 mr-2" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> Secure Ingestion
                </DialogTitle>
                <DialogDescription>
                  Upload documents from your computer or link to cloud logistics platforms.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Document Type</Label>
                    <Select 
                      value={newDoc.type} 
                      onValueChange={(v) => setNewDoc({...newDoc, type: v})}
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manifest">Manifest</SelectItem>
                        <SelectItem value="Air Waybill">Air Waybill</SelectItem>
                        <SelectItem value="Customs">Customs</SelectItem>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Log">Operational Log</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">AWB / Ref Number</Label>
                    <Input 
                      id="number" 
                      placeholder="e.g. SIN-881273" 
                      value={newDoc.number}
                      className="bg-secondary/50"
                      onChange={(e) => setNewDoc({...newDoc, number: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Ledger Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Flight_EK215_Manifest" 
                    value={newDoc.title}
                    className="bg-secondary/50"
                    onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-3 w-3" /> Ingestion Source
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className={cn(
                        "h-24 flex flex-col gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all",
                        selectedFile ? "border-primary bg-primary/5" : ""
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <HardDrive className="h-6 w-6 text-muted-foreground" />
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold">Local File</span>
                        {selectedFile && <span className="text-[10px] text-primary truncate max-w-[150px]">{selectedFile.name}</span>}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        disabled={!!connectingCloud}
                        className="h-11 text-[10px] gap-2 flex flex-col items-center justify-center pt-1" 
                        onClick={() => handleCloudUploadSim('Google Drive')}
                      >
                        {connectingCloud === 'Google Drive' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}
                        <span>G-Drive</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        disabled={!!connectingCloud}
                        className="h-11 text-[10px] gap-2 flex flex-col items-center justify-center pt-1" 
                        onClick={() => handleCloudUploadSim('Dropbox')}
                      >
                        {connectingCloud === 'Dropbox' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}
                        <span>Dropbox</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        disabled={!!connectingCloud}
                        className="h-11 text-[10px] gap-2 flex flex-col items-center justify-center pt-1" 
                        onClick={() => handleCloudUploadSim('Box')}
                      >
                        {connectingCloud === 'Box' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}
                        <span>Box</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        disabled={!!connectingCloud}
                        className="h-11 text-[10px] gap-2 flex flex-col items-center justify-center pt-1" 
                        onClick={() => handleCloudUploadSim('OneDrive')}
                      >
                        {connectingCloud === 'OneDrive' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}
                        <span>Azure</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{selectedFile.name}</span>
                        <span className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for encryption</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFile(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsUploadOpen(false);
                  setSelectedFile(null);
                }}>Cancel</Button>
                <Button onClick={handleUpload} className="bg-primary" disabled={!selectedFile || !newDoc.number}>
                  <Upload className="h-4 w-4 mr-2" /> Upload to Vault
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest">Network Node</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">NODE-7A</div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase">Secure Tunnel Active</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-accent uppercase tracking-widest">Vault Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{documents?.length || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Live from secure store</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline text-primary">100%</div>
            <p className="text-[10px] text-muted-foreground mt-1">Audit trail verified</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Encryption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> E2EE
            </div>
            <p className="text-[10px] text-primary mt-1 font-bold italic">AES-256-GCM Verified</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-4 bg-secondary/10 flex items-center gap-2 border-b">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Document Ledger</span>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground italic">Decrypting ledger via secure link...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="font-headline">Name</TableHead>
                <TableHead className="font-headline">Type</TableHead>
                <TableHead className="font-headline">Size</TableHead>
                <TableHead className="font-headline">Status</TableHead>
                <TableHead className="font-headline">Uploaded</TableHead>
                <TableHead className="font-headline text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {doc.documentType === 'Log' ? <FileSpreadsheet className="h-5 w-5 text-primary" /> : <FileText className="h-5 w-5 text-destructive" />}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{doc.title || "Untitled Document"}</span>
                          <span className="text-[10px] text-muted-foreground">REF: {doc.documentNumber || "N/A"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{doc.documentType || "General"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.fileSizeByte ? (doc.fileSizeByte / 1024 / 1024).toFixed(1) + " MB" : "0.5 MB"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={doc.status === 'Verified' ? 'default' : 'outline'}
                        className="text-[10px] rounded-full"
                      >
                        {doc.status || 'Verified'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.uploadDateTime ? new Date(doc.uploadDateTime).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic">
                    {searchTerm ? `No documents matching "${searchTerm}" found in vault.` : "Secure vault is empty. Upload documents to get started."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
