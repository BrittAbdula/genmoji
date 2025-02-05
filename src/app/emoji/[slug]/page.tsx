import EmojiContainer from "@/components/emoji-container";
import { EmojiDetail } from "@/components/emoji-detail";
import { Emoji } from "@/types/emoji";
import Link from "next/link";
import { cn, constructMetadata } from "@/lib/utils";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import Script from 'next/script';
import { getEmoji, getRelatedEmojis } from '../utils';

// Add Edge Runtime configuration
export const runtime = 'edge';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
    try {
        const {slug} = await props.params;
        const emoji = await getEmoji(slug);
        return constructMetadata({
            title: `${emoji.prompt} | Genmoji Online`,
            description: `Explore and download this custom ${emoji.prompt} genmoji created with Genmoji Online. Create your own personalized genmojis with our AI-powered generator.`,
            openGraph: {
                title: `${emoji.prompt} - Custom Genmoji`,
                description: `Check out this ${emoji.prompt} genmoji created with Genmoji Online. Create your own custom genmojis now!`,
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
                title: `${emoji.prompt} Genmoji`,
                description: `Check out this ${emoji.prompt} genmoji created with Genmoji Online!`,
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
            path: `emoji/${emoji.slug}/`,
        });
    } catch (error) {
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
        const emoji = await getEmoji(slug);
        const relatedEmojis = await getRelatedEmojis(slug);

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
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                      
                      <div className="flex flex-col items-center">
                        <div className="w-full max-w-[520px]">
                          <EmojiContainer emoji={emoji} size="xl" />
                        </div>
                        
                        <div className="w-full max-w-md">
                          <EmojiDetail emoji={emoji} />
                        </div>
                      </div>

                      <div className="mt-16">
                        <h2 className="text-xl font-bold mb-6">Related Genmojis</h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {relatedEmojis.map((relatedEmoji) => (
                            <EmojiContainer 
                              key={relatedEmoji.slug} 
                              emoji={relatedEmoji}
                              size="sm"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                </div>
            </>
        );
    } catch (error) {
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto">
                    <Link href="/" className="text-muted-foreground hover:text-primary">
                        ← Back to Home
                    </Link>
                    
                    <div className="mt-8 text-center">
                        <h1 className="text-2xl font-bold mb-4">Emoji Not Found</h1>
                        <p className="text-muted-foreground">
                            The emoji you're looking for doesn't exist or has been removed.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
} 
