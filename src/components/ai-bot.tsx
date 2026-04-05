"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import botAnimation from "./bot.json";
import { cn } from "@/lib/utils";

/**
 * @fileOverview High-fidelity AI Bot component.
 * Uses dynamic imports to ensure the Lottie engine only initializes on the client.
 */

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface AIBotProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function AIBot({ width = 120, height = 120, className }: AIBotProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ width, height }} className={cn("bg-primary/5 rounded-full animate-pulse", className)} />;
  }

  return (
    <div 
      style={{ width, height }} 
      className={cn("flex items-center justify-center bot relative", className)}
    >
      <Lottie 
        animationData={botAnimation} 
        loop={true} 
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}