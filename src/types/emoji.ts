export interface Emoji {
  id?: number;
  prompt: string;
  slug: string;
  image_url: string;
  created_at?: string;
}

export interface EmojiResponse {
  success: boolean;
  emoji?: Emoji;
  emojis?: Emoji[];
  error?: string;
}

// 添加工厂函数来处理 Emoji 对象的创建
export function createEmoji(data: Partial<Emoji>): Emoji {
  const { image_url, ...rest } = data;
  return {
    ...rest,
    image_url: getOptimizedImageUrl(image_url || ''),
  } as Emoji;
}

// 添加工厂函数来处理 EmojiResponse
export function createEmojiResponse(data: any): EmojiResponse {
  if (!data.success) {
    return data as EmojiResponse;
  }

  return {
    success: true,
    emoji: data.emoji ? createEmoji(data.emoji) : undefined,
    emojis: data.emojis ? data.emojis.map(createEmoji) : undefined,
    error: data.error,
  };
}

// 图片URL优化函数
function getOptimizedImageUrl(url: string, width: number = 800): string {
  if (!url || !url.includes('store.genmojionline.com')) {
    return url;
  }

  const baseUrl = 'https://store.genmojionline.com/';
  const imagePath = url.replace(baseUrl, '');
  
  return `${baseUrl}cdn-cgi/image/format=webp,width=${width}/${imagePath}`;
} 