import { Emoji, EmojiResponse } from "@/types/emoji";
import { ActionType, ActionDetails, ActionResponse } from "@/types/action";

const WORKER_URL = 'https://genmoji-api.genmojionline.com';
// const WORKER_URL = 'https://gen-test.auroroa.workers.dev';

// 1. 获取单个表情
export async function getEmoji(slug: string, locale: string): Promise<Emoji> {
  const url = `${WORKER_URL}/genmoji/by-slug/${slug}?locale=${locale}`;
  // console.log('--------getEmojiurl', url);
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Failed to fetch emoji:', {
        url,
        status: res.status,
        statusText: res.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch emoji: ${res.status} ${res.statusText} - ${errorText}`);
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
export async function getEmojis(
  offset: number, 
  limit: number, 
  locale: string, 
  options?: {
    model?: string;
    category?: string;
    color?: string;
    sort?: 'latest' | 'popular' | 'quality';
    q?: string;
  }
): Promise<Emoji[]> {
  const { model, category, color, sort, q } = options || {};
  const url = new URL(q ? '/genmoji/search' : '/genmoji/list', WORKER_URL);
  
  // 设置基础参数
  url.searchParams.set('offset', offset.toString());
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('locale', locale);
  
  // 设置可选参数
  if (q) url.searchParams.set('q', q);
  if (model) url.searchParams.set('model', model);
  if (category) url.searchParams.set('category', category);
  if (color) url.searchParams.set('color', color);
  if (sort) url.searchParams.set('sort', sort);
  
  // console.log("API Request URL:", url.toString());
  
  const res = await fetch(url, {
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
  const url = `${WORKER_URL}/genmoji/related/${slug}?locale=${locale}&limit=16`;

  const res = await fetch(url, {
    next: { revalidate: 120 }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch related emojis');
  }

  const emojiResponse = await res.json() as EmojiResponse;
  return emojiResponse.emojis || [];
}

// 4. 点赞表情
export async function toggleLike(slug: string, locale: string): Promise<{ success: boolean; data?: { liked: boolean } }> {
  const res = await fetch(`${WORKER_URL}/action/${slug}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      locale
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Like error:', {
      status: res.status,
      statusText: res.statusText,
      error: errorText
    });
    throw new Error(errorText);
  }
  return res.json();
}

// 5. 执行表情操作（评分、举报等）
export async function performAction(
  slug: string,
  locale: string,
  actionType: ActionType,
  details?: ActionDetails
): Promise<ActionResponse> {
  const res = await fetch(`${WORKER_URL}/action/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action_type: actionType,
      locale,
      details
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Action error:', {
      status: res.status,
      statusText: res.statusText,
      error: errorText
    });
    throw new Error(`Failed to perform action: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// 6. 生成新表情
export async function genMoji(
  prompt: string, 
  locale: string, 
  image: string | null, 
  model: 'genmoji' | 'sticker' | 'mascot' = 'genmoji'
): Promise<EmojiResponse> {
  const res = await fetch(`${WORKER_URL}/genmoji/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt, locale, image, model })
  });

  if (!res.ok) {
    throw new Error('Failed to generate emoji');
  }
  return res.json();
}

// 4. 获取同一base slug的表情
export async function getEmojisByBaseSlug(
  slug: string,
  locale: string,
  limit: number = 20,
  offset: number = 0
): Promise<Emoji[]> {
  const baseSlug = slug.split('--')[0];
  const url = `${WORKER_URL}/genmoji/by-base-slug/${baseSlug}?locale=${locale}&limit=${limit}&offset=${offset}`;

  const res = await fetch(url, {
    next: { revalidate: 180 }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch emojis by base slug');
  }

  const emojiResponse = await res.json() as EmojiResponse;
  return emojiResponse.emojis || [];
}

// 7. 获取分组数据（模型、分类、颜色）
export async function getEmojiGroups(locale: string): Promise<{
  models: { name: string; translated_name: string; count?: number }[];
  categories: { name: string; translated_name: string; count?: number }[];
  colors: { name: string; translated_name: string; count?: number }[];
}> {
  const url = `${WORKER_URL}/genmoji/groups?locale=${locale}`;
  
  const res = await fetch(url, {
    next: { revalidate: 86400 } // 缓存24小时
  });

  if (!res.ok) {
    throw new Error('Failed to fetch emoji groups');
  }

  const response = await res.json() as {
    success: boolean;
    error?: string;
    data?: {
      models: { name: string; translated_name: string; count?: number }[];
      categories: { name: string; translated_name: string; count?: number }[];
      colors: { name: string; translated_name: string; count?: number }[];
    }
  };
  // console.log("API Request URL:", response.data);
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch emoji groups');
  }
  
  return response.data || { models: [], categories: [], colors: [] };
}