"use client";

import { outfit } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Shield, Zap } from "lucide-react";
import { memo } from "react";

const UnifiedGenmojiGenerator = dynamic(
  () => import("@/components/unified-genmoji-generator").then(mod => ({ default: mod.UnifiedGenmojiGenerator })),
  { 
    ssr: false, 
    loading: () => (
      <div className="w-full h-[400px] rounded-xl border bg-card/50 animate-pulse shadow-sm border-muted-foreground/10" />
    ) 
  }
);

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

  return (
      <section className="relative w-full overflow-hidden">
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
        <div className="relative z-20 flex flex-col">
          {/* Main Content */}
          <div 
            className="flex flex-col items-center px-4 pt-8 pb-8 md:pt-12 md:pb-10"
          >
            <div className="flex flex-col items-center max-w-5xl mx-auto text-center mb-6">
              <Title title={t('title')} />
              <Subtitle text={t('subtitle')} />
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  <span>{t('trustBadges.users')}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>{t('trustBadges.freeToTry')}</span>
                </span>
                <span className="hidden sm:flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>{t('trustBadges.noCard')}</span>
                </span>
              </div>
            </div>

            <div className="w-full max-w-2xl mx-auto">
              <UnifiedGenmojiGenerator />
            </div>
          </div>

          {/* Showcase removed to improve initial load performance */}
        </div>
      </section>
  );
}
