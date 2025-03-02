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
    title: `Emoji Models Collection | ${siteConfig.name}`,
    description: 'Browse our collection of emoji models. Choose from various styles to find the perfect emoji for your messages and social media.',
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title: 'Emoji Models Collection',
      description: 'Browse our collection of emoji models. Choose from various styles to find the perfect emoji for your messages and social media.',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Emoji Models Collection'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Emoji Models Collection | ${siteConfig.name}`,
      description: 'Browse our collection of emoji models. Choose from various styles to find the perfect emoji for your messages and social media.',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: locale === 'en' ? `${siteConfig.url}/model` : `${siteConfig.url}/${locale}/model`,
      languages: {
        'x-default': `${siteConfig.url}/model`,
        'en': `${siteConfig.url}/model`,
        'en-US': `${siteConfig.url}/model`,
        'ja': `${siteConfig.url}/ja/model`,
        'ja-JP': `${siteConfig.url}/ja/model`,
        'fr': `${siteConfig.url}/fr/model`,
        'fr-FR': `${siteConfig.url}/fr/model`,
        'zh': `${siteConfig.url}/zh/model`,
        'zh-CN': `${siteConfig.url}/zh/model`,
      },
    },
  };
}

// Function to get a representative emoji for a model
function getModelEmoji(modelName: string): string {
  const modelEmojis: Record<string, string> = {
    'genmoji': '😊',
    'sticker': '🏷️',
    'mascot': '🐱',
    'pixel': '👾',
    'flat': '🟢',
    '3d': '🔮',
    'cartoon': '🎭',
    // Add more model representative emojis as needed
  };
  
  return modelEmojis[modelName.toLowerCase()] || '🎨';
}

export default async function ModelIndex() {
  const locale = await getLocale();
  const groups = await getEmojiGroups(locale);
  
  const models = groups.models.map(model => ({
    id: model.name,
    name: model.name,
    slug: model.name,
    translated_name: model.translated_name,
    count: model.count
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
            <span className="font-medium text-foreground">Models</span>
          </li>
        </ol>
      </nav>
      
      {/* Header section */}
      <div className="relative overflow-hidden bg-muted/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Emoji Models</h1>
            <p className="text-muted-foreground leading-relaxed">
              Browse our collection of emoji models. Each model offers a unique style and design aesthetic.
              Select a model to explore all emojis created using that particular style.
            </p>
          </div>
        </div>
      </div>
      
      {/* Model card grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {models.map(model => (
            <div
              key={model.slug}
              className="bg-background rounded-xl overflow-hidden border border-muted/20 transition-all hover:shadow-lg"
            >
              <Link href={`/${locale}/model/${model.slug}`} className="block">
                <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                  <span className="text-5xl">{getModelEmoji(model.slug)}</span>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 capitalize">{model.translated_name}</h2>
                  <p className="text-muted-foreground text-sm">
                    {model.count 
                      ? `${model.count} emojis available`
                      : 'Explore this model'}
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