'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { API_BASE_URL } from '@/lib/api-config';

interface TrendingPrompt {
  prompt: string;
  slug: string;
  image_url: string;
  action_count: number;
  model?: string;
}

interface TrendingPromptsProps {
  locale: string;
}

export function TrendingPrompts({ locale }: TrendingPromptsProps) {
  const [prompts, setPrompts] = useState<TrendingPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch(`${API_BASE_URL}/genmoji/prompts/trending?limit=12`);
        const data = await res.json();
        if (data.success) {
          setPrompts(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch trending prompts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-20 h-20 rounded-xl" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trending prompts found. Be the first to create one!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {prompts.map((item) => (
        <Link
          key={item.slug}
          href={`/${locale}/emoji/${item.slug}`}
          className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="relative w-20 h-20">
            <Image
              src={item.image_url}
              alt={item.prompt}
              fill
              className="object-contain group-hover:scale-110 transition-transform"
              sizes="80px"
            />
          </div>
          <p className="text-sm text-center line-clamp-2 text-muted-foreground group-hover:text-foreground">
            {item.prompt}
          </p>
          <span className="text-xs text-muted-foreground/60">
            {item.action_count} uses
          </span>
        </Link>
      ))}
    </div>
  );
}
