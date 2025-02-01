"use client";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AuroraText } from "@/components/ui/aurora-text";
import { easeInOutCubic } from "@/lib/animation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useState, useEffect } from "react";
import EmojiContainer from "@/components/emoji-container";
import { Emoji, EmojiResponse } from "@/types/emoji";
import { outfit } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [generatedEmoji, setGeneratedEmoji] = useState<Emoji | null>(null);
  const [recentEmojis, setRecentEmojis] = useState<Emoji[]>([]);
  const [progress, setProgress] = useState(0);

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
      const response = await fetch('https://gen.genmojionline.com?limit=36');
      const emojiResponse = await response.json() as EmojiResponse;
      if (emojiResponse.success && emojiResponse.emojis) {
        setRecentEmojis(emojiResponse.emojis);
      }
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

  const generateEmoji = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationStatus("Starting generation...");
    setProgress(0);
    
    try {
      const response = await fetch('https://gen.genmojionline.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      const emojiResponse = await response.json() as EmojiResponse;
      
      if (emojiResponse.success && emojiResponse.emoji) {
        setGeneratedEmoji(emojiResponse.emoji);
        triggerConfetti();
        fetchRecentEmojis();
        setPrompt("");
      } else {
        throw new Error(emojiResponse.error || 'Failed to generate emoji');
      }
    } catch (error) {
      console.error('Error:', error);
      setGenerationStatus("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 初始加载时获取最近的emoji
  useEffect(() => {
    fetchRecentEmojis();
  }, []);

  return (
    <Section id="hero" className="min-h-[50vh] w-full overflow-hidden">
      <div className="mx-auto max-w-5xl pt-8 sm:pt-12 text-center relative px-4">

        {/* Generated Emoji with Loading State */}
        <motion.div 
          className="mt-8 mb-6 max-w-[280px] mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
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
            <div className="relative w-full aspect-square flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse" />
              <AuroraText as="p" className="mt-4 text-lg font-medium max-w-[280px]">
                Start with a few words or a phrase that best describes your idea
              </AuroraText>
            </div>
          )}
        </motion.div>

        {/* Progress Bar */}
        {isGenerating && (
          <motion.div 
            className="max-w-xl mx-auto mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Progress value={progress} className="h-1" />
          </motion.div>
        )}

        {/* Generate Form */}
        <motion.div 
          className="max-w-xl mx-auto px-4 sm:px-0 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="e.g. 'a red cat with a hat'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 text-base"
              style={{ fontSize: '16px' }}
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
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </motion.div>

        {/* Recent Emojis Grid */}
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {recentEmojis.map((emoji) => (
            <EmojiContainer 
              key={emoji.slug} 
              emoji={emoji}
              size="sm"
            />
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
