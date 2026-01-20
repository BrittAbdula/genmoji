import { Link } from '@/i18n/routing';
import EmojiContainer from "./emoji-container";
import { getRelatedEmojis } from "@/lib/api";
import { getLocale } from 'next-intl/server';
import { Emoji } from "@/types/emoji";

export async function RelatedEmojis({ slug }: { slug: string }) {
    const locale = await getLocale()
    const relatedEmojis = await getRelatedEmojis(slug, locale);

    return (
        <div className="grid w-full auto-rows-max grid-cols-2 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mx-auto">
            {relatedEmojis.map((relatedEmoji: Emoji) => (
                <div key={relatedEmoji.slug} className="group relative flex flex-col overflow-hidden rounded-none border bg-card transition-shadow hover:shadow-md">
                    <div className="aspect-square w-full">
                        <EmojiContainer
                            emoji={relatedEmoji}
                            size="sm"
                            withBorder={false}
                            padding="p-0"
                        />
                    </div>
                    <Link
                        href={`/emoji/${relatedEmoji.slug}`}
                        className="flex flex-1 px-3 py-3 text-xs text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                        {relatedEmoji.prompt}
                    </Link>
                </div>
            ))}
        </div>
    );
} 
