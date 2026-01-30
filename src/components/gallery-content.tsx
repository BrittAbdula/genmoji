"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { getEmojis } from '@/lib/api'
import EmojiContainer from "@/components/emoji-container";
import { Emoji } from "@/types/emoji";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale} from 'next-intl';
import { useInView } from "react-intersection-observer";
import { Link } from "@/i18n/routing";


// 将加载状态组件抽离
const LoadingSkeleton = memo(() => {
  return (
    <div className="grid w-full auto-rows-max grid-cols-2 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 max-w-7xl mx-auto">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={`loading-skeleton-${i}`}
          className="aspect-square bg-muted/20 animate-pulse"
        />
      ))}
    </div>
  );
});
LoadingSkeleton.displayName = 'LoadingSkeleton';

export function GalleryContent() {
  const t = useTranslations('gallery');
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 24; // 减小每页加载数量以提升性能
  const locale = useLocale();
  const loadingRef = useRef(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const latestTimestampRef = useRef<string>();
  const refreshLimit = 6; // 每次刷新获取的最新表情数量
  
  // 使用 ref 来存储缓存，避免重渲染
  const cache = useRef<Map<string, Emoji[]>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // 使用 intersection observer 监测滚动
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // 检查新的 genmoji
  const checkNewEmojis = async () => {
    if (loadingRef.current) return; // 如果在加载中，不检查新内容
    
    try {
        
      const newEmojis = await getEmojis(0, refreshLimit, locale, {
        sort: 'latest',
        isIndexable: true,
      });
      
      if (newEmojis && newEmojis.length > 0) {
        // 更新最新时间戳
        latestTimestampRef.current = newEmojis[0].created_at;
        
        // 将新的 emoji 添加到列表前端，保持原有列表不变
        setEmojis(prev => {
          // 只添加不存在的新表情
          const existingSlugs = new Set(prev.map(emoji => emoji.slug));
          const uniqueNewEmojis = newEmojis.filter(emoji => !existingSlugs.has(emoji.slug));
          
          if (uniqueNewEmojis.length === 0) return prev; // 如果没有新的表情，保持不变
          
          return [...uniqueNewEmojis, ...prev];
        });
      }
    } catch (error) {
      console.error('Error checking new emojis:', error);
    }
  };

  // 启动自动刷新
  const startAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    refreshIntervalRef.current = setInterval(checkNewEmojis, 15000);
  }, []);

  // 停止自动刷新
  const stopAutoRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = undefined;
    }
  }, []);

  // 初始化自动刷新
  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, [locale]);

  const fetchEmojis = async (pageNum: number, retryCount = 3) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    const cacheKey = `${pageNum}-${locale}`;

    // 如果有缓存数据，直接使用
    if (cache.current.has(cacheKey)) {
      const cachedData = cache.current.get(cacheKey)!;
      if (pageNum === 1) {
        setEmojis(cachedData);
        // 更新最新时间戳
        if (cachedData.length > 0) {
          latestTimestampRef.current = cachedData[0].created_at;
        }
      } else {
        setEmojis(prev => [...prev, ...cachedData]);
      }
      setHasMore(cachedData.length === limit);
      setLoading(false);
      loadingRef.current = false;
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setError(null);
      const emojis = await getEmojis(
        ((pageNum - 1) * limit),
        limit,
        locale,
        {
          sort: 'latest',
          isIndexable: true,
        }
      );

      // 缓存新数据
      cache.current.set(cacheKey, emojis || []);

      if (pageNum === 1) {
        setEmojis(emojis || []);
        // 更新最新时间戳
        if (emojis && emojis.length > 0) {
          latestTimestampRef.current = emojis[0].created_at;
        }
      } else {
        setEmojis(prev => [...prev, ...(emojis || [])]);
      }
      setHasMore(emojis?.length === limit);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // 忽略已取消的请求错误
      }

      console.error('Error fetching emojis:', error);
      if (retryCount > 0) {
        // 重试延迟增加
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

  // 初始化加载数据
  useEffect(() => {
    fetchEmojis(1);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [locale]);

  // 监听滚动加载更多
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingRef.current) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchEmojis(page);
    }
  }, [page]);

  const renderContent = () => {
    if (loading && page === 1) {
      return <LoadingSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => fetchEmojis(page)}
            variant="outline"
            className="mt-4"
          >
            {t('retry')}
          </Button>
        </div>
      );
    }

    if (emojis.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noResults')}</p>
        </div>
      );
    }

    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
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
        {hasMore && (
          <div
            ref={loadMoreRef}
            className="w-full h-16 flex items-center justify-center mt-8"
          >
            {loading && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
} 
