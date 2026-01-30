import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';
import { siteConfig } from "@/lib/config";
import { buildAlternates } from '@/lib/seo';

export const runtime = 'edge';

export async function generateMetadata() {
  const t = await getTranslations('legal.privacyPolicy');
  const locale = await getLocale();
  const path = '/privacy-policy';
  const alternates = buildAlternates(path, locale);

  return {
    metadataBase: new URL(siteConfig.url),
    title: `${t('title')} | Genmoji Online`,
    description: "Learn how Genmoji Online collects, uses, and protects your personal information. Read our comprehensive privacy policy.",
    alternates,
    openGraph: {
      title: `${t('title')} | Genmoji Online`,
      description: "Your privacy matters. Read Genmoji Online's privacy policy to understand how we handle your data.",
      url: alternates.canonical,
      images: [
        {
          url: `${siteConfig.url}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Genmoji Online Privacy Policy',
        },
      ],
    },
  };
}

export default async function PrivacyPolicy() {
  const t = await getTranslations('legal.privacyPolicy');

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 md:py-24">
      <h1 className="mb-8 text-4xl font-bold">{t('title')}</h1>
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('effectiveDate')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('introduction')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('informationWeCollect.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('informationWeCollect.description')}
        </p>
        <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
          {t.raw('informationWeCollect.items').map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('howWeUse.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('howWeUse.description')}
        </p>
        <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
          {t.raw('howWeUse.items').map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('dataSharing.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('dataSharing.description')}
        </p>
        <ul className="list-disc pl-6 text-gray-500 dark:text-gray-400">
          {t.raw('dataSharing.items').map((item: string, index: number) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('dataSecurity.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('dataSecurity.description')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('yourRights.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('yourRights.description')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('changes.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('changes.description')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">{t('contact.title')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('contact.description')}
        </p>
      </section>
    </main>
  );
}
