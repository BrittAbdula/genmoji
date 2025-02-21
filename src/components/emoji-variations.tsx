'use client';

import { useEffect, useState } from 'react';
import { Emoji } from '@/types/emoji';
import { getEmojisByBaseSlug } from '@/lib/api';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslations } from 'next-intl';

interface EmojiVariationsProps {
  currentEmoji: Emoji;
}

export function EmojiVariations({ currentEmoji }: EmojiVariationsProps) {
  const locale = useLocale();
  const [variations, setVariations] = useState<Emoji[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariations = async () => {
      try {
        setLoading(true);
        setError(null);
        const emojis = await getEmojisByBaseSlug(currentEmoji.slug, locale);
        setVariations(emojis);
        // Find the index of the current emoji
        const index = emojis.findIndex(emoji => emoji.slug === currentEmoji.slug);
        setCurrentIndex(index >= 0 ? index : 0);
      } catch (err) {
        console.error('Failed to fetch emoji variations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVariations();
  }, [currentEmoji.slug, locale]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + variations.length) % variations.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % variations.length);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || variations.length === 0) {
    return null;
  }

  if (variations.length === 1) {
    return null;
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <div className="relative">
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="absolute left-0 z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="relative w-64 h-64 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={variations[currentIndex].slug}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <img
                  src={variations[currentIndex].image_url}
                  alt={variations[currentIndex].prompt}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {variations.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 