import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { siteConfig } from "@/lib/config";
import { buildAlternates } from '@/lib/seo';

export const runtime = 'edge';

export async function generateMetadata() {
  const t = await getTranslations('legal.termsOfService');
  const locale = await getLocale();
  const path = '/terms-of-service';
  const alternates = buildAlternates(path, locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: `${t('title')} | Genmoji Online`,
    description: "Read the terms and conditions governing your use of Genmoji Online's AI-powered emoji generation services.",
    alternates,
    openGraph: {
      title: `${t('title')} | Genmoji Online`,
      description: "Understand the terms and conditions for using Genmoji Online's services.",
      url: alternates.canonical,
      images: [
        {
          url: `${siteConfig.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Genmoji Online Terms of Service',
        },
      ],
    },
  };
}

export default async function TermsOfService() {
  const t = await getTranslations('legal.termsOfService');

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">{t('effectiveDate')}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('acceptance.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('acceptance.description')}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('serviceDescription.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('serviceDescription.description')}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('userResponsibilities.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('userResponsibilities.description')}
          </p>
          <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
            {t.raw('userResponsibilities.items').map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('intellectualProperty.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('intellectualProperty.description')}
          </p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">{t('intellectualProperty.usage.title')}</h3>
            <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
              {t.raw('intellectualProperty.usage.items').map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">{t('intellectualProperty.limitations.title')}</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t('intellectualProperty.limitations.description')}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('liability.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('liability.description')}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('changes.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('changes.description')}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('governingLaw.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('governingLaw.description')}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{t('contact.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            {t('contact.description')}
          </p>
        </div>
      </div>
    </main>
  );
}
