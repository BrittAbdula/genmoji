import { Emoji, EmojiResponse } from "@/types/emoji";
import { ActionType, ActionDetails, ActionResponse } from "@/types/action";
import { 
  API_BASE_URL,
  API_ENDPOINTS,
  getApiUrl,
  DEFAULT_HEADERS,
  getAuthHeaders
} from "@/lib/api-config";

// 自定义错误类用于处理生成限制
export class GenerationLimitError extends Error {
  status: number = 429;
  details: {
    currentCount: number;
    limit: number;
    resetTime: string;
    type?: 'monthly' | 'daily';
  };

  constructor(message: string, details: any) {
    super(message);
    this.name = 'GenerationLimitError';
    this.details = details;
  }
}

// 1. 获取单个表情
export async function getEmoji(slug: string, locale: string): Promise<Emoji> {
  const url = getApiUrl(API_ENDPOINTS.EMOJI_BY_SLUG(slug), locale);
  // console.log('--------getEmojiurl', url);
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: DEFAULT_HEADERS
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

// 2. 获取表情列表
export async function getEmojis(
  offset: number, 
  limit: number, 
  locale: string, 
  options?: {
    model?: string;
    category?: string;
    color?: string;
    sort?: 'latest' | 'popular' | 'quality';
    isIndexable?: boolean;
  }
): Promise<Emoji[]> {
  const { model, category, color, sort, isIndexable } = options || {};
  const endpoint = API_ENDPOINTS.EMOJI_LIST;
  const url = new URL(endpoint, API_BASE_URL);
  
  // 设置基础参数
  url.searchParams.set('offset', offset.toString());
  url.searchParams.set('limit', limit.toString());
  url.searchParams.set('locale', locale);
  
  // 设置可选参数
  if (model) url.searchParams.set('model', model);
  if (category) url.searchParams.set('category', category);
  if (color) url.searchParams.set('color', color);
  if (sort) url.searchParams.set('sort', sort);
  if (isIndexable !== undefined) url.searchParams.set('is_indexable', isIndexable.toString());
  
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
  const baseUrl = getApiUrl(API_ENDPOINTS.EMOJI_RELATED(slug), locale);
  const url = `${baseUrl}&limit=16`;

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
  const url = `${API_BASE_URL}${API_ENDPOINTS.ACTION_LIKE(slug)}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
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
  const url = `${API_BASE_URL}${API_ENDPOINTS.ACTION_GENERAL(slug)}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
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
  model: string = 'genmoji',
  token?: string | null,
  options?: { styleId?: string | null; emotion?: string | null }
): Promise<EmojiResponse> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.EMOJI_GENERATE}`;
  const headers = token ? getAuthHeaders(token) : DEFAULT_HEADERS;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, locale, image, model, styleId: options?.styleId ?? null, emotion: options?.emotion ?? null })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    
    // 处理 429 状态码 - 达到生成限制/credits
    if (res.status === 429) {
      const message = errorData?.error || 'Generation limit exceeded';
      throw new GenerationLimitError(message, errorData?.details || {});
    }
    
    throw new Error(errorData?.error || 'Failed to generate emoji');
  }
  return res.json();
}

// 7. 获取同一base slug的表情
export async function getEmojisByBaseSlug(
  slug: string,
  locale: string,
  limit: number = 20,
  offset: number = 0
): Promise<Emoji[]> {
  const baseSlug = slug.split('--')[0];
  const baseUrl = getApiUrl(API_ENDPOINTS.EMOJI_BY_BASE_SLUG(baseSlug), locale);
  const url = `${baseUrl}&limit=${limit}&offset=${offset}`;

  const res = await fetch(url, {
    next: { revalidate: 180 }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch emojis by base slug');
  }

  const emojiResponse = await res.json() as EmojiResponse;
  return emojiResponse.emojis || [];
}

// 8. 获取分组数据（模型、分类、颜色）
export async function getEmojiGroups(locale: string): Promise<{
  models: { name: string; translated_name: string; count?: number }[];
  categories: { name: string; translated_name: string; count?: number }[];
  colors: { name: string; translated_name: string; count?: number }[];
}> {
  const url = getApiUrl(API_ENDPOINTS.EMOJI_GROUPS, locale);
  
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

// 8. 上传图片
export async function uploadImage(
  file: File,
  token?: string | null
): Promise<{ success: boolean; image_url?: string; error?: string }> {
  // Use server-side proxy to keep API key secret
  const url = `${API_BASE_URL}${API_ENDPOINTS.UPLOAD_STREAM_PROXY}`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadPath', 'images/user-uploads');
  if (file?.name) formData.append('fileName', file.name);

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { method: 'POST', headers, body: formData });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => '');
    return { success: false, error: `Upload failed: ${res.status} ${res.statusText} ${text}` };
  }
  if (!res.ok || !data?.success) {
    return { success: false, error: data?.error || data?.msg || `${res.status} ${res.statusText}` };
  }
  return { success: true, image_url: data?.image_url };
}

// 订阅相关 API 函数

// 获取订阅计划
export async function getSubscriptionPlans(): Promise<{
  success: boolean;
  plans: Array<{
    id: number;
    name: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    features: string[];
    daily_generation_limit: number;
    is_active: boolean;
  }>;
}> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SUBSCRIPTION_PLANS}`;
  
  const res = await fetch(url, {
    headers: DEFAULT_HEADERS
  });

  if (!res.ok) {
    throw new Error('Failed to fetch subscription plans');
  }
  
  return res.json();
}

// 获取用户订阅状态
export async function getSubscriptionStatus(token: string): Promise<{
  success: boolean;
  data: {
    subscription: any;
    usage: {
      type: 'monthly' | 'daily';
      current: number;
      limit: number;
      resetTime: string;
    }
  };
}> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SUBSCRIPTION_STATUS}`;
  
  const res = await fetch(url, {
    headers: getAuthHeaders(token)
  });

  if (!res.ok) {
    throw new Error('Failed to fetch subscription status');
  }
  
  return res.json();
}

// 创建订阅
export async function createSubscription(
  planId: number,
  billingCycle: 'monthly' | 'yearly',
  token: string
): Promise<{
  success: boolean;
  data: {
    checkoutUrl: string;
    planId: number;
    billingCycle: string;
    amount: number;
  };
}> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SUBSCRIPTION_CREATE}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ planId, billingCycle })
  });

  if (!res.ok) {
    throw new Error('Failed to create subscription');
  }
  
  return res.json();
}

// 取消订阅
export async function cancelSubscription(token: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.SUBSCRIPTION_CANCEL}`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(token)
  });

  if (!res.ok) {
    throw new Error('Failed to cancel subscription');
  }
  
  return res.json();
}
