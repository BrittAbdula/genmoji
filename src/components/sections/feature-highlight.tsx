"use client";

import { Section } from "@/components/section";
import { Button, buttonVariants } from "@/components/ui/button";
import { easeOutCubic } from "@/lib/animation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from "react";
import { UnifiedGenmojiGenerator } from "../unified-genmoji-generator";
import { Sparkles } from "lucide-react";
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

  const textVariants = {
    hidden: { opacity: 0, x: isLTR ? -20 : 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: isLTR ? -10 : 10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: easeOutCubic,
      },
    },
  };

  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-between pb-10 transition-all duration-500 ease-out",
        isLTR ? "lg:flex-row" : "lg:flex-row-reverse"
      )}
    >
      <motion.div
        className={cn(
          "w-full lg:w-1/2 mb-10 lg:mb-0",
          isLTR ? "lg:pr-8" : "lg:pl-8"
        )}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        variants={textVariants}
      >
        <div className="flex flex-col gap-4 max-w-sm text-center lg:text-left mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold"
            variants={itemVariants}
          >
            {t(`${translationKey}.title`)}
          </motion.h2>
          <motion.p className="text-xl md:text-2xl" variants={itemVariants}>
            {t(`${translationKey}.description`)}
          </motion.p>
          <motion.div variants={itemVariants}>
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
          </motion.div>
        </div>
      </motion.div>
      <div className="w-full lg:w-1/2">
        <img
          src={imageSrcBlack}
          className="hidden dark:block"
          alt={t(`${translationKey}.title`) + ' - Dark Mode'}
        />
        <img
          src={imageSrc}
          className="block dark:hidden"
          alt={t(`${translationKey}.title`) + ' - Light Mode'}
        />
      </div>
    </motion.div>
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

  const [activeFeature, setActiveFeature] = useState(-1);
  const containerRef = useRef<HTMLElement>(null);
  const t = useTranslations('featureHighlight');

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (container) {
        const { top, bottom } = container.getBoundingClientRect();
        const middleOfScreen = window.innerHeight / 2;
        const featureHeight = (bottom - top) / features.length;

        const activeIndex = Math.floor((middleOfScreen - top) / featureHeight);
        setActiveFeature(
          Math.max(-1, Math.min(features.length - 1, activeIndex))
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [features.length]);

  return (
    <Section
      id="feature-highlight"
      title={t('title')}
      subtitle={t('subtitle')}
      className="container px-10"
      ref={containerRef}
    >
      {features.map((feature, index) => (
        <Feature key={index} isActive={activeFeature === index} {...feature} />
      ))}
    </Section>
  );
}
