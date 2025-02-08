"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastSearchRef = useRef(value);
  
  // 检测是否为移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端使用较长的防抖时间，PC端不使用防抖
  const debouncedSearch = useDebounce((query: string) => {
    if (query !== lastSearchRef.current) {
      onSearch(query);
      lastSearchRef.current = query;
    }
  }, isMobile ? 1000 : 0);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    // 移动端且不在输入法编辑状态时，使用防抖搜索
    if (isMobile && !isComposing) {
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
      debouncedSearch(newValue);
    }
  }, [debouncedSearch, isMobile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // PC端回车触发搜索
    if (e.key === 'Enter' && !isComposing && !isMobile) {
      e.preventDefault();
      if (value !== lastSearchRef.current) {
        onSearch(value);
        lastSearchRef.current = value;
      }
    }
  }, [value, isComposing, isMobile, onSearch]);

  // 在组件卸载时清除最后搜索的值
  useEffect(() => {
    return () => {
      lastSearchRef.current = '';
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
        className="pl-9 h-10"
        placeholder={isMobile ? "Type to search..." : "Press Enter to search..."}
        disabled={loading}
      />
    </div>
  );
} 