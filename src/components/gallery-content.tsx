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
        
      const newEmojis = await getEmojis(0, limit, locale, query);
      
      if (newEmojis && newEmojis.length > 0) {
        // 更新最新时间戳
        latestTimestampRef.current = newEmojis[0].created_at;
        
        // 将新的 emoji 添加到列表前端
        setEmojis(prev => {
          const newList = [...newEmojis, ...prev];
          // 去重，以防有重复的 emoji
          return Array.from(new Map(newList.map(item => [item.slug, item])).values());
        });
      }
    } catch (error) {
      console.error('Error checking new emojis:', error);
    }
  };

  // 初始化自动刷新
  useEffect(() => {
    // 启动定时器
    refreshIntervalRef.current = setInterval(checkNewEmojis, 10000);

    // 清理函数
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [locale]);

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
      <div className="relative z-10">
        <div className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
          {emojis.map((emoji, index) => (
            <motion.div
              key={`${emoji.slug}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index % 12 * 0.05 }}
            >
              <EmojiContainer
                emoji={emoji}
                size="md"
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