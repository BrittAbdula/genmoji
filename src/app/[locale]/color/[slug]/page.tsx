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
  
  const title = `${colorName} Genmojis | ${siteConfig.name}`;
  const description = `Browse our collection of ${colorName} genmojis. Find the perfect genmoji for your messages and social media.`;
  
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
          alt: `${colorName} Genmojis`
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

export default async function ColorPage(props: {
  params: Params
  searchParams: SearchParams
}) {
  const { slug } = await props.params;
  const locale = await getLocale();
  
  // 预先获取分组数据和表情数据
  const groups = await getEmojiGroups(locale);
  const colorName = groups.colors.find(color => color.name === slug)?.translated_name || 'Unknown Color';

  if (!colorName || colorName === "") {
    return <div>Color not found</div>;
  }
  
  // 获取初始表情数据
  const initialEmojis = await getEmojis(0, 24, locale, { 
    color: slug,
    sort: 'latest'
  });
  
  return (
    <ColorPageClient 
      params={{ slug, locale }} 
      initialData={{ 
        emojis: initialEmojis,
        colorName: colorName,
        // 不传递完整的groups数据，因为它将通过Context Provider提供
      }} 
    />
  );
} 