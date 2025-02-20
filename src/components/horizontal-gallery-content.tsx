"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { getEmojis } from '@/lib/api'
import EmojiContainer from "@/components/emoji-container";
import { Emoji } from "@/types/emoji";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AuroraText } from "@/components/ui/aurora-text";
import { outfit } from "@/lib/fonts";

export function HorizontalGalleryContent() {
  const t = useTranslations();
  const router = useRouter();
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 32;
  const locale = useLocale();

  const fetchEmojis = async (retryCount = 3) => {
    try {
      setError(null);
      const newEmojis = await getEmojis(0, limit, locale, "");
      setEmojis(newEmojis || []);
    } catch (error) {
      console.error('Error fetching emojis:', error);
      if (retryCount > 0) {
        const delay = (3 - retryCount + 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchEmojis(retryCount - 1);
      }
      setError(t('error.failed'));
      setEmojis([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmojis();
  }, [locale]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid w-full auto-rows-max grid-cols-4 place-content-center justify-items-center gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`loading-skeleton-${i}`} className="aspect-square rounded-lg bg-muted animate-pulse w-full" />
          ))}
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        }>
          <div className="grid w-full auto-rows-max grid-cols-4 place-items-center justify-items-center gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 mx-auto pt-4">
            {emojis.map((emoji, index) => (
              <div key={`${emoji.slug}-${index}`}>
                <EmojiContainer emoji={emoji} size="sm" />
              </div>
            ))}
          </div>
        </Suspense>
      </div>
    );
  };

  return (
    <motion.div
      className="w-full max-w-[1400px] mx-auto px-6 space-y-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <h2 className={cn("text-left px-4 text-2xl", outfit.className)}>
        <AuroraText as="span" className="text-2xl font-semibold">
          {t('generator.recentTitle')}
        </AuroraText>
      </h2>
      {renderContent()}
      <div className="flex justify-center pt-4">
        <Button
          onClick={() => router.push('/gallery')}
          variant="outline"
          className="group relative overflow-hidden rounded-full px-6 hover:bg-background/80"
        >
          <span className="relative z-10 flex items-center gap-2">
            {t('common.navigation.gallery')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
          <motion.div
            className="absolute inset-0 z-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20"
            animate={{
              x: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </Button>
      </div>
    </motion.div>
  );
} 