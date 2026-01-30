import { Metadata } from 'next';
import ModelPageClient from './client';
import { getEmojiGroups, getEmojis } from '@/lib/api';
import { siteConfig } from "@/lib/config";
import { getLocale } from 'next-intl/server';
import { buildAlternates, buildCanonicalUrl } from '@/lib/seo';
import Script from 'next/script';
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
  
  const title = `${modelName} Style GEmojis | ${siteConfig.name}`;
  const description = `Browse our collection of ${modelName} style gemojis. Find the perfect emoji for your messages and social media.`;
  
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
          alt: `${modelName} Style Genmojis`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: buildAlternates(`/model/${slug}`, locale),
  };
}

export default async function ModelPage(props: {
  params: Params
  searchParams: SearchParams
}) {
  const { slug } = await props.params;
  const locale = await getLocale();
  
  // 获取分组数据
  const groups = await getEmojiGroups(locale);
  const modelName = groups.models.find(model => model.name === slug)?.translated_name || 'Unknown Model';
  
  if (!modelName || modelName === "") {
    return <div>Model not found</div>;
  }
  
  // 获取初始表情数据
  const initialEmojis = await getEmojis(0, 24, locale, { 
    model: slug,
    sort: 'quality',
    isIndexable: true,
  });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: buildCanonicalUrl('/', locale),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Models',
        item: buildCanonicalUrl('/model', locale),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: modelName,
        item: buildCanonicalUrl(`/model/${slug}`, locale),
      },
    ],
  };
  
  return (
    <>
      <Script id="ld-breadcrumb-model-detail" type="application/ld+json">
        {JSON.stringify(breadcrumbLd)}
      </Script>
      <ModelPageClient 
        params={{ slug, locale }} 
        initialData={{ 
          emojis: initialEmojis,
          modelName: modelName
        }} 
      />
    </>
  );
} 
