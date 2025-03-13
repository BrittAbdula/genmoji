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
    title: `Genmoji Colors Collection | ${siteConfig.name}`,
    description: 'Browse our collection of genmojis by color. Find genmojis in your favorite colors to express yourself colorfully.',
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title: 'Genmoji Colors Collection',
      description: 'Browse our collection of genmojis by color. Find genmojis in your favorite colors to express yourself colorfully.',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Genmoji Colors Collection'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Genmoji Colors Collection | ${siteConfig.name}`,
      description: 'Browse our collection of genmojis by color. Find genmojis in your favorite colors to express yourself colorfully.',
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: locale === 'en' ? `${siteConfig.url}/color` : `${siteConfig.url}/${locale}/color`,
      languages: {
        'x-default': `${siteConfig.url}/color`,
        'en': `${siteConfig.url}/color`,
        'en-US': `${siteConfig.url}/color`,
        'ja': `${siteConfig.url}/ja/color`,
        'ja-JP': `${siteConfig.url}/ja/color`,
        'fr': `${siteConfig.url}/fr/color`,
        'fr-FR': `${siteConfig.url}/fr/color`,
        'zh': `${siteConfig.url}/zh/color`,
        'zh-CN': `${siteConfig.url}/zh/color`,
      },
    },
  };
}

// Function to get a color circle representation
function getColorCircle(colorName: string): string {
  const colorMap: Record<string, string> = {
    'red': 'bg-red-500',
    'orange': 'bg-orange-500',
    'yellow': 'bg-yellow-500',
    'green': 'bg-green-500',
    'blue': 'bg-blue-500',
    'purple': 'bg-purple-500',
    'pink': 'bg-pink-500',
    'black': 'bg-black',
    'white': 'bg-white border border-gray-200',
    'brown': 'bg-amber-800',
    'gray': 'bg-gray-500',
    'cyan': 'bg-cyan-500',
    'metallic': 'bg-gradient-to-r from-gray-300 to-gray-400',
    // Add more colors as needed
  };
  
  return colorMap[colorName.toLowerCase()] || 'bg-gray-300';
}

export default async function ColorIndex() {
  const locale = await getLocale();
  const groups = await getEmojiGroups(locale);
  
  const colors = groups.colors.map(color => ({
    id: color.name,
    name: color.name,
    slug: color.name,
    translated_name: color.translated_name,
    count: color.count
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
            <span className="font-medium text-foreground">Colors</span>
          </li>
        </ol>
      </nav>
      
      {/* Header section */}
      <div className="relative overflow-hidden bg-muted/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Genmoji Colors</h1>
            <p className="text-muted-foreground leading-relaxed">
              Browse our collection of genmojis by color. Each color group contains genmojis that prominently feature that color.
              Select a color to explore all genmojis in that particular color scheme.
            </p>
          </div>
        </div>
      </div>
      
      {/* Color card grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {colors.map(color => (
            <div
              key={color.slug}
              className="bg-background rounded-xl overflow-hidden border border-muted/20 transition-all hover:shadow-lg"
            >
              <Link href={`/${locale}/color/${color.slug}`} className="block">
                <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full ${getColorCircle(color.slug)}`}></div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 capitalize">{color.translated_name}</h2>
                  <p className="text-muted-foreground text-sm">
                    {color.count 
                      ? `${color.count} genmojis available`
                      : 'Explore this color'}
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