"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Emoji } from "@/types/emoji";
import { getEmojis } from "@/lib/api";
import EmojiContainer from "@/components/emoji-container";
import { Link } from "@/i18n/routing";
import { useInView } from "react-intersection-observer";

interface PromptsCategoryClientProps {
  initialEmojis: Emoji[];
  category: string;
  locale: string;
}

export default function PromptsCategoryClient({
  initialEmojis,
  category,
  locale,
}: PromptsCategoryClientProps) {
  const INITIAL_LIMIT = 48;
  const LOAD_LIMIT = 24;
  const MAX_SCROLL_ROUNDS = 10;

  const normalizedCategory = useMemo(() => {
    return category === "all" ? undefined : category;
  }, [category]);

  const [emojis, setEmojis] = useState<Emoji[]>(initialEmojis || []);
  const [offset, setOffset] = useState<number>(initialEmojis?.length || 0);
  const [hasMore, setHasMore] = useState<boolean>(
    (initialEmojis?.length || 0) >= INITIAL_LIMIT
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
    triggerOnce: false,
  });

  useEffect(() => {
    setEmojis(initialEmojis || []);
    setOffset(initialEmojis?.length || 0);
    setHasMore((initialEmojis?.length || 0) >= INITIAL_LIMIT);
    setIsLoading(false);
    setLoadCount(0);
  }, [initialEmojis, category, locale]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const nextEmojis = await getEmojis(offset, LOAD_LIMIT, locale, {
        category: normalizedCategory,
        sort: "quality",
        isIndexable: true,
      });

      setEmojis((prev) => [...prev, ...(nextEmojis || [])]);
      setOffset((prev) => prev + (nextEmojis?.length || 0));
      setHasMore((nextEmojis?.length || 0) === LOAD_LIMIT);
    } catch (error) {
      console.error("Failed to load more prompts:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, offset, locale, normalizedCategory]);

  useEffect(() => {
    if (inView && hasMore && !isLoading && loadCount < MAX_SCROLL_ROUNDS) {
      handleLoadMore();
      setLoadCount((prev) => prev + 1);
    }
  }, [inView, hasMore, isLoading, loadCount, handleLoadMore]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid w-full auto-rows-max grid-cols-2 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {emojis.map((emoji, index) => (
          <div
            key={`${emoji.slug}-${index}`}
            className="group relative flex flex-col overflow-hidden rounded-none border bg-card transition-shadow hover:shadow-md"
          >
            <div className="aspect-square w-full">
              <EmojiContainer
                emoji={emoji}
                size="sm"
                lazyLoad={index > 8}
                padding="p-0"
                withBorder={false}
                priority={index <= 8}
              />
            </div>
            <Link
              href={`/emoji/${emoji.slug}`}
              className="flex flex-1 px-3 py-3 text-xs text-muted-foreground hover:text-primary transition-colors text-left"
            >
              {emoji.prompt}
            </Link>
          </div>
        ))}
      </div>

      {hasMore && loadCount < MAX_SCROLL_ROUNDS && (
        <div
          ref={loadMoreRef}
          className="w-full h-16 flex items-center justify-center mt-8"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          )}
        </div>
      )}
    </div>
  );
}
