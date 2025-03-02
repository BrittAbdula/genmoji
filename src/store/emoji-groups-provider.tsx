"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getEmojiGroups } from '@/lib/api';
import { Category } from '@/types/emoji';

// 定义数据结构
interface EmojiGroups {
  models: Category[];
  categories: Category[];
  colors: Category[];
  isLoading: boolean;
  error: Error | null;
}

// 创建默认值
const defaultState: EmojiGroups = {
  models: [],
  categories: [],
  colors: [],
  isLoading: true,
  error: null,
};

// 创建上下文
const EmojiGroupsContext = createContext<EmojiGroups>(defaultState);

// Provider 组件
export function EmojiGroupsProvider({ 
  children,
  locale 
}: { 
  children: React.ReactNode;
  locale: string;
}) {
  const [state, setState] = useState<EmojiGroups>(defaultState);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchEmojiGroups() {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const groups = await getEmojiGroups(locale);
        
        // 格式化模型数据
        const formattedModels = groups.models.map(model => ({
          id: model.name,
          name: model.name,
          translated_name: model.translated_name,
          slug: model.name,
          count: model.count || 0
        }));
        
        // 格式化分类数据
        const formattedCategories = groups.categories.map(category => ({
          id: category.name,
          name: category.name,
          translated_name: category.translated_name,
          slug: category.name,
          count: category.count || 0
        }));
        
        // 格式化颜色数据
        const formattedColors = groups.colors.map(color => ({
          id: color.name,
          name: color.name,
          translated_name: color.translated_name,
          slug: color.name,
          count: color.count || 0
        }));
        
        if (isMounted) {
          setState({
            models: formattedModels,
            categories: formattedCategories,
            colors: formattedColors,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Failed to fetch emoji groups:', error);
        if (isMounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error instanceof Error ? error : new Error('Failed to fetch emoji groups') 
          }));
        }
      }
    }
    
    fetchEmojiGroups();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, [locale]);
  
  return (
    <EmojiGroupsContext.Provider value={state}>
      {children}
    </EmojiGroupsContext.Provider>
  );
}

// 自定义钩子，用于访问上下文
export function useEmojiGroups() {
  const context = useContext(EmojiGroupsContext);
  if (context === undefined) {
    throw new Error('useEmojiGroups must be used within an EmojiGroupsProvider');
  }
  return context;
} 