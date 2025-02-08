"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { outfit } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { AuroraText } from "@/components/ui/aurora-text";
import EmojiContainer from "@/components/emoji-container";
import { Emoji, EmojiResponse } from "@/types/emoji";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";

export function GalleryContent() {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 48;

  const fetchEmojis = async (pageNum: number, query: string = "") => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((pageNum - 1) * limit).toString(),
      });
      
      if (query) {
        params.append('q', query);
      }

      const response = await fetch(`https://gen.genmojionline.com?${params}`);
      const emojiResponse = await response.json() as EmojiResponse;
      if (emojiResponse.success) {
        if (pageNum === 1) {
          setEmojis(emojiResponse.emojis || []);
        } else {
          setEmojis(prev => [...prev, ...(emojiResponse.emojis || [])]);
        }
        setHasMore(emojiResponse.emojis?.length === limit);
      }
    } catch (error) {
      console.error('Error fetching emojis:', error);
      setEmojis([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEmojis([]); // Clear existing emojis before new search
    setPage(1);
    setLoading(true);
    fetchEmojis(1, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchEmojis(page, searchQuery);
    }
  }, [page]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const renderContent = () => {
    if (loading && page === 1) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`loading-skeleton-${i}`} className="aspect-square rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      );
    }

    if (emojis.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No emojis found</p>
        </div>
      );
    }

    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-8"
        >
          {emojis.map((emoji, index) => (
            <EmojiContainer
              key={`${emoji.slug}-${index}`}
              emoji={emoji}
              size="md"
            />
          ))}
        </motion.div>

        {hasMore && (
          <div className="mt-12 text-center">
            <Button
              onClick={loadMore}
              disabled={loading}
              variant="outline"
              size="lg"
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className={cn("text-4xl font-bold mb-4", outfit.className)}>
          <AuroraText>Genmoji Gallery</AuroraText>
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Explore our collection of AI-generated emojis
        </p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </motion.div>

      {renderContent()}
    </div>
  );
} 