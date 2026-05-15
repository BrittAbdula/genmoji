import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { StyleShowcase } from "@/components/sections/style-showcase";
import { CategoryShowcase } from "@/components/sections/category-showcase";
import { TrendingGrid } from "@/components/sections/trending-grid";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { siteConfig } from "@/lib/config";
import { buildAlternates } from "@/lib/seo";
import { HorizontalGalleryContent } from '@/components/horizontal-gallery-content';
import { getEmojis, getEmojiGroups } from '@/lib/api';
import { filterSfw } from '@/lib/sfw-filter';
import Script from 'next/script';

// Cloudflare Pages requires Edge Runtime for dynamic routes
export const runtime = 'edge';

// 启用 ISR: 每 60 秒重新生成一次页面
export const revalidate = 60;

// 移除 force-static 以允许动态更新
// export const dynamic = 'force-static';
// export const dynamicParams = false;

type Props = {
  params: Promise<{ locale: string }>;
};

// 生成元数据
export async function generateMetadata(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations('seo');

  return {
    title: t('title'),
    description: t('defaultTitle'),
    openGraph: {
      title: t('title'),
      description: t('defaultTitle'),
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t('title'),
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('defaultTitle'),
      images: [`${siteConfig.url}/og-image.png`],
    },
    alternates: buildAlternates('/', locale),
  };
}

export default async function Home(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const PREFETCH = process.env.NEXT_PUBLIC_PREFETCH_HOME_RECENT !== '0';
  let initialEmojis: any[] = [];
  let trendingEmojis: any[] = [];
  let groups: { categories: { name: string; translated_name: string; count?: number }[] } = { categories: [] };

  if (PREFETCH) {
    // Over-fetch then filter out NSFW client-side because backend `is_indexable`
    // is not strict enough for homepage exposure.
    const [latestRes, trendingRes, groupsRes] = await Promise.allSettled([
      getEmojis(0, 60, locale, { sort: 'latest', hasInteractions: true, isIndexable: true }),
      getEmojis(0, 48, locale, { sort: 'popular', isIndexable: true }),
      getEmojiGroups(locale),
    ]);
    if (latestRes.status === 'fulfilled') initialEmojis = filterSfw(latestRes.value).slice(0, 24);
    if (trendingRes.status === 'fulfilled') trendingEmojis = filterSfw(trendingRes.value).slice(0, 18);
    if (groupsRes.status === 'fulfilled') groups = groupsRes.value;
  }
  // FAQ 结构化数据
  const tFaq = await getTranslations('faq');
  const faqItems = tFaq.raw('items') as Array<{ question: string; answer: string }>;
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer }
    }))
  };
  const webSiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Genmoji Online',
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/gallery?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Genmoji Online',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      'https://twitter.com/genmojionline',
      'https://instagram.com/genmojionline'
    ]
  };

  return (
    <main className="items-center container mx-auto p-2">
      <Script id="ld-faq" type="application/ld+json">{JSON.stringify(faqLd)}</Script>
      <Script id="ld-website" type="application/ld+json">{JSON.stringify(webSiteLd)}</Script>
      <Script id="ld-org" type="application/ld+json">{JSON.stringify(orgLd)}</Script>
      <Hero />
      <StyleShowcase />
      <CategoryShowcase categories={groups.categories} locale={locale} />
      <TrendingGrid emojis={trendingEmojis} />
      <HorizontalGalleryContent initialEmojis={initialEmojis.length ? initialEmojis : undefined} />
      <FAQ />
      <CTA />
    </main>
  );
}
