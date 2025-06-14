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

export function HorizontalGalleryContent({model}: {model?: string}) {
  const t = useTranslations();
  const router = useRouter();
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const limit = 24; // Reduced from 40 to 24 for better performance
  const locale = useLocale();

  const fetchEmojis = async (retryCount = 2) => { // Reduced retries from 3 to 2
    try {
      setError(null);
      const newEmojis = model ? await getEmojis(0, limit, locale, {
        sort: 'latest',
        model: model
      }) : await getEmojis(0, limit, locale, {
        sort: 'latest'
      });
      setEmojis(newEmojis || []);
    } catch (error) {
      console.error('Error fetching emojis:', error);
      if (retryCount > 0) {
        const delay = 1000 * (3 - retryCount); // Shorter delays
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchEmojis(retryCount - 1);
      }
      setError(t('error.failed'));
      setEmojis([]);
    } finally {
      setLoading(false);
    }
  };

  // Lazy load when component becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          fetchEmojis();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const element = document.getElementById('horizontal-gallery');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [locale, isVisible]);

  // 调整单元格样式确保完全正方形
  const cellWidth = "w-full min-h-[90px] aspect-square";
  // 优化网格布局，减少间距，确保正方形
  const gridClass = "grid w-full grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-10 place-content-center justify-items-center gap-2 max-w-7xl mx-auto min-h-[400px]";

  const renderContent = () => {
    if (loading) {
      return (
        <div className={gridClass}>
          {Array.from({ length: limit }).map((_, i) => (
            <div key={`loading-skeleton-${i}`} className={`${cellWidth} rounded-lg bg-muted animate-pulse`} />
          ))}
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto min-h-[400px]">
        <Suspense fallback={
          <div className={gridClass}>
            {[...Array(limit)].map((_, i) => (
              <div key={i} className={`${cellWidth} rounded-lg bg-muted animate-pulse`} />
            ))}
          </div>
        }>
        <div className={gridClass}>
            {emojis.map((emoji, index) => (
                <EmojiContainer 
                  key={`${emoji.slug}-${index}`} 
                  emoji={emoji} 
                  size="sm" 
                  lazyLoad={index > 8} 
                  padding="p-0.5" 
                  withBorder={true}
                  priority={index <= 8}
                />
            ))}
          </div>
        </Suspense>
      </div>
    );
  };

  return (
    <div id="horizontal-gallery" className="w-full max-w-[1400px] mx-auto px-2 space-y-4 min-h-[600px]">
      <h2 className={cn(
    "text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold tracking-tight gradient-text",
    outfit.className
  )}>
          {t('generator.recentTitle')}
      </h2>
      {renderContent()}
      <div className="flex justify-center pt-2">
        <Button
          onClick={() => model ? router.push(`/${locale}/model/${model}/`) : router.push('/gallery')}
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