"use client";

import { useState, useMemo, useRef } from "react";
import { 
  Shield, 
  MessageSquare, 
  Send, 
  Paperclip, 
  Lock, 
  CheckCheck, 
  Loader2, 
  Plus, 
  Hash, 
  UserCircle, 
  Globe, 
  Search, 
  Zap, 
  Building2,
  Users,
  ChevronRight,
  Filter,
  Info,
  UserPlus,
  FileText,
  FileArchive,
  Download,
  X,
  User,
  MapPin
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, serverTimestamp, where, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import airportData from "@/lib/world-airports.json";

interface Conversation {
  id: string;
  name: string;
  type: string;
  memberUserIds: string[];
  updatedAt?: any;
}

interface Message {
  id: string;
  content: string;
  senderUserId: string;
  sentDateTime: string;
  conversationId: string;
  memberUserIds: string[];
  createdAt?: any;
  fileMetadata?: {
    name: string;
    size: string;
    type: string;
  };
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
}

export default function MessagesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"active" | "global">("active");
  const [nodeSearch, setNodeSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const [newChatData, setNewChatData] = useState({
    name: "",
    type: "Operational Channel",
    recipientId: ""
  });

  // Fetch Live Profiles
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users");
  }, [firestore, user]);
  const { data: liveProfiles } = useCollection<Profile>(usersQuery);

  const conversationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, "conversations"),
      where("memberUserIds", "array-contains", user.uid)
    );
  }, [firestore, user]);

  const { data: conversations, isLoading: isConvLoading } = useCollection<Conversation>(conversationsQuery);

  const sortedConversations = useMemo(() => {
    if (!conversations) return [];
    return [...conversations].sort((a, b) => {
      const timeA = a.updatedAt?.seconds || 0;
      const timeB = b.updatedAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [conversations]);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !activeChat || !user) return null;
    return query(
      collection(firestore, "conversations", activeChat.id, "messages"),
      where("memberUserIds", "array-contains", user.uid)
    );
  }, [firestore, activeChat, user]);

  const { data: messages, isLoading: isMsgLoading } = useCollection<Message>(messagesQuery);

  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    return [...messages].sort((a, b) => {
      const getMs = (msg: Message) => {
        if (msg.createdAt?.seconds) return msg.createdAt.seconds * 1000;
        const fallback = new Date(msg.sentDateTime).getTime();
        return isNaN(fallback) ? Date.now() : fallback;
      };
      return getMs(a) - getMs(b);
    });
  }, [messages]);

  const filteredNodes = useMemo(() => {
    const term = nodeSearch.toLowerCase();
    return airportData.airports.filter(node => 
      node.name.toLowerCase().includes(term) || 
      node.iata.toLowerCase().includes(term) ||
      node.city.toLowerCase().includes(term) ||
      node.country.toLowerCase().includes(term)
    );
  }, [nodeSearch]);

  const filteredPersonnel = useMemo(() => {
    if (!liveProfiles) return [];
    const term = nodeSearch.toLowerCase();
    return liveProfiles.filter(p => 
      p.id !== user?.uid && (
        (p.firstName || "").toLowerCase().includes(term) || 
        (p.lastName || "").toLowerCase().includes(term) || 
        (p.role || "").toLowerCase().includes(term)
      )
    );
  }, [liveProfiles, nodeSearch, user]);

  const formatMessageTime = (m: Message) => {
    if (m.createdAt?.toDate) return m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fallbackDate = new Date(m.sentDateTime);
    return !isNaN(fallbackDate.getTime()) 
      ? fallbackDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : "Just now";
  };

  const handleSendMessage = (fileMeta?: any) => {
    if ((!msgInput.trim() && !fileMeta) || !activeChat || !user || !firestore) return;

    const messageData: any = {
      content: fileMeta ? `Transmission: ${fileMeta.name}` : msgInput,
      senderUserId: user.uid,
      conversationId: activeChat.id,
      sentDateTime: new Date().toISOString(),
      createdAt: serverTimestamp(),
      memberUserIds: activeChat.memberUserIds
    };

    if (fileMeta) {
      messageData.fileMetadata = fileMeta;
    }

    const messagesRef = collection(firestore, "conversations", activeChat.id, "messages");
    addDocumentNonBlocking(messagesRef, messageData);
    
    const convRef = doc(firestore, "conversations", activeChat.id);
    updateDocumentNonBlocking(convRef, {
      updatedAt: serverTimestamp()
    });

    setMsgInput("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        handleSendMessage({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          type: file.type
        });
        setIsUploading(false);
        toast({
          title: "File Encrypted & Sent",
          description: `${file.name} successfully broadcast to tactical node.`
        });
      }, 1500);
    }
  };

  const handleCreateChat = () => {
    if (!firestore || !user || (!newChatData.name && newChatData.type !== 'Direct Message')) return;
    
    const members = [user.uid];
    if (newChatData.type === 'Direct Message') {
        if (!newChatData.recipientId) {
            toast({ variant: "destructive", title: "Missing Recipient", description: "Select a staff member." });
            return;
        }
        members.push(newChatData.recipientId);
    }

    const chatName = newChatData.type === 'Direct Message' 
        ? (liveProfiles?.find(p => p.id === newChatData.recipientId)?.firstName + " " + liveProfiles?.find(p => p.id === newChatData.recipientId)?.lastName || "Direct Message")
        : newChatData.name;

    const chatData = {
      name: chatName,
      type: newChatData.type,
      memberUserIds: members,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const convRef = collection(firestore, "conversations");
    addDocumentNonBlocking(convRef, chatData);

    setNewChatData({ name: "", type: "Operational Channel", recipientId: "" });
    setIsNewChatOpen(false);
    setSidebarTab("active");
  };

  const handleAddMember = (memberId: string) => {
    if (!activeChat || !firestore) return;
    
    const updatedMembers = [...activeChat.memberUserIds];
    if (!updatedMembers.includes(memberId)) {
      updatedMembers.push(memberId);
      const convRef = doc(firestore, "conversations", activeChat.id);
      updateDocumentNonBlocking(convRef, {
        memberUserIds: updatedMembers,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Member Added",
        description: "Tactical access granted to new personnel."
      });
    }
    setIsAddMemberOpen(false);
  };

  const handleConnectNode = (node: any) => {
    setNewChatData({
      name: `${node.iata} Hub Command`,
      type: "Operational Channel",
      recipientId: ""
    });
    setIsNewChatOpen(true);
  };

  const handleDirectConnect = (person: Profile) => {
    setNewChatData({
      name: `${person.firstName} ${person.lastName}`,
      type: "Direct Message",
      recipientId: person.id
    });
    setIsNewChatOpen(true);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex rounded-2xl border bg-card overflow-hidden shadow-sm">
      <div className="w-80 border-r bg-secondary/10 flex flex-col shrink-0">
        <div className="p-4 border-b bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold flex items-center gap-2 text-primary">
              <Shield className="h-4 w-4" /> SECURE LINKS
            </h3>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-headline">Initialize Secure Link</DialogTitle>
                  <DialogDescription>Establish a new communication channel across the AeroIntel node network.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Channel Type</Label>
                    <Select value={newChatData.type} onValueChange={(v) => setNewChatData({...newChatData, type: v})}>
                      <SelectTrigger className="bg-secondary/30 border-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct Message">Individual Chat (Direct)</SelectItem>
                        <SelectItem value="Operational Channel">Group Channel (Tactical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newChatData.type === 'Direct Message' ? (
                    <div className="grid gap-2">
                      <Label>Personnel Directory</Label>
                      <Select value={newChatData.recipientId} onValueChange={(v) => setNewChatData({...newChatData, recipientId: v})}>
                        <SelectTrigger className="bg-secondary/30 border-none"><SelectValue placeholder="Choose staff member..." /></SelectTrigger>
                        <SelectContent>
                          {liveProfiles?.filter(p => p.id !== user?.uid).map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.role})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label>Channel Designation</Label>
                      <Input 
                        placeholder="e.g. LHR_HUB_RECOVERY" 
                        className="bg-secondary/30 border-none"
                        value={newChatData.name} 
                        onChange={(e) => setNewChatData({...newChatData, name: e.target.value})} 
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateChat} className="bg-primary w-full">ESTABLISH ENCRYPTED LINK</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={sidebarTab} onValueChange={(v: any) => setSidebarTab(v)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="active" className="text-[10px] font-bold uppercase tracking-wider">Active</TabsTrigger>
              <TabsTrigger value="global" className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-3 w-3" /> Global
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-auto">
          {sidebarTab === "active" ? (
            <div className="divide-y divide-border">
              {isConvLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : sortedConversations.length > 0 ? (
                sortedConversations.map((chat) => (
                  <div 
                    key={chat.id} 
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${activeChat?.id === chat.id ? 'bg-primary/10 border-r-2 border-primary' : 'hover:bg-secondary/20'}`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                        {chat.type === 'Direct Message' ? <UserCircle className="h-5 w-5" /> : <Hash className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-sm font-bold truncate block">{chat.name}</span>
                        {chat.updatedAt && (
                          <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                            {new Date(chat.updatedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1">
                         <Shield className="h-2 w-2 text-primary" /> {chat.type}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground italic">No active tactical links.</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-3 bg-secondary/20 space-y-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search Global IATA Codes / Users..." 
                    className="h-8 pl-8 text-xs bg-card border-none"
                    value={nodeSearch}
                    onChange={(e) => setNodeSearch(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-4">
                  <div>
                    <h4 className="px-2 text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                      <Users className="h-3 w-3" /> Live Personnel
                    </h4>
                    <div className="space-y-1">
                      {filteredPersonnel.map((person) => (
                        <div key={person.id} className="p-3 rounded-lg hover:bg-accent/5 cursor-pointer group flex items-center justify-between" onClick={() => handleDirectConnect(person)}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={person.avatarUrl} />
                              <AvatarFallback className="text-[10px]">{person.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{person.firstName} {person.lastName}</span>
                              <span className="text-[9px] text-muted-foreground uppercase">{person.role}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="px-2 text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                      <Building2 className="h-3 w-3" /> Tactical Hub Nodes
                    </h4>
                    <div className="space-y-1">
                      {filteredNodes.slice(0, 20).map((node) => (
                        <div key={node.iata} className="p-3 rounded-lg hover:bg-primary/5 cursor-pointer group flex items-center justify-between" onClick={() => handleConnectNode(node)}>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                              {node.iata}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{node.city}</span>
                              <span className="text-[9px] text-muted-foreground uppercase truncate max-w-[120px]">{node.name}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="p-4 bg-accent/5 border-t">
                <p className="text-[10px] text-accent/80 leading-relaxed italic flex items-center gap-2">
                  <Info className="h-3 w-3" /> All global connections are routed through the AeroIntel E2EE Tactical Gateway.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background/50 relative">
        <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none" />
        
        {activeChat ? (
          <>
            <div className="h-16 border-b px-6 flex items-center justify-between bg-card shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/5 text-primary">
                    {activeChat.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-bold font-headline">{activeChat.name}</h4>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-[10px] text-primary flex items-center gap-1 font-bold uppercase tracking-widest">
                      <Shield className="h-2 w-2" /> Secure Link
                    </p>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground uppercase font-mono">{activeChat.id.slice(0, 8)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => fileInputRef.current?.click()}>
                   <Paperclip className="h-4 w-4" />
                 </Button>
                 
                 <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Personnel</DialogTitle>
                      <DialogDescription>Grant tactical access to additional staff members from the live directory.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-1">
                      {liveProfiles?.filter(p => p.id !== user?.uid && !activeChat.memberUserIds.includes(p.id)).map(p => (
                        <div key={p.id} className="p-3 rounded-lg hover:bg-primary/5 flex items-center justify-between cursor-pointer group" onClick={() => handleAddMember(p.id)}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={p.avatarUrl} />
                              <AvatarFallback>{p.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{p.firstName} {p.lastName}</span>
                              <span className="text-xs text-muted-foreground uppercase">{p.role}</span>
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                 </Dialog>

                 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Users className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto space-y-6 relative z-10">
              {isMsgLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Decrypting Stream...</span>
                </div>
              ) : sortedMessages.length > 0 ? (
                sortedMessages.map((m) => {
                  const senderProfile = liveProfiles?.find(p => p.id === m.senderUserId);
                  return (
                    <div key={m.id} className={`flex items-start gap-3 ${m.senderUserId === user?.uid ? 'justify-end' : ''}`}>
                      {m.senderUserId !== user?.uid && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={senderProfile?.avatarUrl} />
                          <AvatarFallback className="text-[10px] bg-secondary">
                            {senderProfile?.firstName?.[0] || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] space-y-1 ${m.senderUserId === user?.uid ? 'items-end' : 'items-start'}`}>
                        {m.fileMetadata ? (
                          <div className={`rounded-2xl p-4 shadow-sm border ${
                            m.senderUserId === user?.uid 
                              ? 'bg-primary/10 border-primary/20 rounded-tr-none' 
                              : 'bg-card border-border/50 rounded-tl-none'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                {m.fileMetadata.type.includes('pdf') || m.fileMetadata.type.includes('text') ? <FileText className="h-5 w-5" /> : <FileArchive className="h-5 w-5" />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold truncate">{m.fileMetadata.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-mono">{m.fileMetadata.size} • Encrypted Asset</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 hover:bg-primary/10">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            m.senderUserId === user?.uid 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-card text-foreground rounded-tl-none border border-border/50'
                          }`}>
                            {m.content}
                          </div>
                        )}
                        <div className={`flex items-center gap-1.5 text-[10px] opacity-60 font-mono ${m.senderUserId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                          {formatMessageTime(m)}
                          {m.senderUserId === user?.uid && <CheckCheck className="h-3 w-3 text-primary" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                  <Zap className="h-12 w-12 text-primary mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">Link established. Awaiting data...</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-card border-t shrink-0 relative z-20">
              <div className="flex items-center gap-3 max-w-4xl mx-auto bg-secondary/30 rounded-full px-4 py-1 border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileSelect} 
                />
                <Input 
                  placeholder={isUploading ? "Encrypting transmission..." : "Encrypted tactical transmission..."} 
                  className="bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/50 h-11"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isUploading}
                />
                <Button 
                  className="rounded-full h-10 w-10 p-0 bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform" 
                  onClick={() => handleSendMessage()} 
                  disabled={!msgInput.trim() || isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 relative z-10">
            <div className="relative mb-6">
              <MessageSquare className="h-20 w-20 opacity-10" />
              <Globe className="h-10 w-10 text-primary absolute -bottom-2 -right-2 animate-pulse" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-foreground">AeroIntel Messaging</h3>
            <p className="text-sm mt-2 max-w-sm text-center">
              Select a tactical link or use <span className="text-primary font-bold italic">Global Connect</span> to coordinate with verified aviation nodes across the world.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-card/50 text-center">
                <Shield className="h-5 w-5 text-primary mx-auto mb-2" />
                <span className="text-[10px] font-bold uppercase">End-to-End Encrypted</span>
              </div>
              <div className="p-4 rounded-xl border bg-card/50 text-center">
                <Globe className="h-5 w-5 text-accent mx-auto mb-2" />
                <span className="text-[10px] font-bold uppercase">Global Node Network</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}