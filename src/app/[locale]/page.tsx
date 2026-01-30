import { Benefits } from "@/components/sections/benefits";
import { BentoGrid } from "@/components/sections/bento";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { FeatureHighlight } from "@/components/sections/feature-highlight";
import { FeatureScroll } from "@/components/sections/feature-scroll";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { Testimonials } from "@/components/sections/testimonials";
import { HomeGenerator } from '@/components/sections/home-generator';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { siteConfig } from "@/lib/config";
import { routing } from '@/i18n/routing';
import { constructMetadata } from "@/lib/utils";
import { buildAlternates } from "@/lib/seo";
import { getLocale } from 'next-intl/server';
import { GalleryContent } from '@/components/gallery-content';
import { HorizontalGalleryContent } from '@/components/horizontal-gallery-content';
import { getEmojis } from '@/lib/api';
import Script from 'next/script';

// 为静态生成提供所有支持的语言
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// 强制静态渲染
export const dynamic = 'force-static';

// 禁用重新验证，确保数据只获取一次
export const revalidate = false;

// 禁用动态参数
export const dynamicParams = false;

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
  // 启用静态渲染
  setRequestLocale(locale);
  // 预取首屏可索引的最近 Genmoji（SSR）
  // Cloudflare Pages 纯前端部署可通过 env 关闭（NEXT_PUBLIC_PREFETCH_HOME_RECENT=0）
  const PREFETCH = process.env.NEXT_PUBLIC_PREFETCH_HOME_RECENT !== '0';
  let initialEmojis: any[] = [];
  if (PREFETCH) {
    try {
      initialEmojis = await getEmojis(0, 40, locale, { sort: 'quality', isIndexable: true });
    } catch (e) {
      initialEmojis = [];
    }
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
      <HorizontalGalleryContent initialEmojis={initialEmojis.length ? initialEmojis : undefined} />
      <FeatureHighlight />
      <Features />
      <FAQ />
      <CTA />
    </main>
  );
}
