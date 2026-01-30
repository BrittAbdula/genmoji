import { Metadata } from 'next';
import { getEmojis } from '@/lib/api';
import { Emoji } from '@/types/emoji';
import { siteConfig } from '@/lib/config';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CategoryNav } from '@/components/prompts/category-nav';
import { CATEGORY_LABELS } from '@/lib/categories';
import { CTA } from '@/components/sections/cta';
import { buildAlternates } from '@/lib/seo';
import PromptsCategoryClient from './client';

export const runtime = 'edge';

type Props = {
  params: Promise<{
    locale: string;
    category: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { category, locale } = await props.params;
  const isAllCategory = category === 'all';

  // Validate category
  if (!CATEGORY_LABELS[category] && category !== 'all') {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryName = CATEGORY_LABELS[category]?.label || 'Genmoji';
  const title = `${categoryName} Genmoji Prompts - Best AI Emoji Ideas | Genmoji Online`;
  const description = `Explore the best ${categoryName.toLowerCase()} genmoji prompts. Copy prompts or generate your own custom ${categoryName.toLowerCase()} emojis with AI.`;

  const alternates = buildAlternates(isAllCategory ? '/prompts' : `/prompts/${category}`, locale);
  const ogUrl = alternates.canonical;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: ogUrl,
    },
    alternates,
    ...(isAllCategory ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CategoryPage(props: Props) {
  const { category, locale } = await props.params;

  // Validate category
  if (!CATEGORY_LABELS[category]) {
    notFound();
  }

  const categoryInfo = CATEGORY_LABELS[category];
  const categoryName = categoryInfo.label;

  // Fetch emojis for this category
  let emojis: Emoji[] = [];
  try {
    emojis = await getEmojis(0, 48, locale, { 
      category: category === 'all' ? undefined : category,
      sort: 'quality',
      isIndexable: true,
    });
  } catch (error) {
    console.error(`Failed to fetch emojis for category ${category}:`, error);
    // Fallback to empty array to avoid 500 error
    emojis = [];
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          {categoryInfo.emoji} {categoryName} Genmoji Prompts
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover trending {categoryName.toLowerCase()} prompts and create your own
        </p>
      </div>

      <div className="mb-12">
        <CategoryNav activeCategory={category} />
      </div>

      <PromptsCategoryClient initialEmojis={emojis} category={category} locale={locale} />
      
      <div className="mt-20">
        <CTA />
      </div>
    </main>
  );
}
