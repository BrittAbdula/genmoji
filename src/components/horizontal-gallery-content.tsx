"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { getEmojis } from '@/lib/api'
import EmojiContainer from "@/components/emoji-container";
import { Emoji } from "@/types/emoji";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale} from 'next-intl';
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AuroraText } from "@/components/ui/aurora-text";
import { outfit } from "@/lib/fonts";

export function HorizontalGalleryContent() {
  const t = useTranslations();
  const router = useRouter();
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragCount, setDragCount] = useState(0);
  const limit = 16;
  const locale = useLocale();
  const loadingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  const fetchEmojis = async (pageNum: number, retryCount = 3) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    try {
      setError(null);
      const newEmojis = await getEmojis(
        ((pageNum - 1) * limit),
        limit,
        locale,
        ""
      );

      if (pageNum === 1) {
        setEmojis(newEmojis || []);
      } else {
        setEmojis(prev => [...prev, ...(newEmojis || [])]);
      }
      setHasMore(newEmojis?.length === limit);
    } catch (error) {
      console.error('Error fetching emojis:', error);
      if (retryCount > 0) {
        const delay = (3 - retryCount + 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        loadingRef.current = false;
        return fetchEmojis(pageNum, retryCount - 1);
      }
      
      setError(t('error.failed'));
      setEmojis([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    fetchEmojis(1);
  }, [locale]);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    if ('touches' in e) {
      startXRef.current = e.touches[0].clientX;
    } else {
      startXRef.current = e.clientX;
    }
  };

  const handleDragEnd = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    
    const endX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = startXRef.current - endX;
    
    if (deltaX < -100 && hasMore) {
      const newDragCount = dragCount + 1;
      setDragCount(newDragCount);
      
      if (newDragCount >= 3) {
        router.push('/gallery');
      } else {
        setPage(prev => prev + 1);
      }
    }
    
    isDraggingRef.current = false;
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
  };

  useEffect(() => {
    if (page > 1) {
      fetchEmojis(page);
    }
  }, [page]);

  // Preload next page when current page is loaded
  useEffect(() => {
    if (hasMore && !loading && emojis.length > 0) {
      const currentPage = Math.ceil(emojis.length / limit);
      fetchEmojis(currentPage + 1);
    }
  }, [emojis, hasMore, loading]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollBy({
        left: -container.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollBy({
        left: container.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const renderContent = () => {
    if (loading && page === 1) {
      return (
        <div className="grid w-full auto-rows-max grid-cols-4 place-content-center justify-items-center gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`loading-skeleton-${i}`} className="aspect-square rounded-lg bg-muted animate-pulse w-full" />
          ))}
        </div>
      );
    }

    const pages = [];
    for (let i = 0; i < emojis.length; i += limit) {
      pages.push(emojis.slice(i, i + limit));
    }

    return (
      <div className="relative group max-w-7xl mx-auto">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-8 snap-x snap-mandatory hide-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {pages.map((pageEmojis, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 snap-start w-full"
            >
              <div className="grid w-full auto-rows-max grid-cols-4 place-content-center justify-items-center gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                {pageEmojis.map((emoji, index) => (
                  <motion.div
                    key={`${emoji.slug}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="relative isolate select-none rounded-xl bg-transparent hover:bg-gray-100/10 dark:hover:bg-gray-800/50 transition-colors duration-200 ease-out p-2">
                      <EmojiContainer
                        emoji={emoji}
                        size="md"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex-shrink-0 w-32 h-32 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
          {hasMore && !loading && (
            <div className="flex-shrink-0 w-32 flex items-center justify-center">
              <motion.div
                animate={{
                  x: [0, 10, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex flex-col items-center gap-2 text-muted-foreground"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.div>
            </div>
          )}
        </div>
        
        {/* 滚动按钮 */}
        <button
          onClick={scrollLeft}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-10",
            "w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm",
            "flex items-center justify-center",
            "border border-border shadow-sm",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "hover:bg-background"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollRight}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-10",
            "w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm",
            "flex items-center justify-center",
            "border border-border shadow-sm",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "hover:bg-background"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
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