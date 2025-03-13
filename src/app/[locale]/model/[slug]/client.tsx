"use client";

import { getEmojis } from '@/lib/api';
import { CategoryHeader } from '@/components/category-header';
import { RelatedCategories } from '@/components/related-categories';
import { FilterBar } from '@/components/filter-bar';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Emoji } from '@/types/emoji';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { usePathname } from 'next/navigation';
import { Breadcrumb, generateBreadcrumb } from '@/components/breadcrumb';
import { EmojiGrid } from '@/components/emoji-grid';
import { useEmojiGroups } from '@/store/emoji-groups-provider';

interface ModelPageClientProps {
  params: {
    slug: string;
    locale: string;
  };
  initialData?: {
    emojis: Emoji[];
    modelName: string;
  };
}

export default function ModelPageClient({ params, initialData }: ModelPageClientProps) {
  const { slug, locale } = params;
  const { models } = useEmojiGroups();
  const modelName = initialData?.modelName || models.find(model => model.name === slug)?.translated_name || 'Unknown Model';
  const pathname = usePathname();
  const breadcrumbItems = generateBreadcrumb(pathname, slug);
  
  // ===== 状态管理 =====
  const [emojis, setEmojis] = useState<Emoji[]>(initialData?.emojis || []);
  const [isLoading, setIsLoading] = useState(!initialData?.emojis);
  const [hasError, setHasError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // 筛选与分页状态
  const [offset, setOffset] = useState(initialData?.emojis ? initialData.emojis.length : 0);
  const [sortBy, setSortBy] = useState("latest");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  // 添加一个状态标记来防止重复加载
  const [isInitialized, setIsInitialized] = useState(!!initialData?.emojis);
  
  // 跟踪上一次请求的参数，避免重复请求
  const [lastFetchParams, setLastFetchParams] = useState({
    offset: initialData?.emojis ? initialData.emojis.length : 0,
    sortBy: "latest",
    color: null as string | null
  });
  
  // 每页数量
  const limit = 24;
  
  // ===== 自动加载更多 =====
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
    triggerOnce: false
  });
  
  // ===== 数据查询参数构建 =====
  const buildQueryParams = useCallback(() => {
    const options: {
      model?: string;
      color?: string;
      sort?: 'latest' | 'popular' | 'quality';
    } = {
      model: slug
    };
    
    if (selectedColor) {
      options.color = selectedColor;
    }
    
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
  }, [slug, selectedColor, sortBy]);
  
  // ===== 数据加载函数 =====
  const fetchEmojis = useCallback(async (currentOffset: number, resetResults: boolean = false) => {
    // 检查是否需要进行请求，避免重复请求
    const currentParams = {
      offset: currentOffset,
      sortBy,
      color: selectedColor
    };
    
    // 如果参数相同且正在加载，则跳过
    if (isLoading) return;
    
    // 避免重复请求相同参数
    if (
      !resetResults && 
      currentParams.offset === lastFetchParams.offset && 
      currentParams.sortBy === lastFetchParams.sortBy && 
      currentParams.color === lastFetchParams.color
    ) {
      return;
    }
    
    try {
      setIsLoading(true);
      setHasError(false);
      
      const options = buildQueryParams();
      const fetchedEmojis = await getEmojis(currentOffset, limit, locale, options);
      
      setHasMore(fetchedEmojis.length === limit);
      
      setEmojis(prev => resetResults ? fetchedEmojis : [...prev, ...fetchedEmojis]);
      setOffset(currentOffset + fetchedEmojis.length);
      
      // 更新最后一次请求的参数
      setLastFetchParams(currentParams);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to fetch emojis:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [locale, limit, buildQueryParams, selectedColor, sortBy, isLoading, lastFetchParams]);
  
  // ===== 筛选条件变化处理 =====
  useEffect(() => {
    // 确保不是首次加载时执行
    if (!isInitialized) {
      return;
    }
    
    // 避免无意义的重新筛选
    if (
      sortBy === lastFetchParams.sortBy && 
      selectedColor === lastFetchParams.color
    ) {
      return;
    }
    
    // 重置状态并获取新数据
    setOffset(0);
    fetchEmojis(0, true);
  }, [selectedColor, sortBy, fetchEmojis, isInitialized, lastFetchParams]);
  
  // ===== 初始化数据加载 =====
  useEffect(() => {
    // 只有在没有初始数据时才加载
    if (!isInitialized && !isLoading) {
      fetchEmojis(0, true);
    }
  }, [isInitialized, fetchEmojis, isLoading]);
  
  // ===== 加载更多处理 =====
  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && isInitialized) {
      fetchEmojis(offset, false);
    }
  }, [isLoading, hasMore, isInitialized, offset, fetchEmojis]);
  
  // ===== 处理用户交互 =====
  const handleSortChange = (value: string) => {
    if (value === sortBy) return;
    setSortBy(value);
  };
  
  const handleColorChange = (value: string | null) => {
    if (value === selectedColor) return;
    setSelectedColor(value);
  };
  
  const handleRetry = () => {
    setHasError(false);
    fetchEmojis(offset, offset === 0);
  };
  
  // ===== UI 状态渲染 =====
  const renderLoadingState = () => (
    <div className="flex justify-center py-8 w-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
  
  const renderErrorState = () => (
    <div className="text-center py-12">
      <p className="text-red-500 mb-4">Failed to load emojis</p>
      <button 
        onClick={handleRetry}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
  
  // ===== 动画配置 =====
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="min-h-screen">
      {/* 面包屑导航 */}
      <Breadcrumb items={breadcrumbItems} />
      
      {/* 头部区域 */}
      <CategoryHeader 
        category={modelName} 
        description={`Browse our collection of ${modelName} style genmojis. These genmojis are created using the ${modelName} model, perfect for your messages and social media.`}
      />
      
      {/* 筛选栏 */}
      <div className="container mx-auto p-4">
        <FilterBar 
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />
      </div>
      
      {/* 表情网格 */}
      <div className="container mx-auto px-4">
        {hasError ? (
          renderErrorState()
        ) : emojis.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No emojis found</p>
          </div>
        ) : (
          <EmojiGrid 
            emojis={emojis} 
            onLoadMore={handleLoadMore}
            isLoading={isLoading}
            hasMore={hasMore}
          />
        )}
      </div>
      
      {/* 相关模型 */}
      {models.length > 0 && (
        <RelatedCategories 
          group="model"
          categories={models.map(model => ({
            id: model.name,
            name: model.name,
            slug: model.name,
            translated_name: model.translated_name,
            count: model.count
          }))} 
          currentCategory={slug}
        />
      )}
    </div>
  );
} 