export type EmojiCategory = 
  | 'smileys_emotion'
  | 'people_body'
  | 'animals_nature'
  | 'food_drink'
  | 'travel_places'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags';

export interface Emoji {
  id?: number;
  prompt: string;
  slug: string;
  base_slug: string;
  image_url: string;
  created_at: string;
  original_prompt?: string | null;
  is_public: boolean;
  ip?: string;
  locale: string;
  has_reference_image: boolean;
  model: string;
  category?: EmojiCategory;
  primary_color?: string;
  quality_score?: number;
  subject_count?: number;
  keywords?: string | string[];
  likes_count?: number;
}

export interface EmojiResponse {
  success: boolean;
  emoji?: Emoji;
  emojis: Emoji[];
  error?: string;
}
