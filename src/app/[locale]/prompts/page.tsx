import { Metadata } from 'next';
import { siteConfig } from "@/lib/config";
import { getLocale, setRequestLocale } from 'next-intl/server';
import { UnifiedGenmojiGenerator } from '@/components/unified-genmoji-generator';
import { CTA } from '@/components/sections/cta';
import { TrendingPrompts } from '@/components/prompts/trending-prompts';
import { CategoryPromptTabs } from '@/components/prompts/category-prompt-tabs';
import { KeywordCloud } from '@/components/prompts/keyword-cloud';
import { FAQ } from '@/components/sections/faq';

export const runtime = 'edge';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  
  const title = `Genmoji Prompts Generator — 500+ AI Emoji Prompt Ideas | ${siteConfig.name}`;
  const description = `Discover trending genmoji prompts and creative ideas. Browse by category, style, or keyword. Free AI emoji generator with 500+ prompt ideas.`;
  
  return {
    title,
    description,
    keywords: ['genmoji prompts', 'emoji ideas', 'ai emoji generator', 'prompt generator', 'genmoji ideas', 'emoji prompt ideas'],
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
          alt: 'Genmoji Prompts Generator'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: locale === 'en' ? `${siteConfig.url}/prompts` : `${siteConfig.url}/${locale}/prompts`,
      languages: {
        'x-default': `${siteConfig.url}/prompts`,
        'en': `${siteConfig.url}/prompts`,
        'en-US': `${siteConfig.url}/prompts`,
        'ja': `${siteConfig.url}/ja/prompts`,
        'ja-JP': `${siteConfig.url}/ja/prompts`,
        'fr': `${siteConfig.url}/fr/prompts`,
        'fr-FR': `${siteConfig.url}/fr/prompts`,
        'zh': `${siteConfig.url}/zh/prompts`,
        'zh-CN': `${siteConfig.url}/zh/prompts`,
      },
    },
  };
}

export default async function PromptsPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <main className="items-center container mx-auto p-2">
      {/* Hero Section */}
      <section className="py-10 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Genmoji Prompts Generator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover 500+ creative prompt ideas to inspire your next Genmoji creation
        </p>
      </section>
      
      {/* Generator */}
      <section className="py-8 max-w-3xl mx-auto">
        <UnifiedGenmojiGenerator initialPrompt="" init_model="genmoji" />
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
        <TrendingPrompts locale={locale} />
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
        <KeywordCloud locale={locale} />
      </section>
      
      {/* Prompts by Category */}
      <section className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-2">
            <span>💡</span> Prompt Ideas by Category
          </h2>
          <p className="text-muted-foreground">
            Browse prompts organized by emoji category
          </p>
        </div>
        <CategoryPromptTabs locale={locale} />
      </section>

      {/* FAQ */}
      <FAQ />
      
      {/* CTA Section */}
      <CTA />
    </main>
  );
}
