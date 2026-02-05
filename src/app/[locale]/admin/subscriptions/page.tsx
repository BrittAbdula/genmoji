"use client";

export const runtime = 'edge';

import { useCallback, useEffect, useMemo, useState } from "react";
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

interface AdminMember {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string | null;
    created_at: string;
  };
  subscription: {
    id: number;
    status: string;
    billing_cycle: string;
    amount: number;
    currency: string;
    current_period_start: string;
    current_period_end: string;
    cancelled_at?: string | null;
    created_at: string;
    plan: {
      id: number;
      name: string;
      daily_generation_limit: number;
      monthly_credit_limit?: number | null;
    };
  };
  latest_emojis: AdminEmoji[];
}

export default function AdminSubscriptionsPage() {
  const { isLoggedIn, user, token, checkAuth } = useAuthStore();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const limit = 20;

  const isAdmin = useMemo(() => {
    return !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const fetchMembers = useCallback(async (opts?: { append?: boolean; nextOffset?: number }) => {
    if (!token) return;
    const append = opts?.append || false;
    const nextOffset = opts?.nextOffset ?? 0;
    setLoading(true);
    setError(null);

    try {
      const endpoint = API_ENDPOINTS.ADMIN_SUBSCRIPTIONS || "/admin/subscriptions";
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('offset', nextOffset.toString());
      url.searchParams.set('emoji_limit', '5');
      if (query.trim()) url.searchParams.set('q', query.trim());

      const res = await fetch(url.toString(), {
        headers: getAuthHeaders(token),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Failed to fetch admin subscriptions');
      }

      const result = await res.json();
      const data = result?.data;
      const newMembers = data?.members || [];

      if (append) {
        setMembers((prev) => [...prev, ...newMembers]);
      } else {
        setMembers(newMembers);
      }

      const pagination = data?.pagination;
      setHasMore(!!pagination?.hasMore);
      setOffset(nextOffset);
      setTotal(pagination?.total || 0);
      setPage(Math.floor(nextOffset / limit) + 1);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to fetch admin subscriptions');
    } finally {
      setLoading(false);
    }
  }, [token, query, limit]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchMembers({ append: false, nextOffset: 0 });
    }
  }, [isLoggedIn, isAdmin, fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggedIn && isAdmin) {
      fetchMembers({ append: false, nextOffset: 0 });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePrevPage = () => {
    if (loading || page <= 1) return;
    const nextOffset = Math.max(0, offset - limit);
    fetchMembers({ append: false, nextOffset });
  };

  const handleNextPage = () => {
    if (loading || !hasMore) return;
    const nextOffset = offset + limit;
    fetchMembers({ append: false, nextOffset });
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Subscription Members</h1>
          <p className="text-muted-foreground">Latest subscriptions and recent emojis</p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email or name"
            className="h-10 rounded-md border px-3 text-sm bg-background"
          />
          <Button type="submit" variant="outline" disabled={loading}>
            Search
          </Button>
        </form>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {members.map((member) => (
          <div
            key={member.user.id}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                {member.user.avatar_url ? (
                  <img
                    src={member.user.avatar_url}
                    alt={member.user.name}
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted" />
                )}
                <div>
                  <div className="font-semibold">{member.user.name}</div>
                  <div className="text-sm text-muted-foreground">{member.user.email}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {member.subscription.plan.name} · {member.subscription.status} · {member.subscription.billing_cycle}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border/60 p-3">
              <div className="text-sm font-medium mb-2">User Info</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Registered: {new Date(member.user.created_at).toLocaleDateString()}</div>
                <div>Subscription since: {new Date(member.subscription.created_at).toLocaleDateString()}</div>
                <div>Plan: {member.subscription.plan.name}</div>
                <div>Status: {member.subscription.status}</div>
                <div>Cycle: {member.subscription.billing_cycle}</div>
                <div>Period end: {new Date(member.subscription.current_period_end).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">Recent Emojis</div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedUsers((prev) => ({
                        ...prev,
                        [member.user.id]: !prev[member.user.id],
                      }))
                    }
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {expandedUsers[member.user.id] ? "Collapse" : "Expand"}
                  </button>
                  <Link
                    href={`/admin/subscriptions/${member.user.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View user history
                  </Link>
                </div>
              </div>

              {expandedUsers[member.user.id] && (
                <>
                  {member.latest_emojis.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No recent emojis</div>
                  ) : (
                    <div className="space-y-3">
                      {member.latest_emojis.map((emoji, index) => (
                        <div
                          key={`${member.user.id}-${emoji.slug}-${index}`}
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
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-8">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {total} users
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePrevPage} variant="outline" disabled={loading || page <= 1}>
            Prev
          </Button>
          <Button onClick={handleNextPage} variant="outline" disabled={loading || !hasMore}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
