import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { siteConfig } from "@/lib/config";

export const runtime = 'edge';

export async function generateMetadata() {
  const t = await getTranslations('legal.refundPolicy');
  const locale = await getLocale();
  const path = locale === 'en' ? '/refund-policy' : `/${locale}/refund-policy`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: `${t('title')} | Genmoji Online`,
    description: t('metaDescription'),
    alternates: {
      canonical: `${siteConfig.url}${path}`,
      languages: {
        'x-default': `${siteConfig.url}/refund-policy`,
        'en': `${siteConfig.url}/refund-policy`,
        'en-US': `${siteConfig.url}/refund-policy`,
        'ja': `${siteConfig.url}/ja/refund-policy`,
        'ja-JP': `${siteConfig.url}/ja/refund-policy`,
        'fr': `${siteConfig.url}/fr/refund-policy`,
        'fr-FR': `${siteConfig.url}/fr/refund-policy`,
        'zh': `${siteConfig.url}/zh/refund-policy`,
        'zh-CN': `${siteConfig.url}/zh/refund-policy`,
      },
    },
    openGraph: {
      title: `${t('title')} | Genmoji Online`,
      description: t('metaDescription'),
      url: `${siteConfig.url}${path}`,
      images: [
        {
          url: `${siteConfig.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Genmoji Online Refund Policy',
        },
      ],
    },
  };
}

export default async function RefundPolicyPage() {
  const t = await getTranslations('legal.refundPolicy');

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 md:py-24">
      <h1 className="mb-6 text-4xl font-bold">{t('title')}</h1>
      <p className="mb-10 text-gray-500 dark:text-gray-400">{t('lastRevised')}</p>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-semibold">{t('ourRefundPolicy.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t('ourRefundPolicy.description')}</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-semibold">{t('eligibility.title')}</h2>
        <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400 space-y-2">
          {t.raw('eligibility.items').map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-semibold">{t('howToRequest.title')}</h2>
        <ol className="list-decimal pl-6 text-gray-500 dark:text-gray-400 space-y-2">
          {t.raw('howToRequest.steps').map((step: string, index: number) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-semibold">{t('processing.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t('processing.description')}</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-2xl font-semibold">{t('changes.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">{t('changes.description')}</p>
      </section>
    </main>
  );
}


