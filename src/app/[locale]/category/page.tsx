import { Metadata } from 'next';
import { getEmojiGroups } from '@/lib/api';
import { siteConfig } from '@/lib/config';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export const runtime = 'edge';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: `Genmoji Categories Collection | ${siteConfig.name}`,
    description: 'Browse our collection of genmoji categories. Find genmojis organized by theme and subject to express yourself perfectly.',
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title: 'Genmoji Categories Collection',
      description: 'Browse our collection of genmoji categories. Find genmojis organized by theme and subject to express yourself perfectly.',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Genmoji Categories Collection'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Genmoji Categories Collection | ${siteConfig.name}`,
      description: 'Browse our collection of genmoji categories. Find genmojis organized by theme and subject to express yourself perfectly.',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: locale === 'en' ? `${siteConfig.url}/category` : `${siteConfig.url}/${locale}/category`,
      languages: {
        'x-default': `${siteConfig.url}/category`,
        'en': `${siteConfig.url}/category`,
        'en-US': `${siteConfig.url}/category`,
        'ja': `${siteConfig.url}/ja/category`,
        'ja-JP': `${siteConfig.url}/ja/category`,
        'fr': `${siteConfig.url}/fr/category`,
        'fr-FR': `${siteConfig.url}/fr/category`,
        'zh': `${siteConfig.url}/zh/category`,
        'zh-CN': `${siteConfig.url}/zh/category`,
      },
    },
  };
}

// Function to get a representative genmoji for a category
function getCategoryEmoji(categoryName: string): string {
  const categoryEmojis: Record<string, string> = {
    'smileys_emotion': '😊',
    'people_body': '👨‍👩‍👧‍👦',
    'animals_nature': '🐼',
    'food_drink': '🍔',
    'travel_places': '✈️',
    'activities': '🎮',
    'objects': '📱',
    'symbols': '🔣',
    'flags': '🇨🇳',
    'other': '📁'
  };
  return categoryEmojis[categoryName.toLowerCase()] || '📁';
}

export default async function CategoryIndex() {
  const locale = await getLocale();
  const groups = await getEmojiGroups(locale);
  
  const categories = groups.categories.map(category => ({
    id: category.name,
    name: category.name,
    slug: category.name,
    translated_name: category.translated_name,
    count: category.count
  }));
  
  return (
    <div className="min-h-screen">
      {/* Simple server-rendered breadcrumb navigation */}
      <nav className="py-4 container mx-auto px-4">
        <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
          <li>
            <Link 
              href={`/${locale}`}
              className="flex items-center hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              <span className="sr-only sm:not-sr-only">Home</span>
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-foreground">Categories</span>
          </li>
        </ol>
      </nav>
      
      {/* Header section */}
      <div className="relative overflow-hidden bg-muted/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Genmoji Categories</h1>
            <p className="text-muted-foreground leading-relaxed">
              Browse our collection of genmoji categories. Each category contains genmojis organized by theme or subject.
              Select a category to explore all genmojis in that particular group.
            </p>
          </div>
        </div>
      </div>
      
      {/* Category card grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <div
              key={category.slug}
              className="bg-background rounded-xl overflow-hidden border border-muted/20 transition-all hover:shadow-lg"
            >
              <Link href={`/${locale}/category/${category.slug}`} className="block">
                <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                  <span className="text-8xl">{getCategoryEmoji(category.slug)}</span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 capitalize">{category.translated_name}</h2>
                  <p className="text-muted-foreground text-sm">
                    {category.count 
                      ? `${category.count} genmojis available`
                      : 'Explore this category'}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 