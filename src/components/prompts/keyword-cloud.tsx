'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Keyword {
  keyword: string;
  count: number;
}

interface KeywordCloudProps {
  locale: string;
}

export function KeywordCloud({ locale }: KeywordCloudProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKeywords() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emoji/prompts/keywords?locale=${locale}&limit=40`);
        const data = await res.json();
        if (data.success) {
          setKeywords(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch keywords:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchKeywords();
  }, [locale]);

  const handleKeywordClick = (keyword: string) => {
    // Scroll to generator and set prompt
    const generator = document.querySelector('textarea');
    if (generator) {
      generator.value = keyword;
      generator.dispatchEvent(new Event('input', { bubbles: true }));
      generator.scrollIntoView({ behavior: 'smooth', block: 'center' });
      generator.focus();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>
    );
  }

  if (keywords.length === 0) {
    return null;
  }

  // Calculate font size based on count
  const maxCount = Math.max(...keywords.map(k => k.count));
  const minCount = Math.min(...keywords.map(k => k.count));

  const getSize = (count: number): 'default' | 'sm' | 'lg' => {
    const ratio = (count - minCount) / (maxCount - minCount || 1);
    if (ratio > 0.66) return 'lg';
    if (ratio > 0.33) return 'default';
    return 'sm';
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
      {keywords.map((item) => (
        <Badge
          key={item.keyword}
          variant="secondary"
          className={`cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors ${
            getSize(item.count) === 'lg' ? 'text-base px-4 py-2' :
            getSize(item.count) === 'default' ? 'text-sm px-3 py-1.5' :
            'text-xs px-2 py-1'
          }`}
          onClick={() => handleKeywordClick(item.keyword)}
        >
          {item.keyword}
        </Badge>
      ))}
    </div>
  );
}
