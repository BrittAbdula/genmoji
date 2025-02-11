import { Emoji, EmojiResponse } from "@/types/emoji";

// const baseURL = 'https://gen-test.auroroa.workers.dev'
const baseURL = 'https://gen.genmojionline.com'

export async function getEmoji(slug: string, locale: string): Promise<Emoji> {
    const url = `${baseURL}?slug=${slug}&locale=${locale}`;
    console.log('Fetching emoji:', { slug, locale, url });
    
    try {
        const res = await fetch(url, {
            headers: {
                'Origin': 'https://genmojionline.com'
            },
            next: { revalidate: 60 }
        });
        
        console.log('Fetch response status:', res.status);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('Failed to fetch emoji:', {
                status: res.status,
                statusText: res.statusText,
                error: errorText
            });
            throw new Error(`Failed to fetch emoji: ${res.status} ${res.statusText}`);
        }
        
        const emojiResponse = await res.json() as EmojiResponse;
        console.log('Emoji response:', emojiResponse);
        
        if (!emojiResponse.success || !emojiResponse.emoji) {
            console.error('Invalid emoji response:', emojiResponse);
            throw new Error('Emoji not found');
        }
        
        console.log('Successfully fetched emoji:', emojiResponse.emoji);
        return emojiResponse.emoji;
    } catch (error) {
        console.error('Error in getEmoji:', error);
        throw error;
    }
}

export async function getEmojis(offset: number, limit: number, locale: string, q?: string): Promise<Emoji[]> {
    const res = await fetch( q ? 
        `${baseURL}?offset=${offset}&limit=${limit}&q=${q}&locale=${locale}` : 
        `${baseURL}?offset=${offset}&limit=${limit}&locale=${locale}`, {
        headers: {
            'Origin': 'https://genmojionline.com'
        },
        next: { revalidate: 60 }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch emojis');
    }

    const emojiResponse = await res.json() as EmojiResponse;
    return emojiResponse.emojis || [];
}

export async function getRelatedEmojis(slug: string, locale: string = 'en'): Promise<Emoji[]> {
    const res = await fetch(`${baseURL}?slug=${slug}&related=12&locale=${locale}`, {
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

export async function likeEmoji(slug: string): Promise<{ success: boolean, likes_count: number }> {
    const res = await fetch(`${baseURL}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slug })
    });

    if (!res.ok) {
        throw new Error('Failed to like emoji');
    }
    return res.json();
}

export async function genMoji(prompt: string, locale: string, image: string | null): Promise<EmojiResponse> {
    const res = await fetch(`${baseURL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, locale, image })
    });

    if (!res.ok) {
        throw new Error('Failed to generate emoji');
    }
    return res.json();
}