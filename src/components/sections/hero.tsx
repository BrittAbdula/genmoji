"use client";

import { motion, LazyMotion, domAnimation } from "framer-motion";
import { easeInOutCubic } from "@/lib/animation";
import { outfit } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { AuroraText } from "@/components/ui/aurora-text";
import { UnifiedGenmojiGenerator } from "@/components/unified-genmoji-generator";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { EmojiShowcase } from "./emoji-showcase";
import { ChevronRight } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { memo } from "react";
import { ReactNode } from 'react';

// Memoized Title component
const Title = memo(({ title }: { title: string }) => (
  <h1 className={cn(
    "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
    outfit.className
  )}>
    <AuroraText>{title}</AuroraText>
  </h1>
));

// Memoized Subtitle component
const Subtitle = memo(({ text }: { text: string }) => (
  <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl">
    {text}
  </p>
));

export function Hero() {
  const t = useTranslations('hero');

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative min-h-[100dvh] w-full overflow-hidden">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
          )}
        />
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
            <div className="flex flex-col items-center max-w-5xl mx-auto text-center mb-8">
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
            className="w-full mt-auto"
          >
            <EmojiShowcase />
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
