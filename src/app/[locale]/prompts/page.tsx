import { Metadata } from 'next';
import { siteConfig } from "@/lib/config";
import { setRequestLocale } from 'next-intl/server';
import { CTA } from '@/components/sections/cta';
import { TrendingPrompts } from '@/components/prompts/trending-prompts';
import { CategoryNav } from '@/components/prompts/category-nav';
import { KeywordCloud } from '@/components/prompts/keyword-cloud';
import { FAQ } from '@/components/sections/faq';
import { API_BASE_URL } from '@/lib/api-config';
import { buildAlternates } from '@/lib/seo';

export const runtime = 'edge';

type Props = {
  params: Promise<{ locale: string }>;
};

// Server-side data fetching for SSR
async function getPromptsData() {
  const PREFETCH = process.env.NEXT_PUBLIC_PREFETCH_HOME_RECENT !== '0';
  if (!PREFETCH) return { keywords: [], trending: [] };
  
  try {
    const [keywordsRes, trendingRes] = await Promise.all([
      fetch(`${API_BASE_URL}/genmoji/prompts/keywords?limit=40`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE_URL}/genmoji/prompts/trending?limit=12`, { next: { revalidate: 3600 } }),
    ]);
    
    const [keywordsData, trendingData] = await Promise.all([
      keywordsRes.json(),
      trendingRes.json(),
    ]);
    
    return {
      keywords: keywordsData.success ? keywordsData.data : [],
      trending: trendingData.success ? trendingData.data : [],
    };
  } catch (e) {
    console.error('Failed to prefetch prompts data:', e);
    return { keywords: [], trending: [] };
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  
  const title = `Popular Genmoji Prompts — Discover Trending AI Emoji Ideas | ${siteConfig.name}`;
  const description = `Explore popular genmoji prompts and trending emoji ideas. Click any prompt to see the generated emoji. Browse by category, style, or keyword.`;
  
  return {
    title,
    description,
    keywords: ['genmoji prompts', 'emoji ideas', 'popular emoji', 'trending emoji', 'genmoji gallery', 'emoji prompt ideas'],
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title,
      description,
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Popular Genmoji Prompts'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: buildAlternates('/prompts', locale),
  };
}

export default async function PromptsPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  
  // Fetch data on server for SSR
  const { keywords, trending } = await getPromptsData();

  return (
    <main className="items-center container mx-auto p-2">
      {/* Hero Section */}
      <section className="py-10 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Popular Genmoji Prompts
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore trending prompts and click any to see the generated emoji
        </p>
      </section>
      
      {/* Trending Prompts */}
      <section className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
            <span>🔥</span> Trending Prompts
          </h2>
          <p className="text-muted-foreground">
            Most popular prompts in the last 24 hours
          </p>
        </div>
        <TrendingPrompts locale={locale} initialPrompts={trending.length ? trending : undefined} />
      </section>
      
      {/* Popular Keywords */}
      <section className="py-12 bg-muted/30 rounded-xl px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
            <span>🏷️</span> Popular Keywords
          </h2>
          <p className="text-muted-foreground">
            Click any keyword to use it as a prompt
          </p>
        </div>
        <KeywordCloud locale={locale} initialKeywords={keywords.length ? keywords : undefined} />
      </section>
      
      {/* Prompts by Category */}
      <section className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
            <span>💡</span> Browse by Category
          </h2>
          <p className="text-muted-foreground">
            Explore prompts organized by emoji category
          </p>
        </div>
        <div className="mb-8">
            <CategoryNav />
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
      
      {/* CTA Section */}
      <CTA />
    </main>
  );
}
