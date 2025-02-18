"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { getEmojis } from '@/lib/api'
import EmojiContainer from "@/components/emoji-container";
import { Emoji } from "@/types/emoji";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { useTranslations, useLocale} from 'next-intl';
import { debounce } from "lodash";
import { useInView } from "react-intersection-observer";

export function GalleryContent() {
  const t = useTranslations('gallery');
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
    if (searchQuery || loadingRef.current) return; // 如果在搜索或加载中，不检查新内容
    
    try {
      // 构建查询字符串，包含时间戳
      const query = latestTimestampRef.current 
        ? `after:${latestTimestampRef.current}`
        : "";
        
      const newEmojis = await getEmojis(0, refreshLimit, locale, query);
      
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
    if (!searchQuery) {
      startAutoRefresh();
    }
    return () => stopAutoRefresh();
  }, [locale, searchQuery]);

  const fetchEmojis = async (pageNum: number, query: string = "", retryCount = 3) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    const cacheKey = `${query}-${pageNum}-${locale}`;

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
        query
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
        return fetchEmojis(pageNum, query, retryCount - 1);
      }
      
      setError(t('error.failed'));
      setEmojis([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // 使用防抖处理搜索查询
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setEmojis([]);
      setPage(1);
      setLoading(true);
      // 重置最新时间戳
      latestTimestampRef.current = undefined;
      // 如果搜索为空，重新启动自动刷新
      if (!query) {
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
      fetchEmojis(1, query);
    }, 300),
    [locale]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    
    return () => {
      debouncedSearch.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, locale]);

  // 监听滚动加载更多
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingRef.current) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchEmojis(page, searchQuery);
    }
  }, [page]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const renderContent = () => {
    if (loading && page === 1) {
      return (
        <div className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={`loading-skeleton-${i}`} className="aspect-square rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={() => fetchEmojis(page, searchQuery)}
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
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <div className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {emojis.map((emoji, index) => (
            <motion.div
              key={`${emoji.slug}-${index}`}
              className="relative isolate select-none rounded-xl bg-transparent hover:bg-gray-100/10 dark:hover:bg-gray-800/50 transition-colors duration-200 ease-out p-2"
            >
              <EmojiContainer
                emoji={emoji}
                size="lg"
              />
            </motion.div>
          ))}
        </div>

        {/* 无限加载触发器 */}
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
      <SearchBar onSearch={handleSearch} loading={loading} />
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
} 