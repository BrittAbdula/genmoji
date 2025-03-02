export type EmojiCategory = 
  | 'smileys_emotion'
  | 'people_body'
  | 'animals_nature'
  | 'food_drink'
  | 'travel_places'
  | 'activities'
  | 'objects'
  | 'symbols'
  | 'flags'
  | 'other';
  
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
  emojis?: Emoji[];
  error?: string;
}

export interface EmojiGroups {
  models: { name: string; translated_name: string; count?: number }[];
  categories: { name: string; translated_name: string; count?: number }[];
  colors: { name: string; translated_name: string; count?: number }[];
}

export interface Category {
  id?: string | number;
  name: string;
  translated_name: string;
  slug: string;
  count?: number;
}

export interface EmojiGridProps {
  emojis: Emoji[];
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export interface CategoryHeaderProps {
  category: string;
  totalCount?: number;
  description?: string;
}

export interface RelatedCategoriesProps {
  group: string;
  categories: Category[];
  currentCategory: string;
}

export interface FilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  selectedModel?: string | null;
} 