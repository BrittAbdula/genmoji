import { Metadata } from "next";
import { constructMetadata } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { GalleryContent } from "@/components/gallery-content";
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { outfit } from '@/lib/fonts';
import { AuroraText } from "@/components/ui/aurora-text";

// Add Edge Runtime configuration
export const runtime = 'edge';

export async function generateMetadata() {
  const locale = await getLocale();
  return constructMetadata({
    title: "Genmoji Gallery - Explore AI-Generated Emoji Collection",
    description: "Browse our extensive collection of AI-generated genmojis. Discover unique, creative, and expressive genmojis created by our community. Find the perfect genmoji for your needs.",
    openGraph: {
      title: "Genmoji Gallery - AI-Generated Genmoji Collection",
      description: "Explore our curated collection of AI-generated genmojis. Find unique and expressive genmojis for your digital conversations.",
      type: "website",
      images: [{
        url: `${siteConfig.url}/og-gallery.png`,
        width: 1200,
        height: 630,
        alt: "Genmoji Gallery Preview"
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Genmoji Gallery - AI-Generated Genmoji Collection",
      description: "Explore our curated collection of AI-generated genmojis. Find unique and expressive genmojis for your digital conversations.",
      images: [`${siteConfig.url}/og-gallery.png`],
    },
    alternates: {
      canonical: locale === 'en' ? `${siteConfig.url}/gallery` : `${siteConfig.url}/${locale}/gallery`,
      languages: {
        'x-default': `${siteConfig.url}/gallery`,
        'en': `${siteConfig.url}/gallery`,
        'en-US': `${siteConfig.url}/gallery`,
        'ja': `${siteConfig.url}/ja/gallery`,
        'ja-JP': `${siteConfig.url}/ja/gallery`,
        'fr': `${siteConfig.url}/fr/gallery`,
        'fr-FR': `${siteConfig.url}/fr/gallery`,
        'zh': `${siteConfig.url}/zh/gallery`,
        'zh-CN': `${siteConfig.url}/zh/gallery`,
      },
    },
  });
}

export default async function GalleryPage() {
  const t = await getTranslations('gallery');
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="relative">
        {/* Header Background */}
        <div className="absolute inset-0 h-[30vh] " />
        
        {/* Content Container */}
        <div className="container relative mx-auto pt-[calc(2rem+var(--desktop-header-height))] pb-16">
          {/* Header Section */}
          <div className="relative space-y-4 text-center my-6">
            <h1 className={cn("text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight", outfit.className)}>
              <AuroraText>{t('title')}</AuroraText>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Gallery Content */}
            <GalleryContent />
        </div>
      </div>
    </main>
  );
} 