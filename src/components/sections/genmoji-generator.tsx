"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import { useState, useEffect, useRef } from "react";
import EmojiContainer from "@/components/emoji-container";
import { Emoji, EmojiResponse } from "@/types/emoji";
import { outfit } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { ImageIcon, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getEmojis, genMoji } from '@/lib/api';

export function GenmojiGenerator() {
  const t = useTranslations('generator');
  const locale = useLocale();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [generatedEmoji, setGeneratedEmoji] = useState<Emoji | null>(null);
  const [recentEmojis, setRecentEmojis] = useState<Emoji[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progress animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev < 80) {
            return prev + (80 - prev) * 0.1; // Fast at start
          } else if (prev < 95) {
            return prev + (95 - prev) * 0.05; // Slower near end
          }
          return prev;
        });
      }, 100);
    } else {
      setProgress(100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGenerating]);

  // 获取最近生成的emoji
  const fetchRecentEmojis = async () => {
    try {
      const emojis = await getEmojis(0, 36, locale, { sort: 'quality', isIndexable: true });
      setRecentEmojis(emojis);
    } catch (error) {
      console.error('Error fetching recent emojis:', error);
    }
  };

  const triggerConfetti = () => {
    // 创建彩带效果
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateEmoji = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationStatus(t('generationStatus.starting'));
    setProgress(0);
    
    try {
      const emojiResponse = await genMoji(prompt.trim(),locale, selectedImage)
      
      if (emojiResponse.success && emojiResponse.emoji) {
        setGeneratedEmoji(emojiResponse.emoji);
        triggerConfetti();
        fetchRecentEmojis();
        setPrompt("");
        setSelectedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(emojiResponse.error || t('error.failed'));
      }
    } catch (error) {
      console.error('Error:', error);
      setGenerationStatus(t('error.failed'));
    } finally {
      setIsGenerating(false);
    }
  };

  // 初始加载时获取最近的emoji
  useEffect(() => {
    fetchRecentEmojis();
  }, []);

  return (
    <section id="genmoji-generator" className="min-h-[50vh] w-full overflow-hidden">
      <div className="mx-auto max-w-5xl text-center relative ">

        {/* Generated Emoji with Loading State */}
          {isGenerating ? (
            <div className="relative w-full aspect-square flex flex-col items-center justify-center">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />
                <div className="absolute inset-2 rounded-full border-2 border-t-primary border-primary/10 animate-spin" />
              </div>
            </div>
          ) : generatedEmoji ? (
            <EmojiContainer 
              emoji={generatedEmoji} 
              size="lg"
            />
          ) : (
            <div className="relative w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse" />
                {t('title')}
            </div>
          )}

        {/* Progress Bar */}
        {isGenerating && (
            <Progress value={progress} className="h-1" />
        )}

        {/* Generate Form */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder={t('placeholder')}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 text-base sm:text-base"
                style={{ fontSize: '16px' }}
                autoComplete="off"
                inputMode="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                    generateEmoji();
                  }
                }}
              />
              <Button
                onClick={generateEmoji}
                disabled={isGenerating || !prompt.trim()}
                className="sm:w-auto w-full"
              >
                {isGenerating ? t('generatingButton') : t('generateButton')}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {selectedImage ? t('changeImage') : t('uploadImage')}
              </Button>
              {selectedImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearSelectedImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {selectedImage && (
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>

        <h2 className={cn("col-span-full text-left mb-6 ml-4 text-2xl", outfit.className)}>
              {t('recentTitle')}
          </h2>
        {/* Recent Emojis Grid */}
        {/* <motion.div
            className="grid w-full auto-rows-max grid-cols-4 place-content-stretch justify-items-stretch gap-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {recentEmojis.map((emoji) => (
            <EmojiContainer 
              key={`recent-${emoji.slug}`} 
              emoji={emoji}
              size="sm"
            />
          ))}
        </motion.div> */}
      </div>
    </section>
  );
}
