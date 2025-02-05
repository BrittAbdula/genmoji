import { Emoji, EmojiResponse } from "@/types/emoji";

export async function getEmoji(slug: string): Promise<Emoji> {
    const res = await fetch(`https://gen.genmojionline.com?slug=${slug}`, {
        headers: {
            'Origin': 'https://genmojionline.com'
        },
        next: { revalidate: 60 }
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch emoji');
    }
    
    const emojiResponse = await res.json() as EmojiResponse;
    if (!emojiResponse.success || !emojiResponse.emoji) {
        throw new Error('Emoji not found');
    }
    return emojiResponse.emoji;
}

export async function getRelatedEmojis(slug: string): Promise<Emoji[]> {
    const res = await fetch(`https://gen.genmojionline.com?slug=${slug}&related=12`, {
        headers: {
            'Origin': 'https://genmojionline.com'
        },
        next: { revalidate: 60 }
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch related emojis');
    }
    
    const emojiResponse = await res.json() as EmojiResponse;
    return emojiResponse.emojis || [];
} 