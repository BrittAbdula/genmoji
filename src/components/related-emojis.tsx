import EmojiContainer from "./emoji-container";
import { getRelatedEmojis } from "@/lib/api";
import { getLocale } from 'next-intl/server';

export async function RelatedEmojis({ slug }: { slug: string }) {
    const locale = await getLocale()
    const relatedEmojis = await getRelatedEmojis(slug, locale);

    return (
        <div className="grid w-full auto-rows-max grid-cols-4 place-items-center justify-items-center gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 mx-auto">
            {relatedEmojis.map((relatedEmoji) => (
                <EmojiContainer
                    key={relatedEmoji.slug}
                    emoji={relatedEmoji}
                    size="sm"
                />
            ))}
        </div>
    );
} 