import EmojiContainer from "./emoji-container";
import { getRelatedEmojis } from "@/lib/api";

export async function RelatedEmojis({ slug }: { slug: string }) {
    const relatedEmojis = await getRelatedEmojis(slug);

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