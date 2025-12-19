'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface PromptItem {
  prompt: string;
  slug: string;
  image_url: string;
  usage_count: number;
}

interface CategoryPrompts {
  category: string;
  prompts: PromptItem[];
}

interface CategoryPromptTabsProps {
  locale: string;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  smileys_emotion: { label: 'Smileys', emoji: '😊' },
  people_body: { label: 'People', emoji: '👤' },
  animals_nature: { label: 'Animals', emoji: '🐱' },
  food_drink: { label: 'Food', emoji: '🍕' },
  travel_places: { label: 'Travel', emoji: '✈️' },
  activities: { label: 'Activities', emoji: '⚽' },
  objects: { label: 'Objects', emoji: '💡' },
  symbols: { label: 'Symbols', emoji: '❤️' },
  flags: { label: 'Flags', emoji: '🏳️' },
  other: { label: 'Other', emoji: '🎨' },
};

export function CategoryPromptTabs({ locale }: CategoryPromptTabsProps) {
  const [categories, setCategories] = useState<CategoryPrompts[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emoji/prompts/by-category?locale=${locale}&limit=8`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setActiveTab(data.data[0].category);
        }
      } catch (error) {
        console.error('Failed to fetch category prompts:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [locale]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-16 h-16 rounded-xl" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No category data available yet.
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-6">
        {categories.map((cat) => {
          const info = CATEGORY_LABELS[cat.category] || { label: cat.category, emoji: '📦' };
          return (
            <TabsTrigger
              key={cat.category}
              value={cat.category}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 rounded-lg"
            >
              <span className="mr-1">{info.emoji}</span>
              {info.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {categories.map((cat) => (
        <TabsContent key={cat.category} value={cat.category} className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cat.prompts.map((item) => (
              <Link
                key={item.slug}
                href={`/${locale}/emoji/${item.slug}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors border border-border/50"
              >
                <div className="relative w-16 h-16">
                  <Image
                    src={item.image_url}
                    alt={item.prompt}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform"
                    sizes="64px"
                  />
                </div>
                <p className="text-sm text-center line-clamp-2 font-medium">
                  {item.prompt}
                </p>
              </Link>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
