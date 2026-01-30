"use client";

import { getEmojis } from '@/lib/api';
import { EmojiGrid } from '@/components/emoji-grid';
import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { Emoji } from '@/types/emoji';

interface StylePageClientProps {
  params: {
    style: string;
    locale: string;
  };
  initialData?: {
    emojis: Emoji[];
  };
}

export default function StylePageClient({ params, initialData }: StylePageClientProps) {
  const { style, locale } = params;
  const [emojis, setEmojis] = useState<Emoji[]>(initialData?.emojis || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialData?.emojis?.length || 0);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'quality'>('latest');

  const LIMIT = 24;

  // 加载更多表情
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const newEmojis = await getEmojis(offset, LIMIT, locale, { 
        model: style,
        sort: sortBy,
        isIndexable: true,
      });
      
      if (newEmojis && newEmojis.length > 0) {
        setEmojis(prev => [...prev, ...newEmojis]);
        setOffset(prev => prev + newEmojis.length);
        setHasMore(newEmojis.length === LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more emojis:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [offset, LIMIT, locale, style, sortBy, isLoadingMore, hasMore]);

  // 当排序方式改变时重新加载
  useEffect(() => {
    const reloadEmojis = async () => {
      setIsLoading(true);
      try {
        const newEmojis = await getEmojis(0, LIMIT, locale, { 
          model: style,
          sort: sortBy,
          isIndexable: true,
        });
        
        setEmojis(newEmojis || []);
        setOffset(newEmojis?.length || 0);
        setHasMore((newEmojis?.length || 0) === LIMIT);
      } catch (error) {
        console.error('Error reloading emojis:', error);
        setEmojis([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    reloadEmojis();
  }, [sortBy, style, locale]);

  if (isLoading) {
    return (
      <div className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <EmojiGrid 
      emojis={emojis} 
      onLoadMore={handleLoadMore}
      isLoading={isLoadingMore}
      hasMore={hasMore}
      model={style}
      maxScrollRounds={3}
      itemsPerRound={LIMIT}
    />
  );
}
