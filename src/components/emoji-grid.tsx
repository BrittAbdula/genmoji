"use client";

import { Emoji, EmojiGridProps } from "@/types/emoji";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import EmojiContainer from "./emoji-container";

export function EmojiGrid({ 
  emojis, 
  onLoadMore,
  isLoading = false,
  hasMore = true 
}: EmojiGridProps) {
  const locale = useLocale();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 使用 intersection observer 监测滚动，自动加载更多
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
    triggerOnce: false
  });

  // 使用 useEffect 在视图变化时触发加载更多，而不是在渲染函数中直接调用
  useEffect(() => {
    if (inView && onLoadMore && !isLoading && hasMore) {
      onLoadMore();
    }
  }, [inView, onLoadMore, isLoading, hasMore]);

  // 渲染加载状态
  const renderLoadingState = () => (
    <div className="flex justify-center py-8 w-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  // 如果没有表情，显示空状态
  if (emojis.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No emojis found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-8 xl:grid-cols-10 place-content-stretch justify-items-stretch gap-1 max-w-7xl mx-auto">
        {emojis.map((emoji, index) => (
          <EmojiContainer
            key={`${emoji.slug}-${index}`}
            emoji={emoji}
            size="sm"
            lazyLoad={index > 12}
            priority={index < 6}
            withBorder={false}
            padding="p-0"
          />
        ))}
      </div>

      {/* 自动加载更多的触发区域 - 只放置一个引用点，实际加载逻辑在 useEffect 中处理 */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-4 w-full mt-8">
          {isLoading && renderLoadingState()}
        </div>
      )}
    </div>
  );
} 
