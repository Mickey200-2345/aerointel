"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Sparkles, AlertTriangle, Mic, MicOff, Volume2, ShieldCheck, Activity, Terminal, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supportBot } from "@/ai/flows/support-bot-flow";
import { textToSpeech } from "@/ai/flows/tts-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import AIBot from "./ai-bot";

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function SupportBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "AeroLink-7 Tactical Support Node online. Handshake verified. How can I assist with your logistics operations today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
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
          if (transcript) {
            setInput(transcript);
            toast({
              title: "Voice Command Captured",
              description: "Transmission transcribed. Review and broadcast.",
            });
          }
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("STT Error:", event.error);
          setIsListening(false);
          if (event.error !== 'no-speech') {
            toast({
              variant: "destructive",
              title: "Sensor Conflict",
              description: "Unable to establish voice link. Check hardware permissions.",
            });
          }
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
  }, [messages, isOpen, isLoading]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        toast({
          variant: "destructive",
          title: "Incompatible Hardware",
          description: "This node does not support the Web Speech Protocol.",
        });
        return;
      }
      setInput("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech start error:", e);
      }
    }
  }, [isListening, toast]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await supportBot({
        message: currentInput,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      
      setMessages(prev => [...prev, { role: 'model', content: response.reply }]);
    } catch (error: any) {
      const msg = error.message || "";
      let reply = "Transmission Failure: Link to AeroLink-7 node has been severed. Check terminal connection.";
      
      if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
        reply = "⚠️ Tactical Warning: AI Node capacity exceeded. Free Tier quota reset in 60s. Handshake on standby.";
      }
      
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAudio = async (index: number, text: string) => {
    if (playingAudioId === index) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setPlayingAudioId(index);
    try {
      const { media } = await textToSpeech(text);
      if (audioRef.current) {
        audioRef.current.src = media;
      } else {
        audioRef.current = new Audio(media);
      }
      
      audioRef.current.onended = () => setPlayingAudioId(null);
      audioRef.current.onerror = () => {
        setPlayingAudioId(null);
        toast({ variant: "destructive", title: "Audio Node Error", description: "Codec mismatch in WAV stream." });
      };
      audioRef.current.play();
    } catch (error) {
      setPlayingAudioId(null);
      toast({
        variant: "destructive",
        title: "Audio Link Failed",
        description: "TTS Node reported a synthesis error.",
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <Card className="w-72 md:w-[320px] h-[480px] flex flex-col border-none shadow-2xl overflow-hidden glass-morphism animate-in slide-in-from-bottom-4 duration-300 mb-4 rounded-[1.5rem]">
          <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
          <div className="scanline opacity-10" />
          
          <CardHeader className="bg-primary p-4 shrink-0 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-white/20 shadow-lg bg-black flex items-center justify-center">
                  <AIBot width={40} height={40} />
                  <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none" />
                </div>
                <div>
                  <CardTitle className="text-xs font-headline text-white uppercase tracking-[0.1em] italic">AeroLink-7</CardTitle>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,1)]" />
                    <p className="text-[8px] text-white/80 font-black uppercase tracking-widest">Active</p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10 rounded-lg" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-background/40 relative z-10">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={cn("flex flex-col gap-1", m.role === 'user' ? 'items-end' : 'items-start')}>
                    <div className={cn(
                      "max-w-[90%] rounded-[1.2rem] p-3 text-xs leading-relaxed shadow-md transition-all group relative",
                      m.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : 'bg-card text-foreground rounded-tl-none border border-border/50'
                    )}>
                      {m.content}
                      {m.role === 'model' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 absolute -right-8 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary/50 rounded-full border border-primary/20"
                          onClick={() => handlePlayAudio(i, m.content)}
                          disabled={playingAudioId !== null && playingAudioId !== i}
                        >
                          {playingAudioId === i ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <Volume2 className="h-3 w-3 text-primary" />}
                        </Button>
                      )}
                    </div>
                    <div className={cn("flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest opacity-40 px-1.5", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                      {m.role === 'user' ? <Terminal className="h-2.5 w-2.5" /> : <Bot className="h-2.5 w-2.5" />}
                      <span>{m.role === 'user' ? 'Operator' : 'A7 Node'}</span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Activity className="h-3 w-3 animate-pulse text-primary" />
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-3 rounded-tl-none border border-dashed border-primary/30 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                        <span className="text-[8px] text-primary font-black uppercase tracking-[0.1em]">Syncing...</span>
                      </div>
                      <div className="h-0.5 w-16 bg-primary/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-progress-indefinite" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-card/60 backdrop-blur-xl shrink-0">
              <div className="flex gap-2 bg-secondary/40 rounded-full p-1 items-center border border-primary/10 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-inner">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-9 w-9 rounded-full shrink-0 transition-all", 
                    isListening ? "bg-destructive text-white animate-pulse" : "hover:bg-primary/10 text-muted-foreground"
                  )}
                  onClick={toggleListening}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input 
                  placeholder={isListening ? "Listening..." : "Protocol query..."} 
                  className="bg-transparent border-none focus-visible:ring-0 text-[11px] h-9 placeholder:text-muted-foreground/40 font-bold"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button 
                  size="icon" 
                  className="h-9 w-9 rounded-full bg-primary shrink-0 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex justify-center gap-4 opacity-30">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  <span className="text-[7px] font-black uppercase tracking-widest">E2EE</span>
                </div>
                <div className="flex items-center gap-1">
                  <Terminal className="h-2.5 w-2.5" />
                  <span className="text-[7px] font-black uppercase tracking-widest">A7-7A</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-[1.2rem] shadow-2xl transition-all duration-500 hover:scale-110 p-0 overflow-hidden group border-2",
          isOpen ? "bg-destructive border-destructive/20 shadow-destructive/40" : "bg-primary border-primary/20 shadow-primary/40"
        )}
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <div className="relative h-full w-full flex items-center justify-center bg-black">
            <AIBot width={50} height={50} />
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-400 border-2 border-background rounded-full m-1 shadow-[0_0_8px_rgba(74,222,128,1)] animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <Terminal className="h-5 w-5 text-white drop-shadow-lg" />
            </div>
          </div>
        )}
      </Button>
    </div>
  );
}