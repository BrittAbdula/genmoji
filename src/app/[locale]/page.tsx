import { Benefits } from "@/components/sections/benefits";
import { BentoGrid } from "@/components/sections/bento";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { FeatureHighlight } from "@/components/sections/feature-highlight";
import { FeatureScroll } from "@/components/sections/feature-scroll";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { Pricing } from "@/components/sections/pricing";
import { Testimonials } from "@/components/sections/testimonials";
import { GenmojiGenerator } from '@/components/sections/genmoji-generator';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { siteConfig } from "@/lib/config";
import { routing } from '@/i18n/routing';

// 为静态生成提供所有支持的语言
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
    alternates: {
      canonical: locale === 'en' ? `${siteConfig.url}` : `${siteConfig.url}/${locale}`,
      languages: {
        'en':  `${siteConfig.url}`,
        'ja': `${siteConfig.url}/ja`,
        'fr': `${siteConfig.url}/fr`,
        'zh': `${siteConfig.url}/zh`,
      },
    },
  };
}

export default async function Home(props: Props) {
  const { locale } = await props.params;
  // 启用静态渲染
  setRequestLocale(locale);

  return (
    <main className="relative">
      <Hero />
      <GenmojiGenerator />
      {/* <FeatureScroll /> */}
      <FeatureHighlight />
      {/* <BentoGrid />
      <Benefits /> */}
      <Features />
      {/*  <Testimonials />
      <Pricing /> */}
      <FAQ />
      <CTA />
    </main>
  );
}
