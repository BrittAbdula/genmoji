import { Metadata } from 'next';
import ModelPageClient from './client';
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
  const modelName = groups.models.find(model => model.name === slug)?.translated_name || 'Unknown Model';
  
  const title = `${modelName} Style Emojis | ${siteConfig.name}`;
  const description = `Browse our collection of ${modelName} style emojis. Find the perfect emoji for your messages and social media.`;
  
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
          alt: `${modelName} Style Emojis`
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
      canonical: locale === 'en' ? `${siteConfig.url}/model/${slug}` : `${siteConfig.url}/${locale}/model/${slug}`,
      languages: {
        'x-default': `${siteConfig.url}/model/${slug}`,
        'en': `${siteConfig.url}/model/${slug}`,
        'en-US': `${siteConfig.url}/model/${slug}`,
        'ja': `${siteConfig.url}/ja/model/${slug}`,
        'ja-JP': `${siteConfig.url}/ja/model/${slug}`,
        'fr': `${siteConfig.url}/fr/model/${slug}`,
        'fr-FR': `${siteConfig.url}/fr/model/${slug}`,
        'zh': `${siteConfig.url}/zh/model/${slug}`,
        'zh-CN': `${siteConfig.url}/zh/model/${slug}`,
      },
    },
  };
}

export default async function ModelPage(props: {
  params: Params
  searchParams: SearchParams
}) {
  const { slug } = await props.params;
  const locale = await getLocale();
  const groups = await getEmojiGroups(locale);
  const modelName = groups.models.find(model => model.name === slug)?.translated_name || 'Unknown Model';
  if (!modelName || modelName === "") {
    return <div>Model not found</div>;
  }
  
  const initialEmojis = await getEmojis(0, 24, locale, { 
    model: slug,
    sort: 'latest'
  });
  
  return (
    <ModelPageClient 
      params={{ slug, locale }} 
      initialData={{ 
        emojis: initialEmojis,
        groups: groups
      }} 
    />
  );
} 