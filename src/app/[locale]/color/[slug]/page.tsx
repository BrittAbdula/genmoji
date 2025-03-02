import { Metadata } from 'next';
import ColorPageClient from './client';
import { getEmojiGroups, getEmojis } from '@/lib/api';
import { siteConfig } from "@/lib/config";
import { getLocale } from 'next-intl/server';

export const runtime = 'edge';

type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata(props: {
  params: Params
  searchParams: SearchParams
}): Promise<Metadata> {
  const { slug } = await props.params;
  const locale = await getLocale();
  const groups = await getEmojiGroups(locale);
  const colorName = groups.colors.find(color => color.name === slug)?.translated_name || 'Unknown Color';
  
  const title = `${colorName} Emojis | ${siteConfig.name}`;
  const description = `Browse our collection of ${colorName} emojis. Find the perfect emoji for your messages and social media.`;
  
  return {
    title,
    description,
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
          alt: `${colorName} Emojis`
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
      canonical: locale === 'en' ? `${siteConfig.url}/color/${slug}` : `${siteConfig.url}/${locale}/color/${slug}`,
      languages: {
        'x-default': `${siteConfig.url}/color/${slug}`,
        'en': `${siteConfig.url}/color/${slug}`,
        'en-US': `${siteConfig.url}/color/${slug}`,
        'ja': `${siteConfig.url}/ja/color/${slug}`,
        'ja-JP': `${siteConfig.url}/ja/color/${slug}`,
        'fr': `${siteConfig.url}/fr/color/${slug}`,
        'fr-FR': `${siteConfig.url}/fr/color/${slug}`,
        'zh': `${siteConfig.url}/zh/color/${slug}`,
        'zh-CN': `${siteConfig.url}/zh/color/${slug}`,
      },
    },
  };
}

// 预先获取数据，用于SEO和初始渲染
async function getInitialData(slug: string, locale: string) {
  const groups = await getEmojiGroups(locale);
  const colorName = groups.colors.find(color => color.name === slug)?.translated_name || 'Unknown Color';
  const initialEmojis = await getEmojis(0, 24, locale, {
    color: slug,
    sort: 'latest'
  });
  
  return {
    groups,
    initialEmojis,
    colorName
  };
}

export default async function ColorPage(props: {
  params: Params
  searchParams: SearchParams
}) {
  const { slug } = await props.params;
  const locale = await getLocale();
  
  const groups = await getEmojiGroups(locale);
  const colorName = groups.colors.find(color => color.name === slug)?.translated_name || 'Unknown Color';

  if (!colorName || colorName === "") {
    return <div>Color not found</div>;
  }
  const initialEmojis = await getEmojis(0, 24, locale, { 
    color: slug,
    sort: 'latest'
  });
  
  return (
    <ColorPageClient 
      params={{ slug, locale }} 
      initialData={{ 
        emojis: initialEmojis,
        groups: groups
      }} 
    />
  );
} 