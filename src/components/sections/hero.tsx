"use client";

import { outfit } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { UnifiedGenmojiGenerator } from "@/components/unified-genmoji-generator";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { EmojiShowcase } from "./emoji-showcase";
import { ChevronRight } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { ReactNode } from 'react';

// Memoized Title component
const Title = memo(({ title }: { title: string }) => (
  <h1 className={cn(
    "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight gradient-text",
    outfit.className
  )}>
    {title}
  </h1>
));
Title.displayName = "Title";

// Memoized Subtitle component
const Subtitle = memo(({ text }: { text: string }) => (
  <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl">
    {text}
  </p>
));
Subtitle.displayName = "Subtitle";

// Deterministic grid positions
const generateGridPositions = (count: number) => {
  const positions = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    
    positions.push({
      top: `${(row * 100) / (gridSize - 1)}%`,
      left: `${(col * 100) / (gridSize - 1)}%`
    });
  }
  
  return positions;
};

export function Hero() {
  const t = useTranslations('hero');
  // Use deterministic grid positions
  const squarePositions = generateGridPositions(30);
  const [isReady, setIsReady] = useState(false);
  
  // Ensure component is fully mounted before showing animations
  useEffect(() => {
    setIsReady(true);
  }, []);

  return (
      <section className="relative min-h-[100dvh] w-full overflow-hidden">
        {/* CSS Grid Pattern */}
        <div 
          className={cn(
            "absolute inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 z-10",
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "grid-pattern"
          )}
        >
          {/* Animated Squares - only show after component is mounted */}
          {isReady && squarePositions.map((pos, i) => (
            <div 
              key={i} 
              className="animated-square"
              style={{ 
                animationDelay: `${i * 0.1}s`,
                top: pos.top,
                left: pos.left,
                opacity: 0
              }}
            />
          ))}
        </div>
        
        <style jsx>{`
          .grid-pattern {
            background-image: linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
            background-position: -1px -1px;
          }
          
          .animated-square {
            position: absolute;
            width: 39px;
            height: 39px;
            background-color: currentColor;
            opacity: 0;
            animation: fadeInOut 3s ease-in-out infinite;
          }
          
          @keyframes fadeInOut {
            0% { opacity: 0; }
            50% { opacity: 0.1; }
            100% { opacity: 0; }
          }
        `}</style>
        
        {/* Add global styles for gradient text */}
        <style jsx global>{`
          .gradient-text {
            background: linear-gradient(to right, #ec4899, #a855f7, #06b6d4);
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            animation: gradient-animation 8s linear infinite;
          }
          
          @keyframes gradient-animation {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}</style>
        
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background/90" />
        </div>

        {/* Content */}
        <div className="relative z-20 flex min-h-[100dvh] flex-col">
          {/* Main Content */}
          <div 
            className="flex-1 flex flex-col items-center justify-center px-4 pt-10"
          >
            <div className="flex flex-col items-center max-w-5xl mx-auto text-center mb-8 min-h-[160px] sm:min-h-[180px] flex justify-center">
              <Title title={t('title')} />
              <Subtitle text={t('subtitle')} />
            </div>

            <UnifiedGenmojiGenerator
              trigger={
                <Button
                  size="lg"
                  className={cn(
                    "rounded-md",
                    "px-8 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  {t('cta')}
                </Button>
              }
            />
          </div>

          <div
            className="w-full mt-auto min-h-[200px] sm:min-h-[240px]"
          >
            <EmojiShowcase />
          </div>
        </div>
      </section>
  );
}
