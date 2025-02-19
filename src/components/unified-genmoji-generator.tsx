"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AuroraText } from "@/components/ui/aurora-text";
import { useState, useEffect, useRef } from "react";
import { genMoji } from "@/lib/api";
import { Emoji } from "@/types/emoji";
import { ImageIcon, X } from 'lucide-react';
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import EmojiContainer from "@/components/emoji-container";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useGenerationStore } from "@/store/generation-store";

interface UnifiedGenmojiGeneratorProps {
  trigger?: React.ReactNode;
  initialPrompt?: string;
  onGenerated?: (emoji: Emoji) => void;
  mode?: 'inline' | 'modal';
}

export function UnifiedGenmojiGenerator({
  trigger,
  initialPrompt = "",
  onGenerated,
  mode = 'modal'
}: UnifiedGenmojiGeneratorProps) {
  const router = useRouter();
  const t = useTranslations('generator');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(mode === 'inline');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedEmoji, setGeneratedEmoji] = useState<Emoji | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { isGenerating, progress, setGenerating, setProgress, setPrompt: setGlobalPrompt } = useGenerationStore();

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      intervalId = setInterval(() => {
        setProgress((prev: number) => {
          if (prev < 80) {
            return prev + (80 - prev) * 0.1;
          } else if (prev < 95) {
            return prev + (95 - prev) * 0.05;
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
  }, [isGenerating, setProgress]);

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

  const triggerConfetti = () => {
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
    fire(0.2, { spread: 60 });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
  };

  const generateEmoji = async () => {
    if (!prompt.trim()) return;
    
    setGenerating(true);
    setProgress(0);
    setGlobalPrompt(prompt.trim());
    setIsOpen(false);
    
    try {
      const emojiResponse = await genMoji(prompt.trim(), locale, selectedImage);
      
      if (emojiResponse.success && emojiResponse.emoji) {
        setGeneratedEmoji(emojiResponse.emoji);
        triggerConfetti();
        
        if (onGenerated) {
          onGenerated(emojiResponse.emoji);
        } else {
          router.push(`/emoji/${emojiResponse.emoji.slug}`);
        }
        
        if (mode === 'modal') {
          setIsOpen(false);
        } else {
          setPrompt("");
          setSelectedImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } else {
        throw new Error(emojiResponse.error || t('error.failed'));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const content = (
    <div className="grid gap-4 py-4">
      {isGenerating && (
        <div className="w-full">
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {mode === 'inline' && generatedEmoji && (
        <motion.div 
          className="mb-6 max-w-[280px] mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <EmojiContainer 
            emoji={generatedEmoji} 
            size="lg"
          />
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <div className={cn(
          "relative flex flex-col w-full rounded-lg border bg-muted/50",
          mode === 'inline' && "border-muted-foreground/20"
        )}>
          <Textarea
            placeholder={t('placeholder')}
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isGenerating) {
                e.preventDefault();
                generateEmoji();
              }
            }}
            rows={2}
            className={cn(
              "resize-none min-h-[80px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              mode === 'inline' && "text-lg"
            )}
          />
          
          {selectedImage && (
            <div className="px-3 pb-2">
              <div className="relative w-20 h-20 rounded-md overflow-hidden border bg-muted">
                <img
                  src={selectedImage}
                  alt="Selected reference"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-2 border-t">
            <div className="flex items-center gap-0.5">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>

            <Button
              onClick={generateEmoji}
              disabled={isGenerating || !prompt.trim()}
              size={mode === 'inline' ? 'default' : 'sm'}
              className={cn(
                "rounded-md",
                "px-8 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
              )}
            >
              {isGenerating ? t('generatingButton') : t('generateButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mode === 'inline' ? (
        content
      ) : isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            {trigger}
          </DrawerTrigger>
          <DrawerContent className="px-0">
            <DrawerHeader className="px-6">
              <DrawerTitle>{t('dialogTitle')}</DrawerTitle>
              <DrawerDescription>
                {t('dialogDescription')}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6 pb-8">
              {content}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('dialogDescription')}
              </DialogDescription>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 