"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Emoji } from "@/types/emoji";
import EmojiContainer from "@/components/emoji-container";
import { LoginDialog } from "@/components/login-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";

export const runtime = 'edge';

interface UserEmoji {
  id: number;
  slug: string;
  image_url: string;
  prompt: string;
  model: string;
  category: string;
  primary_color: string;
  created_at: string;
}

interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

export default function MyEmojisPage() {
  const t = useTranslations('my_emojis');
  const { isLoggedIn, user, token } = useAuthStore();
  const [emojis, setEmojis] = useState<UserEmoji[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();

  const fetchEmojis = async (offset = 0, append = false) => {
    if (!token) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/auth/my-emojis?limit=20&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch emojis');
      }

      const result = await response.json();
      
      if (result.success) {
        if (append) {
          setEmojis(prev => [...prev, ...result.data.emojis]);
        } else {
          setEmojis(result.data.emojis);
        }
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching emojis:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchEmojis();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, token]);

  const loadMore = () => {
    if (pagination && pagination.hasMore) {
      fetchEmojis(pagination.offset + pagination.limit, true);
    }
  };

  const convertToEmoji = (userEmoji: UserEmoji): Emoji => ({
    id: userEmoji.id,
    slug: userEmoji.slug,
    image_url: userEmoji.image_url,
    prompt: userEmoji.prompt,
    category: userEmoji.category as any,
    primary_color: userEmoji.primary_color,
    created_at: userEmoji.created_at,
    model: userEmoji.model,
    base_slug: userEmoji.slug,
    is_public: true,
    locale: 'en',
    has_reference_image: false,
    quality_score: 0,
  });

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <Heart className="mx-auto h-12 sm:h-16 w-12 sm:w-16 text-muted-foreground mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold mb-2">{t('title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
            {t('login_required')}
          </p>
          <LoginDialog>
            <Button className="w-full sm:w-auto">{t('login_to_view')}</Button>
          </LoginDialog>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{t('back')}</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{t('title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground hidden sm:block">{t('description')}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{t('back')}</span>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold truncate">{t('title')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {pagination ? t('emoji_count', { count: pagination.total }) : t('description')}
          </p>
        </div>
      </div>

      {emojis.length === 0 ? (
        <div className="text-center py-8 sm:py-12 max-w-md mx-auto">
          <Heart className="mx-auto h-12 sm:h-16 w-12 sm:w-16 text-muted-foreground mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">{t('no_emojis_title')}</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 px-4">
            {t('no_emojis_description')}
          </p>
          <Link href="/">
            <Button className="w-full sm:w-auto">{t('create_first_emoji')}</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {emojis.map((userEmoji) => (
              <EmojiContainer
                key={userEmoji.id}
                emoji={convertToEmoji(userEmoji)}
                size="md"
              />
            ))}
          </div>

          {pagination && pagination.hasMore && (
            <div className="text-center mt-6 sm:mt-8">
              <Button 
                onClick={loadMore} 
                disabled={loadingMore}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {loadingMore ? t('loading_more') : t('load_more')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 