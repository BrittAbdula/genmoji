import { Metadata } from "next";
import { constructMetadata } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { GalleryContent } from "@/components/gallery-content";
import { getLocale } from 'next-intl/server';

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
        'en': `${siteConfig.url}/gallery`,
        'ja': `${siteConfig.url}/ja/gallery`,
        'fr': `${siteConfig.url}/fr/gallery`,
        'zh': `${siteConfig.url}/zh/gallery`,
      },
    },
  });
}

export default function GalleryPage() {
  return <GalleryContent />;
} 