export interface Emoji {
  prompt: string;
  slug: string;
  image_url: string;
  created_at?: string;
  likes_count?: number;
  locale: string;
}

export interface EmojiResponse {
  success: boolean;
  emoji?: Emoji;
  emojis: Emoji[];
  error?: string;
}
