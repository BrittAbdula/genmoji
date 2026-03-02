"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Emoji } from "@/types/emoji";
import EmojiContainer from "@/components/emoji-container";
import { LoginDialog } from "@/components/login-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeft, Check, CheckSquare, Trash2, X } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '@/lib/api-config';
import { cn } from "@/lib/utils";

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
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
}

interface PaginationInfo {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

interface FeedbackState {
  type: 'success' | 'error';
  text: string;
}

export default function MyEmojisPage() {
  const t = useTranslations('my_emojis');
  const { isLoggedIn, token } = useAuthStore();
  const [emojis, setEmojis] = useState<UserEmoji[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedEmojiIds, setSelectedEmojiIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const router = useRouter();

  const fetchEmojis = async (offset = 0, append = false) => {
    if (!token) return;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH_MY_EMOJIS}?limit=20&offset=${offset}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(token),
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

  useEffect(() => {
    setSelectedEmojiIds((prev) => {
      if (prev.length === 0) return prev;
      const visibleIds = new Set(emojis.map((emoji) => emoji.id));
      const next = prev.filter((id) => visibleIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [emojis]);

  useEffect(() => {
    if (!feedback) return;
    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  useEffect(() => {
    if (!selectionMode) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectionMode(false);
        setSelectedEmojiIds([]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectionMode]);

  // Auto-refresh when there are pending/processing emojis
  useEffect(() => {
    const hasPending = emojis.some(e => e.status === 'pending' || e.status === 'processing');
    if (!hasPending || !isLoggedIn || !token || selectionMode || deleting) return;

    // Poll every 10 seconds for updates
    const intervalId = setInterval(() => {
      fetchEmojis(0, false);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [emojis, isLoggedIn, token, selectionMode, deleting]);

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
    is_indexable: false,
    status: userEmoji.status,
    error_message: userEmoji.error_message,
  });

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedEmojiIds([]);
      return;
    }
    setFeedback(null);
    setSelectionMode(true);
  };

  const toggleEmojiSelection = (emojiId: number) => {
    setSelectedEmojiIds((prev) => {
      if (prev.includes(emojiId)) {
        return prev.filter((id) => id !== emojiId);
      }
      return [...prev, emojiId];
    });
  };

  const handleDeleteSelected = async () => {
    if (!token || selectedEmojiIds.length === 0 || deleting) return;

    const confirmed = window.confirm(
      t('delete_confirm', { count: selectedEmojiIds.length })
    );
    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_MY_EMOJIS}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ emojiIds: selectedEmojiIds }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Failed to delete emojis');
      }

      const deletedCount = Number(result?.data?.deletedCount) || 0;
      setSelectionMode(false);
      setSelectedEmojiIds([]);
      setFeedback({
        type: 'success',
        text: t('delete_success', { count: deletedCount || selectedEmojiIds.length }),
      });
      await fetchEmojis(0, false);
    } catch (error) {
      console.error('Error deleting emojis:', error);
      setFeedback({
        type: 'error',
        text: t('delete_failed'),
      });
    } finally {
      setDeleting(false);
    }
  };

  const allLoadedSelected =
    emojis.length > 0 && selectedEmojiIds.length === emojis.length;
  const emojiGridClasses =
    "grid grid-cols-[repeat(2,minmax(0,9rem))] sm:grid-cols-[repeat(3,minmax(0,9rem))] md:grid-cols-[repeat(4,minmax(0,9rem))] lg:grid-cols-[repeat(6,minmax(0,9rem))] justify-center gap-3 sm:gap-4";

  const toggleSelectAllLoaded = () => {
    if (allLoadedSelected) {
      setSelectedEmojiIds([]);
      return;
    }
    setSelectedEmojiIds(emojis.map((emoji) => emoji.id));
  };

  const renderEmojiContent = (userEmoji: UserEmoji) => {
    const emoji = convertToEmoji(userEmoji);
    const isIncomplete =
      emoji.status === 'pending' ||
      emoji.status === 'processing' ||
      emoji.status === 'failed';

    if (selectionMode) {
      return (
        <div className="pointer-events-none">
          <EmojiContainer emoji={emoji} size="md" />
        </div>
      );
    }

    if (isIncomplete) {
      return (
        <Link href={`/emoji/${emoji.slug}`} className="block">
          <EmojiContainer emoji={emoji} size="md" />
        </Link>
      );
    }

    return <EmojiContainer emoji={emoji} size="md" />;
  };

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
        
        <div className={emojiGridClasses}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("container mx-auto px-4 py-4 sm:py-8", selectionMode && "pb-24 sm:pb-8")}>
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

      {feedback && (
        <div
          role="status"
          className={cn(
            "mb-4 rounded-lg border px-3 py-2 text-sm",
            feedback.type === 'success'
              ? "border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          )}
        >
          {feedback.text}
        </div>
      )}

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
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant={selectionMode ? "secondary" : "outline"}
              size="sm"
              onClick={toggleSelectionMode}
              disabled={deleting}
              className="min-h-11"
            >
              <CheckSquare className="h-4 w-4" />
              {selectionMode ? t('cancel_selection') : t('select')}
            </Button>

            {selectionMode && (
              <>
                <span className="inline-flex min-h-11 items-center rounded-md border border-border bg-muted/20 px-3 text-sm text-muted-foreground">
                  {t('selected_count', { count: selectedEmojiIds.length })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAllLoaded}
                  disabled={deleting}
                  className="hidden min-h-11 sm:inline-flex"
                >
                  <CheckSquare className="h-4 w-4" />
                  {allLoadedSelected ? t('clear_selection') : t('select_all_loaded')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={selectedEmojiIds.length === 0 || deleting}
                  className="hidden min-h-11 sm:inline-flex"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? t('deleting') : t('delete_selected')}
                </Button>
              </>
            )}
          </div>

          <div className={emojiGridClasses}>
            {emojis.map((userEmoji) => {
              if (!selectionMode) {
                return (
                  <div key={userEmoji.id}>
                    {renderEmojiContent(userEmoji)}
                  </div>
                );
              }

              const selected = selectedEmojiIds.includes(userEmoji.id);
              return (
                <button
                  key={userEmoji.id}
                  type="button"
                  onClick={() => toggleEmojiSelection(userEmoji.id)}
                  disabled={deleting}
                  aria-pressed={selected}
                  aria-label={
                    selected
                      ? t('deselect_emoji', { prompt: userEmoji.prompt })
                      : t('select_emoji', { prompt: userEmoji.prompt })
                  }
                  className={cn(
                    "relative w-full rounded-lg text-left",
                    "appearance-none border-0 bg-transparent p-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
                    deleting && "opacity-70"
                  )}
                >
                  {renderEmojiContent(userEmoji)}
                  <span
                    className={cn(
                      "absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-background/90",
                      selected
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-border text-transparent"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>

          {pagination && pagination.hasMore && (
            <div className="text-center mt-6 sm:mt-8">
              <Button 
                onClick={loadMore} 
                disabled={loadingMore || deleting}
                variant="outline"
                className="w-full sm:w-auto min-h-11"
              >
                {loadingMore ? t('loading_more') : t('load_more')}
              </Button>
            </div>
          )}

          {selectionMode && (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur sm:hidden">
              <div className="mx-auto flex w-full max-w-md items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={toggleSelectionMode}
                  disabled={deleting}
                  className="min-h-11 px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleSelectAllLoaded}
                  disabled={deleting}
                  className="min-h-11 flex-1"
                >
                  {allLoadedSelected ? t('clear_selection') : t('select_all_loaded')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  disabled={selectedEmojiIds.length === 0 || deleting}
                  className="min-h-11 flex-1"
                >
                  {deleting ? t('deleting') : t('delete_selected')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 
