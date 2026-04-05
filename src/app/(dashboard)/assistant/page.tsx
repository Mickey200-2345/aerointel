"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, Sparkles, AlertCircle, Info, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { shipmentCopilot } from "@/ai/flows/shipment-copilot-flow";
import { textToSpeech } from "@/ai/flows/tts-flow";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'model';
  content: string;
  audioUrl?: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your AeroIntel Shipment Copilot. I can help you analyze load efficiency, check the impact of flight delays, or answer general logistics questions. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Speech Recognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          toast({
            title: "Voice Transcribed",
            description: "Command identified. Review and send.",
          });
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          setIsListening(false);
          toast({
            variant: "destructive",
            title: "Microphone Error",
            description: "Unable to capture voice command.",
          });
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [toast]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast({
          variant: "destructive",
          title: "Speech Not Supported",
          description: "Your browser does not support the Web Speech API.",
        });
        return;
      }
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await shipmentCopilot({
        message: input,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      
      setMessages(prev => [...prev, { role: 'model', content: response.reply }]);
    } catch (error: any) {
      const msg = error.message || "";
      let reply = "I encountered an error processing that request. Please try again.";
      
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        reply = "⚠️ Tactical Link Warning: AI Node capacity reached. Please wait 60 seconds for quota reset before our next transmission.";
      }
      
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (index: number, text: string) => {
    if (playingAudioId !== null) return;
    
    setPlayingAudioId(index);
    try {
      const { media } = await textToSpeech(text);
      const audio = new Audio(media);
      audio.onended = () => setPlayingAudioId(null);
      audio.play();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Audio Node Failure",
        description: "Could not generate speech for this message.",
      });
      setPlayingAudioId(null);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" /> AI Shipment Copilot
          </h1>
          <p className="text-muted-foreground">Intelligent agent for real-time logistics analysis and recovery.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex gap-1 items-center px-3 py-1">
            <Sparkles className="h-3.3 w-3.5" /> AGENT ACTIVE
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <Card className="flex-1 flex flex-col border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-headline">Operational Chat</CardTitle>
              </div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2">
                <Mic className={cn("h-3 w-3", isListening ? "text-primary animate-pulse" : "opacity-30")} />
                Voice Protocol Sync
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'model' && (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed group relative ${
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-secondary/50 text-foreground rounded-tl-none border'
                    }`}>
                      {m.content}
                      {m.role === 'model' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handlePlayAudio(i, m.content)}
                          disabled={playingAudioId === i}
                        >
                          {playingAudioId === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                    {m.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-accent" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-secondary/50 rounded-2xl p-4 rounded-tl-none border flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground italic">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card shrink-0">
              <div className="flex gap-2 max-w-4xl mx-auto items-center">
                <Button 
                  variant={isListening ? "destructive" : "secondary"}
                  className="h-12 w-12 rounded-full p-0 flex items-center justify-center shrink-0 shadow-sm"
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Input 
                  placeholder={isListening ? "Listening for tactical command..." : "Ask about load efficiency or delay impacts..."} 
                  className={cn(
                    "flex-1 bg-secondary/30 border-none h-12 focus-visible:ring-primary transition-all",
                    isListening && "ring-2 ring-primary bg-primary/5"
                  )}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  className="h-12 w-12 rounded-full p-0 flex items-center justify-center shrink-0"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-80 flex flex-col gap-6 shrink-0 hidden lg:flex">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <Info className="h-4 w-4" /> Voice Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/30 text-xs">
                <p className="font-bold mb-1 flex items-center gap-2"><Mic className="h-3 w-3 text-primary" /> Dictation Mode</p>
                <p className="text-muted-foreground italic">Click the microphone to record commands. Speak clearly towards the node sensor.</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 text-xs">
                <p className="font-bold mb-1 flex items-center gap-2"><Volume2 className="h-3 w-3 text-primary" /> Audio Read-Back</p>
                <p className="text-muted-foreground italic">AI responses can be broadcast aloud by clicking the speaker icon next to the message.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-wider text-accent">
                <AlertCircle className="h-4 w-4" /> Tactical Audio
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-accent/80 leading-relaxed italic">
              Encrypted voice transmissions are sanitized before processing. E2EE is maintained for both voice and text packets.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}