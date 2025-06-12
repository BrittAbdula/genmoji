"use client";

import { outfit } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { UnifiedGenmojiGenerator } from "@/components/unified-genmoji-generator";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { EmojiShowcase } from "./emoji-showcase";
import { memo, useEffect, useState } from "react";

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

// Simplified static grid - no animation on load
const StaticGrid = memo(() => (
  <div 
    className={cn(
      "absolute inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 z-10 opacity-20",
      "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
    )}
    style={{
      backgroundImage: `linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      backgroundPosition: '-1px -1px'
    }}
  />
));
StaticGrid.displayName = "StaticGrid";

export function Hero() {
  const t = useTranslations('hero');
  const [isReady, setIsReady] = useState(false);
  
  // Delay showing showcase to improve LCP
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
      <section className="relative min-h-[100dvh] w-full overflow-hidden">
        {/* Simplified CSS Grid Pattern - no JS animations */}
        <StaticGrid />
        
        {/* Simplified gradient text animation */}
        <style jsx global>{`
          .gradient-text {
            background: linear-gradient(135deg, #ec4899, #a855f7, #06b6d4);
            background-size: 200% auto;
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            animation: gradient-shift 6s ease-in-out infinite;
          }
          
          @keyframes gradient-shift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
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
            className="flex-1 flex flex-col items-center justify-center px-4 pt-6"
          >
            <div className="flex flex-col items-center max-w-5xl mx-auto text-center mb-6 min-h-[160px] sm:min-h-[180px] flex justify-center">
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

          {/* Delayed showcase loading */}
          {isReady && (
            <div className="w-full mt-auto min-h-[240px] sm:min-h-[280px] md:min-h-[300px] lg:min-h-[340px]">
              <EmojiShowcase />
            </div>
          )}
        </div>
      </section>
  );
}
