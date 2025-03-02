"use client";

import { getEmojis } from '@/lib/api';
import { EmojiGrid } from '@/components/emoji-grid';
import { CategoryHeader } from '@/components/category-header';
import { RelatedCategories } from '@/components/related-categories';
import { FilterBar } from '@/components/filter-bar';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Emoji, Category } from '@/types/emoji';
import { usePathname } from 'next/navigation';
import { Breadcrumb, generateBreadcrumb } from '@/components/breadcrumb';
import { useEmojiGroups } from '@/store/emoji-groups-provider';

interface CategoryPageClientProps {
  params: {
    slug: string;
    locale: string;
  };
  initialData?: {
    emojis: Emoji[];
    categoryName: string;
  };
}

export default function CategoryPageClient({ params, initialData }: CategoryPageClientProps) {
  const { slug, locale } = params;
  const { categories } = useEmojiGroups();
  const pathname = usePathname();
  const breadcrumbItems = generateBreadcrumb(pathname, slug);
  
  // 从初始数据或上下文中获取分类名称
  const categoryName = initialData?.categoryName || 
    categories.find(category => category.name === slug)?.translated_name || 
    decodeURIComponent(slug);
  
  // ===== 状态管理 =====
  const [emojis, setEmojis] = useState<Emoji[]>(initialData?.emojis || []);
  const [isLoading, setIsLoading] = useState(!initialData?.emojis);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
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
      category?: string;
      sort?: 'latest' | 'popular' | 'quality';
    } = {
      category: decodeURIComponent(slug)
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
      <CategoryHeader 
        category={categoryName} 
      />
      
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
      
      {/* 相关分类 */}
      {categories.length > 0 && (
        <RelatedCategories 
          group="category"
          categories={categories.map(category => ({
            id: category.name,
            name: category.name,
            slug: category.name,
            translated_name: category.translated_name
          }))} 
          currentCategory={slug}
        />
      )}
    </div>
  );
} 