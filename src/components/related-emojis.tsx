import EmojiContainer from "./emoji-container";
import { getRelatedEmojis } from "@/lib/api";
import { getLocale } from 'next-intl/server';

export async function RelatedEmojis({ slug }: { slug: string }) {
    const locale = await getLocale()
    const relatedEmojis = await getRelatedEmojis(slug, locale);

    return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
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