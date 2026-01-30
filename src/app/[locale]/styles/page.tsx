import { Metadata } from 'next';
import { siteConfig } from '@/lib/config';
import { buildAlternates } from '@/lib/seo';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import Image from 'next/image';

export const runtime = 'edge';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: `Styles & Categories | ${siteConfig.name}`,
    description: 'Explore all styles and categories. From classic to pixel art, 3D, hand-drawn, and more creative styles.',
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title: 'Styles & Categories',
      description: 'Explore all styles and categories. From classic to pixel art, 3D, hand-drawn, and more creative styles.',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Styles & Categories'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Styles & Categories | ${siteConfig.name}`,
      description: 'Explore all styles and categories. From classic to pixel art, 3D, hand-drawn, and more creative styles.',
      images: ['/og-image.png'],
    },
    alternates: buildAlternates('/styles', locale),
  };
}

// Define the style categories with their sub-styles
const getStyleCategories = (t: any) => [
  {
    id: 'genmoji',
    name: t('generator.models.genmoji.name'),
    description: t('generator.models.genmoji.description'),
    image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4ad1e218-eae7-4976-8496-b68cd6374f00/public',
    subStyles: []
  },
  {
    id: 'sticker',
    name: t('generator.models.sticker.name'),
    description: t('generator.models.sticker.description'),
    image: 'https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public',
    subStyles: []
  },
  {
    id: 'gemstickers',
    name: t('generator.models.gemstickers.name'),
    description: t('generator.models.gemstickers.description'),
    image: '/emojis/handdrawn.png',
    subStyles: [
      { id: 'pop-art', name: 'Pop Art', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pop_art_love.png' },
      { id: 'japanese-matchbox', name: 'Japanese Matchbox', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/matchbox_no_text.png' },
      { id: 'cartoon-dino', name: 'Cartoon Dino', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/dragon.png' },
      { id: 'pixel-art', name: 'Pixel Art', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pixel.png' },
      { id: 'royal', name: 'Royal', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/royal.png' },
      { id: 'football-sticker', name: 'Football Sticker', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/football.png' },
      { id: 'claymation', name: 'Claymation', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/claymation.png' },
      { id: 'vintage-bollywood', name: 'Vintage Bollywood', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/bolly.png' },
      { id: 'sticker-bomb', name: 'Sticker Bomb', image: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/bomb.png' }
    ]
  },
  {
    id: 'pixel',
    name: t('generator.models.pixel.name'),
    description: t('generator.models.pixel.description'),
    image: '/emojis/pixel.png',
    subStyles: []
  },
  {
    id: 'handdrawn',
    name: t('generator.models.handdrawn.name'),
    description: t('generator.models.handdrawn.description'),
    image: '/emojis/handdrawn.png',
    subStyles: []
  },
  {
    id: '3d',
    name: t('generator.models.3d.name'),
    description: t('generator.models.3d.description'),
    image: '/emojis/3d.png',
    subStyles: []
  },
  {
    id: 'claymation',
    name: t('generator.models.claymation.name'),
    description: t('generator.models.claymation.description'),
    image: '/emojis/Claymation.png',
    subStyles: []
  },
  {
    id: 'origami',
    name: t('generator.models.origami.name'),
    description: t('generator.models.origami.description'),
    image: '/emojis/Origami.png',
    subStyles: []
  },
  {
    id: 'cross-stitch',
    name: t('generator.models.cross-stitch.name'),
    description: t('generator.models.cross-stitch.description'),
    image: '/emojis/Cross-stitch-Pixel.png',
    subStyles: []
  },
  {
    id: 'steampunk',
    name: t('generator.models.steampunk.name'),
    description: t('generator.models.steampunk.description'),
    image: '/emojis/Steampunk.png',
    subStyles: []
  },
  {
    id: 'liquid-metal',
    name: t('generator.models.liquid-metal.name'),
    description: t('generator.models.liquid-metal.description'),
    image: '/emojis/Liquid-Metal.png',
    subStyles: []
  }
];

export default async function CategoriesPage() {
  const locale = await getLocale();
  const t = await getTranslations();
  const styleCategories = getStyleCategories(t);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb navigation */}
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
            <span className="font-medium text-foreground">{t('common.navigation.styles')}</span>
          </li>
        </ol>
      </nav>
      
      {/* Header section */}
      <div className="relative overflow-hidden bg-muted/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl font-bold">Styles & Categories</h1>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Explore our diverse collection of styles. From classic Apple-style to creative 
              pixel art, 3D designs, and artistic hand-drawn styles. Each category offers unique aesthetics 
              to express your creativity.
            </p>
          </div>
        </div>
      </div>
      
      {/* Style categories grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {styleCategories.map((category) => (
            <div
              key={category.id}
              className="bg-background rounded-xl overflow-hidden border border-muted/20 transition-all hover:shadow-lg hover:border-primary/20"
            >
              <Link href={`/${locale}/styles/${category.id}`} className="block">
                <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center relative">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={120}
                    height={120}
                    className="rounded-xl object-cover"
                  />
                  {category.subStyles.length > 0 && (
                    <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {category.subStyles.length} styles
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{category.name}</h2>
                  <p className="text-muted-foreground text-sm mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Explore this style
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Additional info section */}
      <div className="bg-muted/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Create Your Own</h2>
            <p className="text-muted-foreground mb-6">
              Ready to create in your favorite style? Use our AI-powered generator to turn your 
              text prompts or images into custom creations in any of these styles.
            </p>
            <Link
              href={`/${locale}/`}
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Creating
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
