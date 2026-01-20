import { Metadata } from 'next';
import { getEmojis } from '@/lib/api';
import { Emoji } from '@/types/emoji';
import { siteConfig } from '@/lib/config';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CategoryNav } from '@/components/prompts/category-nav';
import { CATEGORY_LABELS } from '@/lib/categories';
import EmojiContainer from '@/components/emoji-container';
import { CTA } from '@/components/sections/cta';
import { Link } from '@/i18n/routing';

export const runtime = 'edge';

type Props = {
  params: Promise<{
    locale: string;
    category: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { category, locale } = await props.params;

  // Validate category
  if (!CATEGORY_LABELS[category] && category !== 'all') {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryName = CATEGORY_LABELS[category]?.label || 'Genmoji';
  const title = `${categoryName} Genmoji Prompts - Best AI Emoji Ideas | Genmoji Online`;
  const description = `Explore the best ${categoryName.toLowerCase()} genmoji prompts. Copy prompts or generate your own custom ${categoryName.toLowerCase()} emojis with AI.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteConfig.url}/prompts/${category}`,
    },
    alternates: {
      canonical: locale === 'en' ? `${siteConfig.url}/prompts/${category}` : `${siteConfig.url}/${locale}/prompts/${category}`,
    }
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
      sort: 'latest'
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

      <div className="grid w-full auto-rows-max grid-cols-2 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {emojis.map((emoji) => (
          <div key={emoji.slug} className="group relative flex flex-col overflow-hidden rounded-none border bg-card transition-shadow hover:shadow-md">
            <div className="aspect-square w-full">
              <EmojiContainer
                emoji={emoji}
                size="sm"
                withBorder={false}
                padding="p-0"
                priority={false}
              />
            </div>
             <Link 
                href={`/emoji/${emoji.slug}`}
                className="flex flex-1 px-3 py-3 text-xs text-muted-foreground hover:text-primary transition-colors text-left"
             >
                {emoji.prompt}
             </Link>
          </div>
        ))}
      </div>

      {emojis.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-xl">
          <p className="text-xl text-muted-foreground">No prompts found in this category yet.</p>
          <p className="mt-2">Be the first to create one!</p>
        </div>
      )}
      
      <div className="mt-20">
        <CTA />
      </div>
    </main>
  );
}
