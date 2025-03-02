"use client";

import { getEmojis, getEmojiGroups } from '@/lib/api';
import { EmojiGrid } from '@/components/emoji-grid';
import { RelatedCategories } from '@/components/related-categories';
import { FilterBar } from '@/components/filter-bar';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Emoji, Category, EmojiGroups } from '@/types/emoji';
import { usePathname } from 'next/navigation';
import { Breadcrumb, generateBreadcrumb } from '@/components/breadcrumb';

interface ColorPageClientProps {
  params: {
    slug: string;
    locale: string;
  };
  initialData?: {
    emojis: Emoji[];
    groups: EmojiGroups;
  };
}

export default function ColorPageClient({ params, initialData }: ColorPageClientProps) {
  const { slug, locale } = params;
  const colorName = initialData?.groups?.colors.find(color => color.name === slug)?.translated_name || 'Unknown Color';
  const pathname = usePathname();
  const breadcrumbItems = generateBreadcrumb(pathname, slug);
  
  // ===== 状态管理 =====
  const [emojis, setEmojis] = useState<Emoji[]>(initialData?.emojis || []);
  const [isLoading, setIsLoading] = useState(!initialData?.emojis);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [colors, setColors] = useState<Category[]>(
    initialData?.groups?.colors.map(color => ({
      id: color.name,
      name: color.name,
      slug: color.name,
      translated_name: color.translated_name
    })) || []
  );
  
  // 筛选与分页状态
  const [offset, setOffset] = useState(initialData?.emojis ? initialData.emojis.length : 0);
  const [sortBy, setSortBy] = useState("latest");
  
  // 跟踪上一次请求的参数，避免重复请求
  const lastRequestRef = useRef({
    offset: initialData?.emojis ? initialData.emojis.length : 0,
    sortBy: "latest",
  });
  
  // 每页数量
  const limit = 24;
  
  // ===== 数据查询参数构建 =====
  const buildQueryParams = useCallback(() => {
    const options: {
      color?: string;
      sort?: 'latest' | 'popular' | 'quality';
    } = {
      color: slug
    };
    
    // 映射排序选项
    switch (sortBy) {
      case "popular":
        options.sort = "popular";
        break;
      case "quality":
        options.sort = "quality";
        break;
      default:
        options.sort = "latest"; 
    }
    
    return options;
  }, [slug, sortBy]);
  
  // ===== 获取分组数据 =====
  useEffect(() => {
    if (initialData?.groups && colors.length > 0) return;
    
    async function fetchGroups() {
      try {
        const groups = await getEmojiGroups(locale);
        const formattedColors = groups.colors.map(color => ({
          id: color.name,
          name: color.name,
          slug: color.name,
          translated_name: color.translated_name
        }));
        setColors(formattedColors);
      } catch (error) {
        console.error('Failed to fetch emoji groups:', error);
      }
    }
    
    fetchGroups();
  }, [locale, initialData, colors.length]);
  
  // ===== 初始数据加载 =====
  useEffect(() => {
    // 只有在初始加载或筛选条件变化时才执行
    if (offset === 0) {
      // 使用初始数据(如果合适)
      if (initialData?.emojis && sortBy === "latest") {
        return; // 已经在状态初始化时设置了初始数据
      }
      
      const fetchInitialEmojis = async () => {
        try {
          setIsLoading(true);
          const options = buildQueryParams();
          const fetchedEmojis = await getEmojis(0, limit, locale, options);
          setEmojis(fetchedEmojis);
          setHasMore(fetchedEmojis.length === limit);
          
          // 更新最后一次请求的参数
          lastRequestRef.current = {
            offset: fetchedEmojis.length,
            sortBy
          };
        } catch (error) {
          console.error('Failed to fetch emojis:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchInitialEmojis();
    }
  }, [sortBy, locale, offset, initialData, buildQueryParams, limit]);
  
  // ===== 加载更多数据 =====
  const loadMoreEmojis = useCallback(async () => {
    // 防止重复请求
    if (isLoadingMore || !hasMore || 
        (lastRequestRef.current.offset === offset && 
         lastRequestRef.current.sortBy === sortBy)) {
      return;
    }
    
    try {
      setIsLoadingMore(true);
      const options = buildQueryParams();
      const fetchedEmojis = await getEmojis(offset, limit, locale, options);
      
      if (fetchedEmojis.length > 0) {
        setEmojis(prev => [...prev, ...fetchedEmojis]);
      }
      
      setHasMore(fetchedEmojis.length === limit);
      
      // 更新最后一次请求的参数
      lastRequestRef.current = {
        offset: offset + fetchedEmojis.length,
        sortBy
      };
    } catch (error) {
      console.error('Failed to load more emojis:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [offset, sortBy, locale, hasMore, isLoadingMore, buildQueryParams, limit]);
  
  // ===== 处理加载更多 =====
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setOffset(prev => prev + limit);
      loadMoreEmojis();
    }
  }, [isLoadingMore, hasMore, limit, loadMoreEmojis]);
  
  // ===== 处理排序变化 =====
  const handleSortChange = useCallback((value: string) => {
    if (value !== sortBy) {
      setSortBy(value);
      setEmojis([]);
      setOffset(0);
      setHasMore(true);
    }
  }, [sortBy]);
  
  return (
    <div className="min-h-screen">
      {/* 面包屑导航 */}
      <Breadcrumb items={breadcrumbItems} />
      
      {/* 头部区域 */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20" 
          style={{
            backgroundColor: `rgba(${getColorRGB(slug)}, 0.05)`,
            backgroundImage: `linear-gradient(to right, rgba(${getColorRGB(slug)}, 0.05), rgba(${getColorRGB(slug)}, 0.1))`
          }}
        />
        
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* 颜色名称 */}
            <h1 className="text-4xl font-bold mb-4 capitalize">
              {colorName} Emojis
            </h1>
            
            {/* 颜色示例 */}
            <motion.div 
              className="w-16 h-16 rounded-full mx-auto mb-6"
              style={{ backgroundColor: getColorHex(slug) }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            />
            
            {/* 颜色描述 */}
            <p className="text-muted-foreground leading-relaxed">
              Browse our collection of {colorName} emojis. These emojis feature {colorName} as their primary color, perfect for matching your theme or mood.
            </p>
          </motion.div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="container mx-auto px-4 py-4">
        <FilterBar 
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>

      {/* 表情网格 */}
      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <EmojiGrid 
              emojis={emojis} 
              onLoadMore={handleLoadMore}
              isLoading={isLoadingMore}
              hasMore={hasMore}
            />
            
            {!hasMore && emojis.length > 0 && (
              <div className="text-center text-gray-500 mt-8">
                No more emojis
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 相关颜色 */}
      {colors.length > 0 && (
        <RelatedCategories 
          group="color"
          categories={colors}
          currentCategory={slug}
        />
      )}
    </div>
  );
}

// 辅助函数：将颜色名称转换为RGB值
function getColorRGB(slug: string): string {
  const colorMap: Record<string, string> = {
    red: '255, 0, 0',
    blue: '0, 0, 255',
    green: '0, 128, 0',
    yellow: '255, 255, 0',
    orange: '255, 165, 0',
    purple: '128, 0, 128',
    pink: '255, 192, 203',
    brown: '165, 42, 42',
    black: '0, 0, 0',
    white: '255, 255, 255',
    gray: '128, 128, 128',
    gold: '255, 215, 0',
    silver: '192, 192, 192',
    // 添加更多颜色映射
  };
  
  return colorMap[slug.toLowerCase()] || '128, 128, 128'; // 默认为灰色
}

// 辅助函数：将颜色名称转换为十六进制值
function getColorHex(slug: string): string {
  const colorMap: Record<string, string> = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    brown: '#A52A2A',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    gold: '#FFD700',
    silver: '#C0C0C0',
    // 添加更多颜色映射
  };
  
  return colorMap[slug.toLowerCase()] || '#808080'; // 默认为灰色
} 