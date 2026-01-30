import { Metadata } from 'next';
import CategoryPageClient from './client';
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
  const categoryName = groups.categories.find(category => category.name === slug)?.translated_name || 'Unknown Category';
  
  const title = `${categoryName} Genmojis | ${siteConfig.name}`;
  const description = `Browse our collection of ${categoryName} genmojis. Find the perfect genmoji for your messages and social media.`;
  
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
          alt: `${categoryName} Genmojis`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: buildAlternates(`/category/${slug}`, locale),
  };
}

// 预先获取数据，用于SEO和初始渲染
async function getInitialData(slug: string, locale: string) {
  const categoryName = decodeURIComponent(slug);
  const groups = await getEmojiGroups(locale);
  const initialEmojis = await getEmojis(0, 24, locale, {
    category: categoryName,
    sort: 'quality',
    isIndexable: true,
  });
  
  return {
    groups,
    initialEmojis,
    categoryName
  };
}

export default async function CategoryPage(props: {
  params: Params
  searchParams: SearchParams
}) {
  const { slug } = await props.params;
  const locale = await getLocale();
  const categoryName = decodeURIComponent(slug);
  
  if (!categoryName || categoryName === "") {
    return <div>Category not found</div>;
  }
  
  // 获取分组数据和初始表情数据
  const groups = await getEmojiGroups(locale);
  const categoryTranslatedName = groups.categories.find(category => category.name === slug)?.translated_name || categoryName;
  
  const initialEmojis = await getEmojis(0, 24, locale, { 
    category: categoryName,
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
        name: 'Categories',
        item: buildCanonicalUrl('/category', locale),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryTranslatedName,
        item: buildCanonicalUrl(`/category/${slug}`, locale),
      },
    ],
  };
  
  return (
    <>
      <Script id="ld-breadcrumb-category-detail" type="application/ld+json">
        {JSON.stringify(breadcrumbLd)}
      </Script>
      <CategoryPageClient 
        params={{ slug, locale }} 
        initialData={{ 
          emojis: initialEmojis,
          categoryName: categoryTranslatedName
        }} 
      />
    </>
  );
} 
