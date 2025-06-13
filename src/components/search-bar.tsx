"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useState, useEffect, useRef, memo } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useTranslations } from 'next-intl';

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export const SearchBar = memo(({ onSearch, loading }: SearchBarProps) => {
  const t = useTranslations('gallery.search');
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastSearchRef = useRef(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      }
    };
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // 优化的搜索处理函数
  const performSearch = useCallback((query: string) => {
    if (query !== lastSearchRef.current) {
      onSearch(query);
      lastSearchRef.current = query;
    }
    // 无论是否执行搜索，都保持焦点
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [onSearch]);

  // 移动端使用较长的防抖时间，PC端不使用防抖
  const debouncedSearch = useDebounce(performSearch, isMobile ? 1000 : 0);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // 移动端且不在输入法编辑状态时，使用防抖搜索
    if (isMobile && !isComposing) {
      // 清除之前的定时器
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch(newValue);
    }
  }, [debouncedSearch, isComposing, isMobile]);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setIsComposing(false);
    
    // 输入法编辑结束时，移动端使用防抖，PC端等待回车
    if (isMobile) {
      // 清除之前的定时器
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch(newValue);
    }
  }, [debouncedSearch, isMobile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // PC端回车触发搜索
    if (e.key === 'Enter' && !isComposing && !isMobile) {
      e.preventDefault();
      performSearch(value);
      // 确保在下一帧保持焦点
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [value, isComposing, isMobile, performSearch]);

  // 在组件卸载时清除状态
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      lastSearchRef.current = '';
    };
  }, []);

  // 自动聚焦
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // 当失去焦点时，在下一帧重新获取焦点
          requestAnimationFrame(() => {
            inputRef.current?.focus();
          });
        }}
        className="pl-9 h-10"
        placeholder={t(`placeholder.${isMobile ? 'mobile' : 'desktop'}`)}
        disabled={loading}
        aria-label={t('label')}
      />
    </div>
  );
}); 