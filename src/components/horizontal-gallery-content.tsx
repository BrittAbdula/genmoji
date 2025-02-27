"use client";

import { useState, useEffect, Suspense } from "react";
import { getEmojis } from '@/lib/api'
import EmojiContainer from "@/components/emoji-container";
import { Emoji } from "@/types/emoji";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { outfit } from "@/lib/fonts";
import Image from "next/image";

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
          {Array.from({ length: limit }).map((_, i) => (
            <div key={`loading-skeleton-${i}`} className="aspect-square rounded-lg bg-muted animate-pulse w-full h-full min-h-[80px]" />
          ))}
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse w-full h-full min-h-[80px]" />
            ))}
          </div>
        }>
        <div className="grid w-full auto-rows-max grid-cols-4 place-items-center justify-items-center gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 mx-auto">
            {emojis.map((emoji, index) => (
              <div key={`${emoji.slug}-${index}`} className="w-full h-full min-h-[80px] flex items-center justify-center">
                <EmojiContainer emoji={emoji} size="sm" />
              </div>
            ))}
          </div>
        </Suspense>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 space-y-6">
      <h2 className={cn(
    "text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold tracking-tight gradient-text",
    outfit.className
  )}>
          {t('generator.recentTitle')}
      </h2>
      {renderContent()}
      <div className="flex justify-center pt-2">
        <Button
          onClick={() => router.push('/gallery')}
          variant="outline"
          className="rounded-full px-6 hover:bg-background/80 flex items-center gap-2"
        >
          {t('common.navigation.gallery')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
} 