import { Emoji, EmojiResponse } from "@/types/emoji";

const WORKER_URL = 'https://genmoji-api.genmojionline.com';
// const WORKER_URL = 'https://gen-test.auroroa.workers.dev';

// 1. 获取单个表情
export async function getEmoji(slug: string, locale: string): Promise<Emoji> {
  const url = `${WORKER_URL}/emoji/by-slug/${slug}?locale=${locale}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Origin': 'https://genmojionline.com'
      },
      next: { revalidate: 3600 }
    });
    
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
    
    if (!emojiResponse.success || !emojiResponse.emoji) {
      console.error('Invalid emoji response:', emojiResponse);
      throw new Error('Emoji not found');
    }
    
    return emojiResponse.emoji;
  } catch (error) {
    console.error('Error in getEmoji:', error);
    throw error;
  }
}

// 2. 获取表情列表或搜索
export async function getEmojis(offset: number, limit: number, locale: string, q?: string): Promise<Emoji[]> {
  const url = new URL(q ? '/emoji/search' : '/emoji/list', WORKER_URL);
  url.searchParams.set('offset', offset.toString());
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('locale', locale);
  if (q) url.searchParams.set('q', q);

  const res = await fetch(url, {
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

// 3. 获取相关表情
export async function getRelatedEmojis(slug: string, locale: string): Promise<Emoji[]> {
  const url = `${WORKER_URL}/emoji/related/${slug}?locale=${locale}&limit=16`;
  
  const res = await fetch(url, {
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

// 4. 点赞表情
export async function likeEmoji(slug: string, locale: string): Promise<{ success: boolean, likes_count: number }> {
  const res = await fetch(`${WORKER_URL}/action/${slug}`, {
    method: 'POST',
    headers: {
      'Origin': 'https://genmojionline.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      action_type: 'like',
      locale 
    })
  });

  if (!res.ok) {
    throw new Error('Failed to like emoji');
  }
  return res.json();
}

// 5. 生成新表情
export async function genMoji(prompt: string, locale: string, image: string | null): Promise<EmojiResponse> {
  const res = await fetch(`${WORKER_URL}/emoji/generate`, {
    method: 'POST',
    headers: {
      'Origin': 'https://genmojionline.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, locale, image })
  });

  if (!res.ok) {
    throw new Error('Failed to generate emoji');
  }
  return res.json();
}