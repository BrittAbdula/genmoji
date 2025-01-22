"use client";

import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NeonCard } from "@/components/ui/neon-card";
import { easeInOutCubic } from "@/lib/animation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useState } from "react";
import EmojiContainer from "@/components/emoji-container";

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  const [generatedEmoji, setGeneratedEmoji] = useState<string | null>(null);
  const [recentEmojis, setRecentEmojis] = useState<Array<{
    image_url: string;
    prompt: string;
    slug: string;
  }>>([]);

  // 获取最近生成的emoji
  const fetchRecentEmojis = async () => {
    try {
      const response = await fetch('https://gen.genmojionline.com?limit=8');
      const data = await response.json();
      if (data.success && data.emojis) {
        setRecentEmojis(data.emojis);
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

      const data = await response.json();
      
      if (data.success && data.storedImageUrl) {
        setGeneratedEmoji(data.storedImageUrl);
        triggerConfetti();
        fetchRecentEmojis();
        setPrompt("");
      } else {
        throw new Error(data.error || 'Failed to generate emoji');
      }
    } catch (error) {
      console.error('Error:', error);
      setGenerationStatus("Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 初始加载时获取最近的emoji
  useState(() => {
    fetchRecentEmojis();
  });

  return (
    <Section id="hero" className="min-h-[50vh] w-full overflow-hidden">
      <div className="mx-auto max-w-5xl pt-8 sm:pt-12 text-center relative px-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: easeInOutCubic }}
          className="text-4xl sm:text-5xl font-bold tracking-tighter mb-4"
        >
          Genmoji Online
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: easeInOutCubic }}
          className="text-sm text-muted-foreground  mb-8"
        >
          Create your own custom emoji to express yourself.
        </motion.p>

        {/* Generate Form */}
        <motion.div 
          className="max-w-xl mx-auto px-4 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Describe your emoji (e.g. 'shark with tophat')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                  generateEmoji();
                }
              }}
            />
            <Button
              onClick={generateEmoji}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </motion.div>

        {/* Generated Emoji with Loading State */}
        {(isGenerating || generatedEmoji) && (
          <motion.div 
            className="mt-8 max-w-[200px] mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {isGenerating ? (
              <div className="relative w-full aspect-square rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-xl border border-primary/10">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse" />
                    <div className="absolute inset-2 rounded-full border-2 border-t-primary border-primary/10 animate-spin" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{generationStatus}</p>
                </div>
              </div>
            ) : (
              <EmojiContainer 
                src={generatedEmoji!} 
                alt="Generated emoji"
              />
            )}
          </motion.div>
        )}

        {/* Recent Emojis Grid */}
        <motion.div
          className="grid grid-cols-4 sm:grid-cols-6 gap-4 mt-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {recentEmojis.map((emoji) => (
            <EmojiContainer 
              key={emoji.slug} 
              src={emoji.image_url} 
              alt={emoji.prompt}
            />
          ))}
        </motion.div>
      </div>
    </Section>
  );
}
