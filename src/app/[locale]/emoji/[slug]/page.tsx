import EmojiContainer from "@/components/emoji-container";
import { EmojiDetailContainer } from "@/components/emoji-detail-container";
import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata } from "next";
import Script from 'next/script';
import { getEmoji } from '@/lib/api';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { RelatedEmojis } from '@/components/related-emojis';
import { getLocale } from "next-intl/server";

// Add Edge Runtime configuration
export const runtime = 'edge';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
    try {
        const {slug} = await props.params;
        const locale = await getLocale();
        const emoji = await getEmoji(slug, locale);
        const t = await getTranslations('emoji.detail.meta');

        return constructMetadata({
            title: t('title', { prompt: emoji.prompt }),
            description: t('description', { prompt: emoji.prompt }),
            openGraph: {
                title: t('ogTitle', { prompt: emoji.prompt }),
                description: t('ogDescription', { prompt: emoji.prompt }),
                type: 'article',
                images: [{
                    url: emoji.image_url,
                    width: 256,
                    height: 256,
                    alt: `${emoji.prompt} genmoji`,
                }],
            },
            twitter: {
                card: 'summary_large_image',
                title: t('twitterTitle', { prompt: emoji.prompt }),
                description: t('twitterDescription', { prompt: emoji.prompt }),
                images: [emoji.image_url],
            },
            icons: {
                icon: emoji.image_url,
                shortcut: emoji.image_url,
                apple: emoji.image_url,
                other: {
                    rel: 'apple-touch-icon-precomposed',
                    url: emoji.image_url,
                },
            },
            path: locale === 'en' ? `emoji/${emoji.slug}/` : `${locale}/emoji/${emoji.slug}/`,
        });
    } catch (error) {
        console.error('Error generating metadata:', error);
        return constructMetadata({
            title: `Genmoji Not Found | Genmoji Online`,
            description: 'The requested genmoji could not be found. Create your own custom genmojis with Genmoji Online.',
            path: '404',
        });
    }
}

export default async function EmojiPage(props: Props) {
    try {
        const {slug} = await props.params;
        const locale = await getLocale();
        const emoji = await getEmoji(slug, locale);
        const t = await getTranslations('emoji');

        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'ImageObject',
            name: `${emoji.prompt} Genmoji`,
            description: `A custom genmoji of ${emoji.prompt} created with Genmoji Online`,
            contentUrl: emoji.image_url,
            thumbnailUrl: emoji.image_url,
            datePublished: emoji.created_at,
            creator: {
                '@type': 'Organization',
                name: 'Genmoji Online',
                url: 'https://genmojionline.com'
            },
            interactionStatistic: {
                '@type': 'InteractionCounter',
                interactionType: 'https://schema.org/LikeAction',
                userInteractionCount: emoji.likes_count
            },
            license: 'https://creativecommons.org/publicdomain/zero/1.0/',
            acquireLicensePage: 'https://genmojionline.com/terms-of-service',
            creditText: 'Created with Genmoji Online - Free for any use',
            copyrightNotice: 'No Copyright - Generated with Genmoji Online',
            encodingFormat: 'image/png',
            width: '256px',
            height: '256px',
            uploadDate: emoji.created_at,
            isAccessibleForFree: true,
            usageTerms: 'Free for any use - no attribution required. You can use, modify, and distribute this genmoji without any restrictions.'
        };

        return (
            <>
                <Script id="json-ld" type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </Script>
                <div className="container mx-auto px-4 py-8">
                    <EmojiDetailContainer emoji={emoji} />
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold mb-8 text-left">{t('similar')}</h2>
                    </div>
                    <Suspense fallback={
                        <div className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
                            ))}
                        </div>
                    }>
                        <RelatedEmojis slug={slug} />
                    </Suspense>
                </div>
            </>
        );
    } catch (error) {
        console.error('Error loading emoji:', error);
        const t = await getTranslations('emoji.notFound');
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="text-muted-foreground hover:text-primary">
                        {t('backToHome')}
                    </Link>
                    
                    <div className="mt-8 text-center">
                        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
                        <p className="text-muted-foreground">
                            {t('description')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }
} 
