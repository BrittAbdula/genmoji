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

// Memoized GeneratorButton component
const GeneratorButton = memo(({ ctaText, onClick }: { ctaText: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      "group relative inline-flex items-center justify-center overflow-hidden rounded-lg px-8 py-3 font-medium",
      "transition-all duration-700 hover:-translate-y-0.5",
      "text-white text-base"
    )}
  >
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        "bg-[length:200%_200%] bg-gradient-to-r from-pink-500 via-pink-500 to-violet-500",
        "animate-rainbow-fade transition-all duration-700"
      )}
    />
    <div
      className={cn(
        "absolute inset-0.5 flex items-center justify-center rounded-[7px]",
        "bg-gradient-to-r from-pink-500 to-violet-500 opacity-0 transition-all duration-700",
        "group-hover:opacity-100 group-hover:inset-1"
      )}
    />
    <span className="relative flex items-center gap-2">
      <Sparkles className="w-4 h-4" />
      {ctaText}
    </span>
  </button>
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
          <motion.div 
            className="flex-1 flex flex-col items-center justify-center px-4 pt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center max-w-5xl mx-auto text-center mb-8">
              <Title title={t('title')} />
              <Subtitle text={t('subtitle')} />
            </div>

            <UnifiedGenmojiGenerator
              trigger={<GeneratorButton ctaText={t('cta')} />}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full mt-auto"
          >
            <EmojiShowcase />
          </motion.div>
        </div>
      </section>
    </LazyMotion>
  );
}
