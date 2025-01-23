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