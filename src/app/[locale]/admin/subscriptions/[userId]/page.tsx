"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

const ADMIN_EMAIL = "auroroa@gmail.com";

interface AdminEmoji {
  slug: string;
  image_url: string;
  prompt: string;
  created_at: string;
  model: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  created_at: string;
}

export default function AdminSubscriptionUserPage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const { isLoggedIn, user, token, checkAuth } = useAuthStore();
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);
  const [emojis, setEmojis] = useState<AdminEmoji[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const limit = 30;

  const isAdmin = useMemo(() => {
    return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchEmojis = useCallback(async (opts?: { append?: boolean; nextOffset?: number }) => {
    if (!token || !userId) return;
    const append = opts?.append || false;
    const nextOffset = opts?.nextOffset ?? 0;
    setLoading(true);
    setError(null);

    try {
      const endpoint = API_ENDPOINTS.ADMIN_USER_EMOJIS
        ? API_ENDPOINTS.ADMIN_USER_EMOJIS(userId)
        : `/admin/subscriptions/${userId}/emojis`;
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      url.searchParams.set("limit", limit.toString());
      url.searchParams.set("offset", nextOffset.toString());

      const res = await fetch(url.toString(), {
        headers: getAuthHeaders(token),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Failed to fetch user emojis");
      }

      const result = await res.json();
      const data = result?.data;
      const newEmojis = data?.emojis || [];

      setTargetUser(data?.user || null);
      setEmojis((prev) => (append ? [...prev, ...newEmojis] : newEmojis));

      const pagination = data?.pagination;
      setHasMore(!!pagination?.hasMore);
      setOffset(nextOffset);
      setTotal(pagination?.total || 0);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to fetch user emojis");
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchEmojis({ append: false, nextOffset: 0 });
    }
  }, [isLoggedIn, isAdmin, fetchEmojis]);

  const handleLoadMore = () => {
    if (loading || !hasMore) return;
    const nextOffset = offset + limit;
    fetchEmojis({ append: true, nextOffset });
  };

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-2">Admin</h1>
        <p className="text-muted-foreground">Please log in to view this page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-2">Admin</h1>
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Emoji History</h1>
          <p className="text-muted-foreground">Total {total} emojis</p>
        </div>
        <Link href="/admin/subscriptions" className="text-sm text-primary hover:underline">
          Back to subscriptions
        </Link>
      </div>

      {targetUser && (
        <div className="mb-6 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-3">
            {targetUser.avatar_url ? (
              <img
                src={targetUser.avatar_url}
                alt={targetUser.name}
                className="h-12 w-12 rounded-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-muted" />
            )}
            <div>
              <div className="font-semibold">{targetUser.name}</div>
              <div className="text-sm text-muted-foreground">{targetUser.email}</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {emojis.map((emoji, index) => (
          <div
            key={`${emoji.slug}-${index}`}
            className="flex items-center gap-3 rounded-md border border-border/60 bg-card/50 px-3 py-2"
          >
            <Link
              href={`/emoji/${emoji.slug}`}
              className="h-12 w-12 flex-shrink-0 rounded-md border border-border/60 bg-muted/30 p-1"
              title={emoji.prompt}
            >
              <img
                src={emoji.image_url}
                alt={emoji.prompt}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{emoji.prompt}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(emoji.created_at).toLocaleString()}
              </div>
            </div>
            <Link
              href={`/emoji/${emoji.slug}`}
              className="text-xs text-primary hover:underline"
            >
              Open
            </Link>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} variant="outline" disabled={loading}>
            {loading ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
