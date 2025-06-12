"use client";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from "react";
import { UnifiedGenmojiGenerator } from "../unified-genmoji-generator";
import { Sparkles } from "lucide-react";
import Image from "next/image";

interface FeatureProps {
  translationKey: string;
  imageSrc: string;
  imageSrcBlack: string;
  direction: "ltr" | "rtl";
  isActive: boolean;
}

function Feature({
  translationKey,
  imageSrc,
  imageSrcBlack,
  direction,
  isActive,
}: FeatureProps) {
  const isLTR = direction === "ltr";
  const t = useTranslations('featureHighlight');
  const common = useTranslations('common');

  // Pre-load both images to prevent CLS
  useEffect(() => {
    const imgLight = new window.Image();
    const imgDark = new window.Image();
    imgLight.src = imageSrc;
    imgDark.src = imageSrcBlack;
  }, [imageSrc, imageSrcBlack]);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between pb-10 transition-all duration-700 ease-out",
        isLTR ? "lg:flex-row" : "lg:flex-row-reverse",
        isActive ? "opacity-100 translate-y-0" : "opacity-60 translate-y-4"
      )}
    >
      <div
        className={cn(
          "w-full lg:w-2/5 mb-10 lg:mb-0 transition-all duration-500 ease-out",
          isLTR ? "lg:pr-6" : "lg:pl-6",
          isActive ? "opacity-100 translate-x-0" : `opacity-70 ${isLTR ? "-translate-x-2" : "translate-x-2"}`
        )}
      >
        <div className="flex flex-col gap-4 max-w-sm text-center lg:text-left mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold transition-all duration-500 ease-out">
            {t(`${translationKey}.title`)}
          </h2>
          <p className="text-xl md:text-2xl transition-all duration-500 delay-100 ease-out">
            {t(`${translationKey}.description`)}
          </p>
          <div className="transition-all duration-500 delay-200 ease-out">
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
                  {common('cta')}
                </Button>
              }
            />
          </div>
        </div>
      </div>
      <div className="w-full lg:w-3/5 h-[350px] sm:h-[400px] md:h-[450px] relative">
        <div className="w-full h-full relative flex items-center justify-center">
          {/* Dark mode image */}
          <div className="hidden dark:block w-full h-full max-w-[500px] max-h-[500px] aspect-square mx-auto">
            <Image
              src={imageSrcBlack}
              alt={t(`${translationKey}.title`) + ' - Dark Mode'}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
          {/* Light mode image */}
          <div className="block dark:hidden w-full h-full max-w-[500px] max-h-[500px] aspect-square mx-auto">
            <Image
              src={imageSrc}
              alt={t(`${translationKey}.title`) + ' - Light Mode'}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureHighlight() {
  const features = [
    {
      translationKey: 'textToGenmoji',
      imageSrc: "/hero-2.png",
      imageSrcBlack: "/hero-2-black.png",
      direction: "rtl" as const,
    },
    {
      translationKey: 'imageToGenmoji',
      imageSrc: "/hero-4.png",
      imageSrcBlack: "/hero-4-black.png",
      direction: "ltr" as const,
    },
    {
      translationKey: 'compatibility',
      imageSrc: "/hero-3.png",
      imageSrcBlack: "/hero-3-black.png",
      direction: "rtl" as const,
    },
  ];

  const [activeFeature, setActiveFeature] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const t = useTranslations('featureHighlight');

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const container = containerRef.current;
          if (container) {
            const { top, bottom } = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            if (top < viewportHeight && bottom > 0) {
              const containerHeight = bottom - top;
              const scrollProgress = Math.max(0, Math.min(1, (viewportHeight / 2 - top) / containerHeight));
              const newActiveIndex = Math.floor(scrollProgress * features.length);
              setActiveFeature(Math.max(0, Math.min(features.length - 1, newActiveIndex)));
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [features.length]);

  return (
    <Section
      id="feature-highlight"
      title={t('title')}
      subtitle={t('subtitle')}
      className="container px-6"
      ref={containerRef}
    >
      {features.map((feature, index) => (
        <Feature key={index} isActive={activeFeature === index} {...feature} />
      ))}
    </Section>
  );
}
